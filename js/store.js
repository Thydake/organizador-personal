/*
 * Capa de datos del organizador.
 * Guarda todo en localStorage. Cada elemento lleva `source` ('local' o el id
 * de una integración) para que en el futuro los conectores puedan sincronizar
 * sus datos sin pisar lo que el usuario creó a mano.
 *
 * Para la sincronización entre dispositivos cada elemento lleva `updatedAt`, y
 * los borrados se recuerdan en `deleted` ({ id: fecha }) para que no "resuciten"
 * al combinar con los datos de otro dispositivo.
 */
const Store = (() => {
  const KEY = 'organizador-personal:v1';
  const COLLECTIONS = ['events', 'tasks', 'emails', 'deliveries', 'notes'];
  const listeners = new Set();
  let state = null;
  let batching = false;

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const stamp = () => new Date().toISOString();

  function empty() {
    const s = { version: 1, settings: { name: '' }, settingsUpdatedAt: '', deleted: {} };
    COLLECTIONS.forEach(c => { s[c] = []; });
    return s;
  }

  function normalize(s) {
    const base = empty();
    const out = { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) } };
    COLLECTIONS.forEach(c => { out[c] = Array.isArray(s[c]) ? s[c] : []; });
    out.deleted = s.deleted && typeof s.deleted === 'object' ? { ...s.deleted } : {};
    return out;
  }

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('No se pudo guardar en el navegador', e);
    }
  }

  // `meta.fromSync` indica que el cambio viene de otro dispositivo.
  function commit(meta = {}) {
    if (batching) return;
    persist();
    listeners.forEach(fn => fn(meta));
  }

  function make(data) {
    const t = stamp();
    return { id: uid(), source: 'local', createdAt: t, updatedAt: t, ...data };
  }

  // Marca como borrado todo lo que hay ahora y no está en `next`.
  function tombstoneMissing(next) {
    const t = stamp();
    const keep = new Set(COLLECTIONS.flatMap(c => (next[c] || []).map(x => x.id)));
    const deleted = { ...state.deleted, ...(next.deleted || {}) };
    COLLECTIONS.forEach(c => state[c].forEach(x => { if (!keep.has(x.id)) deleted[x.id] = t; }));
    return { ...next, deleted, settingsUpdatedAt: t };
  }

  return {
    COLLECTIONS,

    init(seedFn) {
      const saved = read();
      state = normalize(saved || (seedFn ? seedFn(make) : empty()));
      if (!saved) persist();
    },

    all: c => state[c],
    get: (c, id) => state[c].find(x => x.id === id),

    add(c, data) {
      const item = make(data);
      state[c].push(item);
      commit();
      return item;
    },

    update(c, id, patch) {
      const i = state[c].findIndex(x => x.id === id);
      if (i < 0) return null;
      state[c][i] = { ...state[c][i], ...patch, updatedAt: stamp() };
      commit();
      return state[c][i];
    },

    remove(c, id) {
      state[c] = state[c].filter(x => x.id !== id);
      state.deleted[id] = stamp();
      commit();
    },

    // Agrupa varios cambios en un solo guardado/render.
    batch(fn) {
      batching = true;
      try { fn(); } finally { batching = false; }
      commit();
    },

    // Para conectores: sustituye los elementos de una fuente externa,
    // emparejando por `externalId`.
    upsertExternal(c, source, items) {
      const keep = new Set();
      items.forEach(item => {
        keep.add(item.externalId);
        const i = state[c].findIndex(x => x.source === source && x.externalId === item.externalId);
        if (i >= 0) state[c][i] = { ...state[c][i], ...item, source, updatedAt: stamp() };
        else state[c].push(make({ ...item, source }));
      });
      state[c] = state[c].filter(x => {
        const stale = x.source === source && !keep.has(x.externalId);
        if (stale) state.deleted[x.id] = stamp();
        return !stale;
      });
      commit();
    },

    getSetting: k => state.settings[k],
    setSetting(k, v) {
      state.settings[k] = v;
      state.settingsUpdatedAt = stamp();
      commit();
    },

    exportData: () => JSON.parse(JSON.stringify(state)),

    importData(obj) {
      if (!obj || typeof obj !== 'object' || !COLLECTIONS.some(c => Array.isArray(obj[c]))) {
        throw new Error('El archivo no es una copia válida del organizador.');
      }
      state = normalize(tombstoneMissing(obj));
      commit();
    },

    reset(seedFn) {
      state = normalize(tombstoneMissing(seedFn ? seedFn(make) : empty()));
      commit();
    },

    // Sustituye el estado por uno ya combinado con la nube.
    replace(next) {
      state = normalize(next);
      commit({ fromSync: true });
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
})();
