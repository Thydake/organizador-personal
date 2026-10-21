/*
 * Sincronización entre dispositivos con Firebase (Google + Firestore).
 * Cada usuario tiene un documento users/{uid} con todo su estado. Al combinar,
 * por cada elemento gana la versión con `updatedAt` más reciente, y los
 * borrados (`deleted`) ganan a versiones anteriores al borrado.
 */
const Sync = (() => {
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const FLAG = uid => `organizador-personal:synced:${uid}`;
  const TOMBSTONE_DAYS = 60;

  const listeners = new Set();
  let state = { status: 'off' }; // off | unsupported | loading | signedout | syncing | synced | offline | error
  let auth = null;
  let db = null;
  let user = null;
  let unsubscribe = null;
  let timer = null;
  let chooser = async () => 'cloud';

  function set(patch) {
    state = { ...state, ...patch };
    listeners.forEach(fn => fn(state));
  }

  /* ---------- Combinar ---------- */

  const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

  function merge(a, b) {
    const deleted = { ...(a.deleted || {}) };
    Object.entries(b.deleted || {}).forEach(([id, t]) => { if (!deleted[id] || t > deleted[id]) deleted[id] = t; });
    const cutoff = new Date(Date.now() - TOMBSTONE_DAYS * 86400000).toISOString();
    Object.keys(deleted).forEach(id => { if (deleted[id] < cutoff) delete deleted[id]; });

    const out = { version: 1, deleted };
    Store.COLLECTIONS.forEach(c => {
      const map = new Map();
      [...(a[c] || []), ...(b[c] || [])].forEach(item => {
        const cur = map.get(item.id);
        if (!cur || (item.updatedAt || '') > (cur.updatedAt || '')) map.set(item.id, item);
      });
      out[c] = [...map.values()]
        .filter(item => !(deleted[item.id] && deleted[item.id] >= (item.updatedAt || '')))
        .sort(byId);
    });

    const newerB = (b.settingsUpdatedAt || '') > (a.settingsUpdatedAt || '');
    out.settings = { ...(newerB ? b.settings : a.settings) };
    out.settingsUpdatedAt = (newerB ? b.settingsUpdatedAt : a.settingsUpdatedAt) || '';
    return out;
  }

  // Comparación que ignora el orden de claves y de elementos.
  function canonical(s) {
    const sortKeys = v => Array.isArray(v) ? v.map(sortKeys)
      : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => { o[k] = sortKeys(v[k]); return o; }, {})
      : v;
    const copy = { ...s };
    Store.COLLECTIONS.forEach(c => { copy[c] = (s[c] || []).slice().sort(byId); });
    return JSON.stringify(sortKeys(copy));
  }
  const same = (a, b) => canonical(a) === canonical(b);

  /* ---------- Firebase ---------- */

  const configured = () => !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey);
  // v2: el estado vive en users/{uid}/state/main. El documento users/{uid}
  // (versión anterior) solo se lee una vez para migrar.
  const docRef = () => db.collection('users').doc(user.uid).collection('state').doc('main');
  const legacyRef = () => db.collection('users').doc(user.uid);
  const parse = data => { try { return JSON.parse(data.data); } catch (e) { return null; } };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(s);
    });
  }

  function authError(e) {
    const msgs = {
      'auth/unauthorized-domain': 'Esta web no está autorizada en Firebase (Authentication → Configuración → Dominios autorizados).',
      'auth/network-request-failed': 'Sin conexión. Inténtalo de nuevo.',
      'auth/operation-not-allowed': 'El acceso con Google no está activado en Firebase.',
    };
    return msgs[e.code] || e.message || 'No se pudo iniciar sesión.';
  }

  function fail(e) {
    console.warn('Sincronización:', e);
    if (!navigator.onLine || e.code === 'unavailable') set({ status: 'offline' });
    else if (e.code === 'permission-denied') set({ status: 'error', error: 'Firebase rechazó el acceso. Revisa las reglas de Firestore.' });
    else set({ status: 'error', error: e.message || 'Error al sincronizar.' });
  }

  async function push() {
    if (!user) return;
    clearTimeout(timer);
    set({ status: 'syncing' });
    let merged;
    await db.runTransaction(async t => {
      const snap = await t.get(docRef());
      const remote = snap.exists ? parse(snap.data()) : null;
      const local = Store.exportData();
      merged = remote ? merge(local, remote) : merge(local, {});
      if (remote && same(merged, remote)) return;
      t.set(docRef(), {
        data: JSON.stringify(merged),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    if (!same(merged, Store.exportData())) Store.replace(merged);
    set({ status: 'synced', lastSynced: Date.now(), error: '' });
  }

  function schedule(delay = 1200) {
    if (!user) return;
    clearTimeout(timer);
    timer = setTimeout(() => push().catch(fail), delay);
  }

  function listen() {
    unsubscribe = docRef().onSnapshot(snap => {
      if (snap.metadata.hasPendingWrites || !snap.exists) return;
      const remote = parse(snap.data());
      if (!remote) return;
      const local = Store.exportData();
      const merged = merge(local, remote);
      if (!same(merged, local)) Store.replace(merged);
      if (!same(merged, remote)) schedule(300);
      else set({ status: 'synced', lastSynced: Date.now(), error: '' });
    }, fail);
  }

  async function onUser(u) {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    clearTimeout(timer);
    user = u;
    if (!u) { set({ status: 'signedout', user: null }); return; }
    set({ status: 'syncing', user: { name: u.displayName || '', email: u.email || '', photo: u.photoURL || '' } });
    try {
      const snap = await docRef().get();
      let remote = snap.exists ? parse(snap.data()) : null;
      if (!remote) {
        const old = await legacyRef().get().catch(() => null);
        if (old && old.exists) remote = parse(old.data());
      }
      let first = true;
      try { first = !localStorage.getItem(FLAG(u.uid)); } catch (e) { /* sin almacenamiento */ }
      if (remote && first) {
        if ((await chooser()) === 'cloud') Store.replace(remote);
        else Store.replace(merge(Store.exportData(), remote));
      } else if (remote && !snap.exists) {
        Store.replace(merge(Store.exportData(), remote));
      }
      try { localStorage.setItem(FLAG(u.uid), '1'); } catch (e) { /* sin almacenamiento */ }
      await push();
      listen();
    } catch (e) {
      fail(e);
    }
  }

  async function boot() {
    if (!configured()) return set({ status: 'off' });
    if (location.protocol === 'file:') return set({ status: 'unsupported' });
    set({ status: 'loading' });
    try {
      await loadScript(`${SDK}firebase-app-compat.js`);
      await Promise.all([loadScript(`${SDK}firebase-auth-compat.js`), loadScript(`${SDK}firebase-firestore-compat.js`)]);
    } catch (e) {
      return set({ status: 'error', error: 'No se pudo cargar Firebase. ¿Hay conexión?' });
    }
    firebase.initializeApp(window.FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    auth.getRedirectResult().catch(e => set({ status: 'error', error: authError(e) }));
    auth.onAuthStateChanged(onUser);

    Store.subscribe(meta => { if (!meta.fromSync) schedule(); });
    window.addEventListener('online', () => schedule(0));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') schedule(0);
    });
  }

  return {
    boot,
    merge,
    configured,
    get state() { return state; },

    // La app decide qué hacer la primera vez que un dispositivo encuentra datos
    // en la nube: 'cloud' (usar los de la nube) o 'merge' (combinar).
    setChooser(fn) { chooser = fn; },

    async signIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        await auth.signInWithPopup(provider);
      } catch (e) {
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(e.code)) {
          return auth.signInWithRedirect(provider);
        }
        if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
          set({ status: 'error', error: authError(e) });
        }
      }
    },

    signOut: () => auth && auth.signOut(),
    // Acceso a Firestore para los archivos adjuntos (null si no hay sesión).
    cloud: () => (user && db ? { db, uid: user.uid } : null),
    syncNow: () => push().catch(fail),

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
})();
