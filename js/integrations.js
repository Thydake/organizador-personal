/*
 * Registro de integraciones.
 * Por ahora solo describe los conectores previstos. Un conector real deberá
 * implementar:
 *   connect(): Promise<void>        -> autenticación (OAuth, token...)
 *   sync():    Promise<void>        -> trae datos y llama a
 *              Store.upsertExternal(coleccion, id, items)
 * donde cada item lleva un `externalId` estable.
 */
const Integrations = (() => {
  const registry = [
    { id: 'google-calendar', name: 'Google Calendar', icon: 'calendar', collection: 'events',
      desc: 'Importa reuniones y eventos a tu calendario.' },
    { id: 'gmail', name: 'Gmail', icon: 'mail', collection: 'emails',
      desc: 'Trae los correos importantes y sin leer.' },
    { id: 'google-drive', name: 'Google Drive', icon: 'file', collection: 'deliveries',
      desc: 'Vincula documentos a tus entregas.' },
    { id: 'slack', name: 'Slack', icon: 'chat', collection: 'notes',
      desc: 'Resume las actualizaciones del equipo.' },
  ];

  return {
    list: () => registry.map(c => ({ ...c, connected: typeof c.connect === 'function' && !!c.connected })),
    register(connector) {
      const i = registry.findIndex(c => c.id === connector.id);
      if (i >= 0) registry[i] = { ...registry[i], ...connector };
      else registry.push(connector);
    },
  };
})();
