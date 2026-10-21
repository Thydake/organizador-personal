/*
 * Capa de datos del organizador.
 * Guarda todo en localStorage. Cada elemento lleva `source` ('local' o el id
 * de una integración) para que en el futuro los conectores puedan sincronizar
 * sus datos sin pisar lo que el usuario creó a mano.
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
    const s = { version: 1, settings: { name: '' } };
    COLLECTIONS.forEach(c => { s[c] = []; });
    return s;
  }

  function normalize(s) {
    const base = empty();
    const out = { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) } };
    COLLECTIONS.forEach(c => { out[c] = Array.isArray(s[c]) ? s[c] : []; });
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

  function commit() {
    if (batching) return;
    persist();
    listeners.forEach(fn => fn());
  }

  function make(data) {
    const t = stamp();
    return { id: uid(), source: 'local', createdAt: t, updatedAt: t, ...data };
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
      state[c] = state[c].filter(x => x.source !== source || keep.has(x.externalId));
      commit();
    },

    getSetting: k => state.settings[k],
    setSetting(k, v) {
      state.settings[k] = v;
      commit();
    },

    exportData: () => JSON.parse(JSON.stringify(state)),

    importData(obj) {
      if (!obj || typeof obj !== 'object' || !COLLECTIONS.some(c => Array.isArray(obj[c]))) {
        throw new Error('El archivo no es una copia válida del organizador.');
      }
      state = normalize(obj);
      commit();
    },

    reset(seedFn) {
      state = normalize(seedFn ? seedFn(make) : empty());
      commit();
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
})();
