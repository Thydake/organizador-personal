/*
 * Archivos adjuntos (ideas y proyectos).
 * Siempre se guardan en este dispositivo (IndexedDB). Si hay sesión y pesan
 * hasta MAX_CLOUD, también se suben a Firestore (users/{uid}/files/{id}) para
 * verlos en los demás dispositivos. Las imágenes se comprimen antes.
 * En el estado de la app solo se guardan los datos del archivo:
 *   { id, name, type, size, cloud, addedAt }
 */
const Files = (() => {
  const DB_NAME = 'organizador-files';
  const STORE = 'files';
  const MAX_CLOUD = 700 * 1024; // base64 + metadatos < 1 MiB por documento
  const MAX_SIDE = 1600;

  let dbPromise = null;
  const urls = new Map();

  function idb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  async function tx(mode, fn) {
    const db = await idb();
    return new Promise((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  }
  const idbGet = id => tx('readonly', s => s.get(id));
  const idbPut = (id, blob) => tx('readwrite', s => s.put(blob, id));
  const idbDel = id => tx('readwrite', s => s.delete(id));

  async function compressImage(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // fondo para PNG con transparencia
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    let blob = null;
    for (const q of [0.82, 0.7, 0.55, 0.4]) {
      blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', q));
      if (blob && blob.size <= MAX_CLOUD) break;
    }
    return blob && blob.size < file.size ? blob : file;
  }

  const toBase64 = blob => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

  function fromBase64(b64, type) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type });
  }

  const cloudDoc = (c, id) => c.db.collection('users').doc(c.uid).collection('files').doc(id);

  async function upload(meta, blob) {
    const c = Sync.cloud();
    if (!c || blob.size > MAX_CLOUD) return false;
    try {
      await cloudDoc(c, meta.id).set({ name: meta.name, type: meta.type, size: meta.size, data: await toBase64(blob) });
      return true;
    } catch (e) {
      console.warn('No se pudo subir el archivo', e);
      return false;
    }
  }

  return {
    MAX_CLOUD,

    async save(file) {
      const blob = await compressImage(file).catch(() => file);
      const type = blob.type || file.type || 'application/octet-stream';
      const name = blob !== file && type === 'image/jpeg' ? file.name.replace(/\.\w+$/, '') + '.jpg' : file.name;
      const meta = {
        id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        name, type, size: blob.size, cloud: false, addedAt: new Date().toISOString(),
      };
      await idbPut(meta.id, blob);
      meta.cloud = await upload(meta, blob);
      return meta;
    },

    // Sube un archivo que se adjuntó sin sesión. Devuelve true si quedó en la nube.
    async upload(meta) {
      const blob = await idbGet(meta.id).catch(() => null);
      return blob ? upload(meta, blob) : false;
    },

    async get(id) {
      const local = await idbGet(id).catch(() => null);
      if (local) return local;
      const c = Sync.cloud();
      if (!c) return null;
      const snap = await cloudDoc(c, id).get();
      if (!snap.exists) return null;
      const d = snap.data();
      const blob = fromBase64(d.data, d.type);
      await idbPut(id, blob).catch(() => {});
      return blob;
    },

    async url(id) {
      if (urls.has(id)) return urls.get(id);
      const blob = await this.get(id);
      if (!blob) return null;
      const u = URL.createObjectURL(blob);
      urls.set(id, u);
      return u;
    },

    async remove(id) {
      if (urls.has(id)) { URL.revokeObjectURL(urls.get(id)); urls.delete(id); }
      await idbDel(id).catch(() => {});
      const c = Sync.cloud();
      if (c) await cloudDoc(c, id).delete().catch(() => {});
    },
  };
})();
