(() => {
  'use strict';

  /* ---------- Utilidades ---------- */

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const pad = n => String(n).padStart(2, '0');
  const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => toISO(new Date());
  const addDays = (iso, n) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
  const diffDays = (a, b) => Math.round((fromISO(a) - fromISO(b)) / 86400000);
  const startOfWeek = iso => { const d = fromISO(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toISO(d); };
  const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fmtShort = iso => { const d = fromISO(iso); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
  const fmtLong = iso => fromISO(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const relDay = iso => {
    const n = diffDays(iso, today());
    if (n === 0) return 'Hoy';
    if (n === 1) return 'Mañana';
    if (n === -1) return 'Ayer';
    if (n < 0) return `Hace ${-n} días`;
    if (n < 7) return `En ${n} días`;
    return fmtShort(iso);
  };

  const plural = (n, one, many) => `<strong>${n}</strong> ${n === 1 ? one : many}`;
  const joinList = parts => parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;

  /* ---------- Iconos (trazos estilo lucide) ---------- */

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    check: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
    tick: '<path d="m5 12 5 5L20 7"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5z"/><path d="M15 3v6h6M7 13h10M7 17h6"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.8V4h6v6.8l2.5 3.7h-11z"/><path d="M7.5 4h9"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pinmap: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1 2-2 3-3.5 3.5C11 7 11 4.5 12 2 7.5 4.5 5 8.5 5 15c0 4.3 3 7 7 7z"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    partly: '<path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.95 12.65a4 4 0 0 0-5.93-4.13"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
    fog: '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M16 17H7M17 21H9"/>',
    drizzle: '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1"/>',
    rain: '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M16 14v6M8 14v6M12 16v6"/>',
    snow: '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01"/>',
    storm: '<path d="M6 16.3A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 .5 9"/><path d="m13 12-3 5h4l-3 5"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
    wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
    clip: '<path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    kanban: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v7M12 7v4M16 7v9"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
    convert: '<path d="M4 12h12M12 6l6 6-6 6"/><path d="M4 5v14"/>',
  };
  const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ---------- Catálogos ---------- */

  const PRIORITY = { alta: 'Alta', media: 'Media', baja: 'Baja' };
  const PRIO_ORDER = { alta: 0, media: 1, baja: 2 };
  const COLORS = { aqua: 'Aquamarina', orange: 'Naranja', violet: 'Violeta', sky: 'Azul' };
  const EMAIL_STATUS = { sin_leer: 'Sin leer', responder: 'Por responder', esperando: 'Esperando respuesta', hecho: 'Hecho' };

  const TASK_STATUS = { todo: 'Por hacer', doing: 'En curso', review: 'En revisión', done: 'Hecho' };
  const PROJECT_STATUS = { activo: 'Activo', pausa: 'En pausa', terminado: 'Terminado' };
  const IDEA_STATUS = { nueva: 'Nueva', evaluando: 'Evaluando', aprobada: 'Aprobada', descartada: 'Descartada', convertida: 'Convertida' };
  const IMPACT = { alto: 'Impacto alto', medio: 'Impacto medio', bajo: 'Impacto bajo' };

  const prioOf = x => PRIO_ORDER[x.priority] ?? 1;
  const prioBadge = p => `<span class="prio prio-${p || 'media'}">${PRIORITY[p] || 'Media'}</span>`;

  const uidLocal = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fmtMinutes = m => {
    const h = Math.floor(m / 60), r = Math.round(m % 60);
    return h ? `${h} h${r ? ` ${r} min` : ''}` : `${r} min`;
  };
  const fmtSize = b => b < 1024 ? `${b} B` : b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  /* ---------- Datos de ejemplo ---------- */

  function seed(make) {
    const t = today();
    const phases = (pid, names) => names.map((name, i) => ({ id: `${pid}-f${i + 1}`, name }));
    const alpha = make({
      id: 'p-proyecto-alpha', name: 'Proyecto Alpha', client: 'Alpha Studio', status: 'activo', color: 'aqua',
      start: addDays(t, -14), due: addDays(t, 21),
      description: 'Rediseño de la app móvil de Alpha: investigación, diseño, desarrollo y lanzamiento.',
      phases: phases('p-proyecto-alpha', ['Descubrimiento', 'Diseño', 'Desarrollo', 'Lanzamiento']),
      links: [{ id: 'l1', title: 'Carpeta del proyecto (Drive)', url: 'https://drive.google.com' }],
      attachments: [],
    });
    const mkt = make({
      id: 'p-marketing', name: 'Campaña de marketing Q4', client: 'Interno', status: 'activo', color: 'orange',
      start: addDays(t, -7), due: addDays(t, 30), description: 'Campaña de fin de año en redes y newsletter.',
      phases: phases('p-marketing', ['Planificación', 'Contenido', 'Publicación']), links: [], attachments: [],
    });
    const prod = make({
      id: 'p-producto', name: 'Producto', client: 'Interno', status: 'activo', color: 'violet',
      description: 'Mejoras continuas a partir del feedback de clientes.',
      phases: phases('p-producto', ['Investigación', 'Mejoras']), links: [], attachments: [],
    });
    const fin = make({
      id: 'p-finanzas', name: 'Finanzas', client: 'Interno', status: 'pausa', color: 'sky',
      description: 'Presupuesto y control de gastos.', phases: [], links: [], attachments: [],
    });
    const task = (title, extra) => make({ title, priority: 'media', due: '', projectId: '', phaseId: '', status: 'todo', done: false, subtasks: [], ...extra });
    const sub = (title, done = false) => ({ id: uidLocal('s'), title, done });
    const tPres = task('Finalizar presentación de producto', {
      priority: 'alta', due: t, projectId: alpha.id, phaseId: 'p-proyecto-alpha-f2', status: 'doing', order: 0,
      subtasks: [sub('Estructura de la presentación', true), sub('Diapositivas de resultados'), sub('Ensayo con el equipo')],
    });
    const tWire = task('Wireframes de la app', { projectId: alpha.id, phaseId: 'p-proyecto-alpha-f2', status: 'review', order: 0, due: addDays(t, 2) });
    const tPlan = task('Planificar contenido de la próxima semana', { due: addDays(t, 3), projectId: mkt.id, phaseId: 'p-marketing-f1', status: 'doing', order: 0 });

    return {
      projects: [alpha, mkt, prod, fin],
      ideas: [
        make({ title: 'Modo oscuro automático en la app', body: 'Que cambie según la hora del día.', projectId: alpha.id, status: 'evaluando', impact: 'medio', attachments: [] }),
        make({ title: 'Newsletter mensual para clientes', body: 'Resumen de novedades + caso de éxito del mes.', projectId: mkt.id, status: 'nueva', impact: 'alto', attachments: [] }),
        make({ title: 'Automatizar informes con plantillas', body: 'Plantilla única para los informes mensuales.', projectId: '', status: 'aprobada', impact: 'alto', attachments: [] }),
        make({ title: 'Podcast del equipo', body: '', projectId: '', status: 'descartada', impact: 'bajo', attachments: [] }),
      ],
      timelogs: [
        make({ taskId: tPres.id, projectId: alpha.id, date: addDays(t, -1), minutes: 90, note: '' }),
        make({ taskId: tWire.id, projectId: alpha.id, date: addDays(t, -2), minutes: 120, note: 'Primera versión' }),
        make({ taskId: tPlan.id, projectId: mkt.id, date: addDays(t, -1), minutes: 45, note: '' }),
      ],
      settings: { name: '' },
      events: [
        make({ title: 'Reunión de equipo de producto', date: t, start: '09:00', end: '09:45', color: 'aqua', location: 'Sala 2' }),
        make({ title: 'Llamada con cliente – Proyecto Alpha', date: t, start: '10:30', end: '11:15', color: 'orange', location: 'Google Meet' }),
        make({ title: 'Almuerzo', date: t, start: '13:00', end: '14:00', color: 'sky' }),
        make({ title: 'Revisión de estrategia de marketing', date: t, start: '15:00', end: '16:00', color: 'orange' }),
        make({ title: 'Planificación de la próxima semana', date: t, start: '16:30', end: '17:15', color: 'violet' }),
        make({ title: 'Demo con inversores', date: addDays(t, 1), start: '11:00', end: '12:00', color: 'orange' }),
        make({ title: '1:1 con Laura', date: addDays(t, 2), start: '09:30', end: '10:00', color: 'aqua' }),
      ],
      tasks: [
        tPres, tWire, tPlan,
        task('Entrevistas con usuarios', { projectId: alpha.id, phaseId: 'p-proyecto-alpha-f1', status: 'done', done: true, order: 0 }),
        task('Configurar entorno de desarrollo', { projectId: alpha.id, phaseId: 'p-proyecto-alpha-f3', order: 0 }),
        task('Plan de lanzamiento', { priority: 'baja', due: addDays(t, 18), projectId: alpha.id, phaseId: 'p-proyecto-alpha-f4', order: 1 }),
        task('Revisar feedback de clientes', { priority: 'alta', due: addDays(t, 1), projectId: prod.id, phaseId: 'p-producto-f1' }),
        task('Enviar acta de la reunión', { due: addDays(t, -1), projectId: prod.id, status: 'done', done: true }),
        task('Diseñar piezas para redes', { due: addDays(t, 6), projectId: mkt.id, phaseId: 'p-marketing-f2' }),
        task('Actualizar presupuesto Q4', { priority: 'baja', due: addDays(t, 5), projectId: fin.id }),
        task('Responder correos importantes', { due: t }),
      ],
      emails: [
        make({ from: 'Ana Pérez', subject: 'Propuesta revisada para Alpha', status: 'responder', priority: 'alta', date: t }),
        make({ from: 'Equipo Alpha', subject: 'Cambios en el alcance del sprint', status: 'sin_leer', priority: 'alta', date: t }),
        make({ from: 'Facturación', subject: 'Factura de octubre', status: 'sin_leer', priority: 'media', date: addDays(t, -1) }),
        make({ from: 'Marcos Ruiz', subject: '¿Café el jueves?', status: 'esperando', priority: 'baja', date: addDays(t, -2) }),
        make({ from: 'Newsletter Diseño', subject: 'Tendencias de la semana', status: 'hecho', priority: 'baja', date: addDays(t, -3) }),
      ],
      deliveries: [
        make({ title: 'Informe mensual de resultados', date: addDays(t, 1), projectId: alpha.id, done: false }),
        make({ title: 'Mockups v2 de la app', date: addDays(t, 4), projectId: alpha.id, done: false }),
        make({ title: 'Propuesta comercial Beta', date: addDays(t, 10), projectId: '', done: false }),
        make({ title: 'Guion del vídeo de lanzamiento', date: addDays(t, -2), projectId: mkt.id, done: true }),
      ],
      notes: [
        make({ title: 'Nota del día', body: 'Enfócate en lo que mueve la aguja.\nPequeños avances, grandes resultados.', pinned: true }),
        make({ title: 'Ideas para el blog', body: '• Cómo organizo mi semana\n• 5 herramientas que uso a diario\n• Errores al delegar', pinned: false }),
      ],
    };
  }

  /* ---------- Consultas ---------- */

  const eventsOn = d => Store.all('events').filter(e => e.date === d)
    .sort((a, b) => (a.start || '').localeCompare(b.start || ''));
  const pendingTasks = () => Store.all('tasks').filter(t => !t.done);
  const pendingEmails = () => Store.all('emails').filter(e => e.status !== 'hecho');
  const upcomingDeliveries = (from, days) => Store.all('deliveries')
    .filter(x => !x.done && diffDays(x.date, from) >= 0 && diffDays(x.date, from) <= days)
    .sort((a, b) => a.date.localeCompare(b.date));
  const sortTasks = list => list.slice().sort((a, b) =>
    (a.done - b.done) || (prioOf(a) - prioOf(b)) || (a.due || '9999').localeCompare(b.due || '9999'));
  const sortEmails = list => list.slice().sort((a, b) =>
    (prioOf(a) - prioOf(b)) || (b.date || '').localeCompare(a.date || ''));

  /* ---------- Trabajo: proyectos, tareas, tiempo ---------- */

  const statusOf = t => t.status || (t.done ? 'done' : 'todo');
  const projectOf = x => (x && x.projectId ? Store.get('projects', x.projectId) : null);
  const phaseOf = t => { const p = projectOf(t); return p && t.phaseId ? (p.phases || []).find(f => f.id === t.phaseId) : null; };
  const projectTasks = pid => Store.all('tasks').filter(t => t.projectId === pid);
  const boardSort = list => list.slice().sort((a, b) =>
    ((a.order ?? 1e9) - (b.order ?? 1e9)) || (prioOf(a) - prioOf(b)) || (a.due || '9999').localeCompare(b.due || '9999'));
  const minutesFor = (key, id) => Store.all('timelogs').filter(l => l[key] === id).reduce((s, l) => s + (l.minutes || 0), 0);

  function projectStats(p) {
    const tasks = projectTasks(p.id);
    const done = tasks.filter(t => statusOf(t) === 'done').length;
    return {
      tasks, done,
      total: tasks.length,
      pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      open: tasks.length - done,
      dels: Store.all('deliveries').filter(x => x.projectId === p.id && !x.done).sort((a, b) => a.date.localeCompare(b.date)),
      ideas: Store.all('ideas').filter(i => i.projectId === p.id && !['descartada', 'convertida'].includes(i.status)).length,
      minutes: minutesFor('projectId', p.id),
    };
  }

  const projectOptions = (current = '') => {
    const opts = { '': 'Sin proyecto' };
    Store.all('projects')
      .filter(p => p.status !== 'terminado' || p.id === current)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(p => { opts[p.id] = p.name; });
    return opts;
  };
  const phaseOptions = pid => {
    const opts = { '': 'Sin fase' };
    ((Store.get('projects', pid) || {}).phases || []).forEach(f => { opts[f.id] = f.name; });
    return opts;
  };

  // Convierte el antiguo campo de texto `project` en proyectos reales. Los ids
  // dependen del nombre para que dos dispositivos migren al mismo proyecto.
  function migrateWork() {
    const tasks = Store.all('tasks');
    const dels = Store.all('deliveries');
    const pending = [...tasks, ...dels].some(x => x.project && !x.projectId) || tasks.some(t => !t.status);
    if (!pending) return;
    const deleted = Store.exportData().deleted;
    const colors = Object.keys(COLORS);
    Store.batch(() => {
      const ensureProject = name => {
        const id = `p-${slug(name)}`;
        if (Store.get('projects', id)) return id;
        if (deleted[id]) return '';
        Store.add('projects', {
          id, name, client: '', status: 'activo', color: colors[slug(name).length % colors.length],
          description: '', phases: [], links: [], attachments: [],
        });
        return id;
      };
      tasks.forEach(t => {
        const patch = {};
        if (t.project && !t.projectId) { patch.projectId = ensureProject(t.project); patch.project = ''; }
        if (!t.status) patch.status = t.done ? 'done' : 'todo';
        if (Object.keys(patch).length) Store.update('tasks', t.id, patch);
      });
      dels.forEach(x => {
        if (x.project && !x.projectId) Store.update('deliveries', x.id, { projectId: ensureProject(x.project), project: '' });
      });
    });
  }

  /* ---------- Estado de la interfaz ---------- */

  const VIEWS = ['panel', 'calendario', 'tareas', 'correos', 'entregas', 'notas', 'ajustes', 'proyectos', 'ideas'];
  const ui = {
    view: 'panel',
    date: today(),
    weekStart: startOfWeek(today()),
    taskFilter: 'pendientes',
    taskQuery: '',
    emailFilter: 'pendientes',
    city: { query: '', results: [], loading: false, error: '' },
    projectFilter: 'activo',
    projectId: null,
    projectTab: 'tablero',
    boardPhase: '',
    ideaFilter: 'activas',
    ideaProject: '',
  };

  /* ---------- Componentes ---------- */

  const emptyState = (text, action, label) => `
    <div class="empty">
      <p>${text}</p>
      ${action ? `<button class="btn ghost sm" data-action="${action}">${icon('plus')}${label}</button>` : ''}
    </div>`;

  const cardHead = (title, opts = {}) => `
    <div class="card-head">
      <h3>${opts.icon ? icon(opts.icon) : ''}${title}</h3>
      <div class="card-head-actions">
        ${opts.add ? `<button class="icon-btn" data-action="${opts.add}" ${opts.addData || ''} title="Añadir">${icon('plus')}</button>` : ''}
        ${opts.go ? `<a class="link-more" href="#${opts.go}">${opts.goLabel || 'Ver todo'} ${icon('arrow')}</a>` : ''}
      </div>
    </div>`;

  const projectTag = x => {
    const p = projectOf(x);
    return p ? `<span class="tag ptag c-${p.color || 'aqua'}"><span class="pdot"></span>${esc(p.name)}</span>` : '';
  };

  const subtaskCount = t => {
    const s = t.subtasks || [];
    return s.length ? `<span class="due" title="Subtareas">${icon('list')}${s.filter(x => x.done).length}/${s.length}</span>` : '';
  };

  const timerRunning = id => (Store.getSetting('timer') || {}).taskId === id;
  const timerButton = t => statusOf(t) === 'done' ? '' : `
    <button class="icon-btn xs timer-btn ${timerRunning(t.id) ? 'on' : ''}" data-action="timer-toggle" data-id="${t.id}"
      title="${timerRunning(t.id) ? 'Parar cronómetro' : 'Iniciar cronómetro'}">${icon(timerRunning(t.id) ? 'stop' : 'play')}</button>`;

  function taskRow(t, { actions = false, showProject = true } = {}) {
    const overdue = !t.done && t.due && t.due < today();
    const st = statusOf(t);
    return `
      <li class="row task-row ${t.done ? 'is-done' : ''}">
        <button class="check ${t.done ? 'on' : ''}" data-action="toggle-task" data-id="${t.id}"
          aria-label="${t.done ? 'Marcar como pendiente' : 'Marcar como hecha'}">${icon('tick')}</button>
        <div class="row-main" data-action="edit-task" data-id="${t.id}">
          <span class="row-title">${esc(t.title)}</span>
          <span class="row-meta">
            ${prioBadge(t.priority)}
            ${st === 'doing' || st === 'review' ? `<span class="kstatus ks-${st}">${TASK_STATUS[st]}</span>` : ''}
            ${showProject ? projectTag(t) : ''}
            ${t.due ? `<span class="due ${overdue ? 'overdue' : ''}">${icon('clock')}${relDay(t.due)}</span>` : ''}
            ${subtaskCount(t)}
          </span>
        </div>
        ${t.projectId ? timerButton(t) : ''}
        ${actions ? rowActions('tasks', t.id, 'edit-task') : ''}
      </li>`;
  }

  function emailRow(e, { compact = false } = {}) {
    return `
      <li class="row mail-row st-${e.status}">
        <span class="mail-dot" title="${EMAIL_STATUS[e.status] || ''}"></span>
        <div class="row-main" data-action="edit-email" data-id="${e.id}">
          <span class="row-title">${esc(e.subject)}</span>
          <span class="row-meta"><span class="mail-from">${esc(e.from)}</span>
            ${compact ? `<span class="tag">${EMAIL_STATUS[e.status] || ''}</span>` : ''}
            ${e.date ? `<span class="due">${relDay(e.date)}</span>` : ''}</span>
        </div>
        ${compact ? '' : `
          ${prioBadge(e.priority)}
          <select class="status-select" data-change="email-status" data-id="${e.id}" aria-label="Estado">
            ${Object.entries(EMAIL_STATUS).map(([v, l]) => `<option value="${v}" ${v === e.status ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          ${rowActions('emails', e.id, 'edit-email')}`}
      </li>`;
  }

  function deliveryRow(x, { actions = false, showProject = true } = {}) {
    const n = diffDays(x.date, today());
    const urgency = x.done ? '' : n < 0 ? 'overdue' : n <= 1 ? 'soon' : '';
    return `
      <li class="row delivery-row ${x.done ? 'is-done' : ''}">
        <button class="check ${x.done ? 'on' : ''}" data-action="toggle-delivery" data-id="${x.id}"
          aria-label="${x.done ? 'Marcar como pendiente' : 'Marcar como entregada'}">${icon('tick')}</button>
        <div class="row-main" data-action="edit-delivery" data-id="${x.id}">
          <span class="row-title">${esc(x.title)}</span>
          <span class="row-meta">
            ${showProject ? projectTag(x) : ''}
            <span class="due ${urgency}">${icon('package')}${relDay(x.date)} · ${fmtShort(x.date)}</span>
          </span>
        </div>
        ${actions ? rowActions('deliveries', x.id, 'edit-delivery') : ''}
      </li>`;
  }

  const rowActions = (col, id, editAction) => `
    <div class="row-actions">
      <button class="icon-btn" data-action="${editAction}" data-id="${id}" title="Editar">${icon('edit')}</button>
      <button class="icon-btn danger" data-action="delete" data-col="${col}" data-id="${id}" title="Eliminar">${icon('trash')}</button>
    </div>`;

  const chips = (action, current, items) => `
    <div class="chips" role="tablist">
      ${items.map(([key, label, count]) => `
        <button class="chip ${current === key ? 'active' : ''}" data-action="${action}" data-filter="${key}" role="tab">
          ${label}${count != null ? `<span class="chip-count">${count}</span>` : ''}
        </button>`).join('')}
    </div>`;

  function pageHead(title, accent, sub, right = '') {
    return `
      <header class="page-head">
        <div>
          <h1>${title}${accent ? ` <span class="accent">${accent}</span>` : ''}</h1>
          ${sub ? `<p class="sub">${sub}</p>` : ''}
        </div>
        <div class="page-head-right">${right}</div>
      </header>`;
  }

  /* ---------- Reloj y clima ---------- */

  const deg = n => `${Math.round(n)}°`;
  const wxIcon = (code, isDay = true, cls = '') => {
    const kind = Weather.describe(code)[1];
    return icon(kind === 'clear' ? (isDay ? 'sun' : 'moon') : kind, `wx-${kind} ${cls}`);
  };

  function clockParts() {
    const d = new Date();
    return { hm: `${pad(d.getHours())}:${pad(d.getMinutes())}`, s: pad(d.getSeconds()) };
  }

  function weatherBlock(d, isToday) {
    const { status, data } = Weather.state;
    if (!data) {
      if (status === 'nolocation') return `
        <div class="wx wx-msg">${icon('locate')}
          <span>Activa la ubicación o elige tu ciudad para ver el clima.</span>
          <a class="btn ghost sm" href="#ajustes">Elegir ciudad</a>
        </div>`;
      if (status === 'error') return `
        <div class="wx wx-msg">${icon('cloud')}
          <span>No se pudo cargar el clima.</span>
          <button class="btn ghost sm" data-action="weather-refresh">${icon('refresh')}Reintentar</button>
        </div>`;
      return `<div class="wx wx-msg is-loading">${icon('cloud')}<span>Cargando clima…</span></div>`;
    }

    const day = Weather.forDay(d);
    const place = `<span class="wx-place">${icon('pinmap')}${esc(data.place.name)}
      <button class="icon-btn xs ${status === 'loading' ? 'spin' : ''}" data-action="weather-refresh" title="Actualizar clima">${icon('refresh')}</button></span>`;
    if (!day) return `<div class="wx wx-msg">${icon('cloud')}<span>Sin previsión para este día (máx. 7 días).</span>${place}</div>`;

    const c = data.current;
    const now = isToday && c;
    const [label] = Weather.describe(now ? c.code : day.code);
    return `
      <div class="wx">
        <div class="wx-main">
          ${wxIcon(now ? c.code : day.code, now ? c.isDay : true, 'wx-big')}
          <div>
            <span class="wx-temp">${deg(now ? c.temp : day.max)}</span>
            <span class="wx-label">${now ? label : `${label} · previsión`}</span>
          </div>
        </div>
        <div class="wx-details">
          <span title="Máxima / mínima">${deg(day.max)} / ${deg(day.min)}</span>
          <span title="Probabilidad de lluvia">${icon('droplet')}${day.rain ?? 0}%</span>
          ${now ? `<span title="Viento">${icon('wind')}${Math.round(c.wind)} km/h</span>
                   <span title="Sensación térmica">Sens. ${deg(c.feels)}</span>` : ''}
        </div>
        ${place}
      </div>`;
  }

  function dayCard(d, isToday) {
    const { hm, s } = clockParts();
    return `
      <div class="daycard">
        <div class="clock">
          <span class="clock-time"><span data-clock>${hm}</span><span class="clock-sec" data-clock-sec>${s}</span></span>
          <span class="clock-date cap">${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
        <div class="daycard-sep"></div>
        ${weatherBlock(d, isToday)}
      </div>`;
  }

  function miniWeather(d) {
    const day = Weather.forDay(d);
    if (!day) return '';
    return `<span class="day-wx" title="${Weather.describe(day.code)[0]} · lluvia ${day.rain ?? 0}%">
      ${wxIcon(day.code)}${deg(day.max)}<em>${deg(day.min)}</em></span>`;
  }

  /* ---------- Vistas ---------- */

  function viewPanel() {
    const d = ui.date;
    const isToday = d === today();
    const now = nowHM();
    const events = eventsOn(d);
    const pending = pendingTasks();
    const prio = pending.filter(t => t.priority === 'alta');
    const emails = pendingEmails();
    const unread = emails.filter(e => e.status === 'sin_leer').length;
    const dels = upcomingDeliveries(d, 7);
    const tomorrowDels = dels.filter(x => x.date === addDays(d, 1)).length;
    const next = isToday ? events.find(e => (e.end || e.start || '') > now) : events[0];
    const name = Store.getSetting('name');
    const h = new Date().getHours();
    const greeting = (h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches') + (name ? `, ${esc(name)}` : '');

    const summary = `${isToday ? 'Hoy' : 'Ese día'} tienes ${joinList([
      plural(events.length, 'reunión', 'reuniones'),
      plural(prio.length, 'tarea prioritaria', 'tareas prioritarias'),
      plural(emails.length, 'correo pendiente', 'correos pendientes'),
      tomorrowDels
        ? plural(tomorrowDels, 'entrega mañana', 'entregas mañana')
        : plural(dels.length, 'entrega esta semana', 'entregas esta semana'),
    ])}.`;

    const stat = (ic, n, label, hint, tone, go) => `
      <a class="stat tone-${tone}" href="#${go}">
        <span class="stat-icon">${icon(ic)}</span>
        <span class="stat-body">
          <span class="stat-n">${n}</span>
          <span class="stat-label">${label}</span>
          <span class="stat-hint">${hint}</span>
        </span>
      </a>`;

    const dateControl = `
      <div class="date-control">
        <button class="icon-btn" data-action="day-prev" title="Día anterior">${icon('left')}</button>
        <label class="date-pill">${icon('calendar')}
          <span>${fmtShort(d)}</span>
          <input type="date" value="${d}" data-change="set-date" aria-label="Elegir día">
        </label>
        <button class="icon-btn" data-action="day-next" title="Día siguiente">${icon('right')}</button>
        ${isToday ? '' : `<button class="btn ghost sm" data-action="day-today">Hoy</button>`}
      </div>`;

    const schedule = events.length ? `<ul class="sched">${events.map(e => {
      const end = e.end || e.start || '';
      const past = isToday && end && end <= now;
      const live = isToday && e.start && e.start <= now && end > now;
      return `
        <li class="sched-row ${past ? 'is-past' : ''} ${live ? 'is-live' : ''}" data-action="edit-event" data-id="${e.id}">
          <span class="sched-time">${esc(e.start || '—')}</span>
          <span class="dot c-${e.color || 'aqua'}"></span>
          <span class="sched-title">${esc(e.title)}
            ${e.location ? `<small>${icon('pinmap')}${esc(e.location)}</small>` : ''}</span>
          ${live ? '<span class="live-pill">Ahora</span>' : `<span class="sched-end">${e.end ? `hasta ${esc(e.end)}` : ''}</span>`}
        </li>`;
    }).join('')}</ul>` : emptyState('No hay reuniones este día.', 'add-event', 'Añadir evento');

    const topTasks = sortTasks(pending).slice(0, 5);
    const activeProjects = Store.all('projects').filter(p => p.status === 'activo')
      .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const pinned = Store.all('notes').find(n => n.pinned)
      || Store.all('notes').slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

    return `
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">${icon('sun')}${greeting}<span class="eyebrow-date"> · <span class="cap">${fmtLong(d)}</span></span></p>
          <h1>Tu día, <span class="accent">en una sola vista</span></h1>
          <p class="summary">${summary}</p>
        </div>
        <div class="hero-side">
          ${dayCard(d, isToday)}
          ${dateControl}
        </div>
      </section>

      <section class="stats">
        ${stat('calendar', events.length, events.length === 1 ? 'Reunión' : 'Reuniones',
          next ? `Próxima: ${esc(next.start || '')} · ${esc(next.title)}` : 'Agenda libre', 'aqua', 'calendario')}
        ${stat('check', prio.length, 'Tareas prioritarias', `${pending.length} pendientes en total`, 'orange', 'tareas')}
        ${stat('mail', emails.length, 'Correos pendientes', `${unread} sin leer`, 'aqua', 'correos')}
        ${stat('package', dels.length, 'Entregas · 7 días',
          tomorrowDels ? `${tomorrowDels} para mañana` : dels[0] ? `Próxima: ${relDay(dels[0].date)}` : 'Nada a la vista', 'orange', 'entregas')}
      </section>

      <section class="panel-grid">
        <article class="card schedule-card">
          ${cardHead(isToday ? 'Horario de hoy' : `Horario · ${fmtShort(d)}`,
            { icon: 'clock', add: 'add-event', addData: `data-date="${d}"`, go: 'calendario', goLabel: 'Ver calendario' })}
          ${schedule}
        </article>

        <article class="card">
          ${cardHead('Tareas principales', { icon: 'check', add: 'add-task', go: 'tareas', goLabel: 'Ver todas' })}
          ${topTasks.length ? `<ul class="rows">${topTasks.map(t => taskRow(t)).join('')}</ul>`
            : emptyState('Todo al día. ¡Bien hecho!', 'add-task', 'Nueva tarea')}
        </article>

        <article class="card">
          ${cardHead('Correos pendientes', { icon: 'mail', add: 'add-email', go: 'correos' })}
          ${emails.length ? `<ul class="rows">${sortEmails(emails).slice(0, 4).map(e => emailRow(e, { compact: true })).join('')}</ul>`
            : emptyState('Bandeja al día.', 'add-email', 'Añadir correo')}
        </article>

        <article class="card">
          ${cardHead('Próximas entregas', { icon: 'package', add: 'add-delivery', go: 'entregas' })}
          ${dels.length ? `<ul class="rows">${dels.slice(0, 4).map(x => deliveryRow(x)).join('')}</ul>`
            : emptyState('Sin entregas en los próximos 7 días.', 'add-delivery', 'Nueva entrega')}
        </article>

        ${activeProjects.length ? `
        <article class="card wide-card">
          ${cardHead('Proyectos activos', { icon: 'briefcase', add: 'add-project', go: 'proyectos', goLabel: 'Ver proyectos' })}
          <div class="mini-projects">${activeProjects.slice(0, 4).map(p => {
            const s = projectStats(p);
            return `<a class="mini-project c-${p.color || 'aqua'}" href="#proyecto/${p.id}">
              <span class="mini-name"><span class="pdot"></span>${esc(p.name)}</span>
              <div class="pcard-progress">${progressBar(s.pct)}<span>${s.pct}%</span></div>
              <span class="muted small">${s.open} abiertas${s.dels[0] ? ` · entrega ${relDay(s.dels[0].date).toLowerCase()}` : ''}</span>
            </a>`;
          }).join('')}</div>
        </article>` : ''}

        <article class="card note-card">
          <span class="note-icon">${icon('bulb')}</span>
          <div class="note-body">
            <h3>${pinned ? esc(pinned.title || 'Nota rápida') : 'Nota rápida'}</h3>
            ${pinned ? `<p>${esc(pinned.body)}</p>` : '<p class="muted">Escribe algo que quieras tener presente hoy.</p>'}
          </div>
          <button class="btn ghost sm" data-action="${pinned ? 'edit-note' : 'add-note'}" ${pinned ? `data-id="${pinned.id}"` : ''}>
            ${icon(pinned ? 'edit' : 'plus')}${pinned ? 'Editar' : 'Escribir'}</button>
        </article>
      </section>`;
  }

  function viewCalendar() {
    const ws = ui.weekStart;
    const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    const end = days[6];
    const s = fromISO(ws), e = fromISO(end);
    const range = s.getMonth() === e.getMonth()
      ? `${s.getDate()} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`
      : `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
    const t = today();
    const tasks = Store.all('tasks');
    const dels = Store.all('deliveries');

    const nav = `
      <div class="date-control">
        <button class="icon-btn" data-action="week-prev" title="Semana anterior">${icon('left')}</button>
        <span class="date-pill static">${icon('calendar')}<span>${range}</span></span>
        <button class="icon-btn" data-action="week-next" title="Semana siguiente">${icon('right')}</button>
        <button class="btn ghost sm" data-action="week-today">Hoy</button>
        <button class="btn primary" data-action="add-event">${icon('plus')}Nuevo evento</button>
      </div>`;

    const cols = days.map(d => {
      const dd = fromISO(d);
      const evs = eventsOn(d);
      const dueT = tasks.filter(x => x.due === d && !x.done);
      const dueD = dels.filter(x => x.date === d && !x.done);
      return `
        <div class="day-col ${d === t ? 'is-today' : ''} ${d < t ? 'is-past' : ''}">
          <div class="day-head">
            <span class="day-name">${DAYS[dd.getDay()]}</span>
            ${miniWeather(d)}
            <span class="day-num">${dd.getDate()}</span>
          </div>
          <div class="day-body">
            ${evs.map(ev => `
              <button class="ev c-${ev.color || 'aqua'}" data-action="edit-event" data-id="${ev.id}">
                <span class="ev-time">${esc(ev.start || '')}${ev.end ? `–${esc(ev.end)}` : ''}</span>
                <span class="ev-title">${esc(ev.title)}</span>
              </button>`).join('')}
            ${dueD.map(x => `
              <button class="ev ev-delivery" data-action="edit-delivery" data-id="${x.id}">
                <span class="ev-time">${icon('package')}Entrega</span><span class="ev-title">${esc(x.title)}</span>
              </button>`).join('')}
            ${dueT.map(x => `
              <button class="ev ev-task" data-action="edit-task" data-id="${x.id}">
                <span class="ev-time">${icon('check')}Tarea</span><span class="ev-title">${esc(x.title)}</span>
              </button>`).join('')}
            <button class="day-add" data-action="add-event" data-date="${d}" title="Añadir evento">${icon('plus')}</button>
          </div>
        </div>`;
    }).join('');

    return `${pageHead('Calendario', 'semanal', 'Reuniones, entregas y tareas con fecha, de un vistazo.', nav)}
      <section class="week">${cols}</section>`;
  }

  function taskFilterFn(key) {
    const t = today();
    return {
      pendientes: x => !x.done,
      hoy: x => !x.done && x.due && x.due <= t,
      prioritarias: x => !x.done && x.priority === 'alta',
      completadas: x => x.done,
      todas: () => true,
    }[key];
  }

  function taskListHTML() {
    const q = ui.taskQuery.trim().toLowerCase();
    const list = sortTasks(Store.all('tasks').filter(taskFilterFn(ui.taskFilter)))
      .filter(x => !q || `${x.title} ${(projectOf(x) || {}).name || ''}`.toLowerCase().includes(q));
    return list.length ? list.map(t => taskRow(t, { actions: true })).join('')
      : `<li>${emptyState(q ? 'Ninguna tarea coincide con la búsqueda.' : 'No hay tareas aquí.', 'add-task', 'Nueva tarea')}</li>`;
  }

  function viewTasks() {
    const all = Store.all('tasks');
    const count = k => all.filter(taskFilterFn(k)).length;
    return `${pageHead('Tareas', 'y prioridades', 'Lo que tienes entre manos, ordenado por prioridad y fecha.',
        `<button class="btn primary" data-action="add-task">${icon('plus')}Nueva tarea</button>`)}
      <div class="toolbar">
        ${chips('filter-tasks', ui.taskFilter, [
          ['pendientes', 'Pendientes', count('pendientes')],
          ['hoy', 'Para hoy', count('hoy')],
          ['prioritarias', 'Prioritarias', count('prioritarias')],
          ['completadas', 'Completadas', count('completadas')],
          ['todas', 'Todas', all.length],
        ])}
        <label class="search">${icon('search')}
          <input type="search" placeholder="Buscar tarea o proyecto" value="${esc(ui.taskQuery)}" data-input="task-search">
        </label>
      </div>
      <section class="card"><ul class="rows" id="task-list">${taskListHTML()}</ul></section>`;
  }

  function viewEmails() {
    const all = Store.all('emails');
    const filters = {
      pendientes: x => x.status !== 'hecho',
      sin_leer: x => x.status === 'sin_leer',
      responder: x => x.status === 'responder',
      esperando: x => x.status === 'esperando',
      hecho: x => x.status === 'hecho',
    };
    const list = sortEmails(all.filter(filters[ui.emailFilter]));
    return `${pageHead('Correos', 'en seguimiento', 'Apunta los correos que requieren algo de ti y sigue su estado.',
        `<button class="btn primary" data-action="add-email">${icon('plus')}Añadir correo</button>`)}
      <div class="toolbar">
        ${chips('filter-emails', ui.emailFilter, [
          ['pendientes', 'Pendientes', all.filter(filters.pendientes).length],
          ['sin_leer', 'Sin leer', all.filter(filters.sin_leer).length],
          ['responder', 'Por responder', all.filter(filters.responder).length],
          ['esperando', 'Esperando', all.filter(filters.esperando).length],
          ['hecho', 'Hechos', all.filter(filters.hecho).length],
        ])}
      </div>
      <section class="card">
        ${list.length ? `<ul class="rows">${list.map(e => emailRow(e)).join('')}</ul>`
          : emptyState('No hay correos en este estado.', 'add-email', 'Añadir correo')}
      </section>`;
  }

  function viewDeliveries() {
    const t = today();
    const all = Store.all('deliveries').slice().sort((a, b) => a.date.localeCompare(b.date));
    const groups = [
      ['Atrasadas', all.filter(x => !x.done && x.date < t)],
      ['Próximos 7 días', all.filter(x => !x.done && x.date >= t && diffDays(x.date, t) <= 7)],
      ['Más adelante', all.filter(x => !x.done && diffDays(x.date, t) > 7)],
      ['Entregadas', all.filter(x => x.done).reverse()],
    ].filter(([, items]) => items.length);

    return `${pageHead('Entregas', 'y plazos', 'Fechas límite de proyectos y documentos.',
        `<button class="btn primary" data-action="add-delivery">${icon('plus')}Nueva entrega</button>`)}
      ${groups.length ? groups.map(([label, items]) => `
        <section class="card group">
          <div class="card-head"><h3>${label}<span class="chip-count">${items.length}</span></h3></div>
          <ul class="rows">${items.map(x => deliveryRow(x, { actions: true })).join('')}</ul>
        </section>`).join('')
        : `<section class="card">${emptyState('Aún no hay entregas.', 'add-delivery', 'Nueva entrega')}</section>`}`;
  }

  function viewNotes() {
    const notes = Store.all('notes').slice()
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt.localeCompare(a.updatedAt));
    return `${pageHead('Notas', 'rápidas', 'Fija una nota para verla en tu panel cada día.',
        `<button class="btn primary" data-action="add-note">${icon('plus')}Nueva nota</button>`)}
      ${notes.length ? `<section class="notes-grid">${notes.map(n => `
        <article class="note ${n.pinned ? 'is-pinned' : ''}">
          <header>
            <h3 data-action="edit-note" data-id="${n.id}">${esc(n.title || 'Sin título')}</h3>
            <button class="icon-btn ${n.pinned ? 'on' : ''}" data-action="pin-note" data-id="${n.id}"
              title="${n.pinned ? 'Quitar del panel' : 'Fijar en el panel'}">${icon('pin')}</button>
          </header>
          <p data-action="edit-note" data-id="${n.id}">${esc(n.body)}</p>
          <footer>
            <span class="muted small">${n.pinned ? 'En tu panel' : `Editada ${relDay(n.updatedAt.slice(0, 10)).toLowerCase()}`}</span>
            ${rowActions('notes', n.id, 'edit-note')}
          </footer>
        </article>`).join('')}</section>`
        : `<section class="card">${emptyState('Aún no tienes notas.', 'add-note', 'Nueva nota')}</section>`}`;
  }

  /* ---------- Vistas de trabajo ---------- */

  const progressBar = (pct, cls = '') => `<div class="progress ${cls}"><span style="width:${pct}%"></span></div>`;

  function attachmentsHTML(col, item) {
    const list = item.attachments || [];
    return `
      <div class="attachments" data-drop-attach data-col="${col}" data-id="${item.id}">
        ${list.map(a => `
          <div class="att">
            <button class="att-open" data-action="open-file" data-file="${a.id}" title="${esc(a.name)}">
              ${(a.type || '').startsWith('image/')
                ? `<img data-thumb="${a.id}" alt="">`
                : `<span class="att-icon">${icon('file')}</span>`}
              <span class="att-name">${esc(a.name)}</span>
              <span class="att-size">${fmtSize(a.size)}${a.cloud ? '' : ' · solo aquí'}</span>
            </button>
            <button class="icon-btn xs danger att-del" data-action="remove-file" data-col="${col}" data-id="${item.id}"
              data-file="${a.id}" title="Quitar">${icon('x')}</button>
          </div>`).join('')}
        <button class="att-add" data-action="attach" data-col="${col}" data-id="${item.id}">
          ${icon('clip')}<span>Adjuntar</span><small>o arrastra aquí</small>
        </button>
      </div>`;
  }

  // Carga las miniaturas de imágenes después de pintar.
  function hydrateThumbs() {
    document.querySelectorAll('img[data-thumb]:not([src])').forEach(img => {
      Files.url(img.dataset.thumb).then(u => {
        if (u) img.src = u;
        else img.replaceWith(Object.assign(document.createElement('span'), { className: 'att-icon missing', innerHTML: icon('file') }));
      }).catch(() => {});
    });
  }

  function projectCard(p) {
    const s = projectStats(p);
    const next = s.dels[0];
    return `
      <a class="pcard c-${p.color || 'aqua'}" href="#proyecto/${p.id}">
        <div class="pcard-top">
          <span class="pstatus ps-${p.status}">${PROJECT_STATUS[p.status] || ''}</span>
          ${p.due ? `<span class="due ${p.status === 'activo' && p.due < today() ? 'overdue' : ''}">${icon('calendar')}${fmtShort(p.due)}</span>` : ''}
        </div>
        <h3><span class="pdot"></span>${esc(p.name)}</h3>
        ${p.client ? `<p class="muted small">${esc(p.client)}</p>` : ''}
        <div class="pcard-progress">${progressBar(s.pct)}<span>${s.pct}%</span></div>
        <div class="pcard-meta">
          <span>${icon('check')}${s.done}/${s.total}</span>
          ${next ? `<span class="${diffDays(next.date, today()) <= 1 ? 'warn' : ''}">${icon('package')}${relDay(next.date)}</span>` : ''}
          ${s.ideas ? `<span>${icon('bulb')}${s.ideas}</span>` : ''}
          ${s.minutes ? `<span>${icon('timer')}${fmtMinutes(s.minutes)}</span>` : ''}
        </div>
      </a>`;
  }

  function viewProjects() {
    const all = Store.all('projects');
    const filters = { activo: p => p.status === 'activo', pausa: p => p.status === 'pausa', terminado: p => p.status === 'terminado', todos: () => true };
    const list = all.filter(filters[ui.projectFilter]).sort((a, b) =>
      (a.due || '9999').localeCompare(b.due || '9999') || a.name.localeCompare(b.name));
    return `${pageHead('Proyectos', 'de trabajo', 'Tareas, fases, entregas, ideas y tiempo de cada proyecto.',
        `<button class="btn primary" data-action="add-project">${icon('plus')}Nuevo proyecto</button>`)}
      <div class="toolbar">
        ${chips('filter-projects', ui.projectFilter, [
          ['activo', 'Activos', all.filter(filters.activo).length],
          ['pausa', 'En pausa', all.filter(filters.pausa).length],
          ['terminado', 'Terminados', all.filter(filters.terminado).length],
          ['todos', 'Todos', all.length],
        ])}
      </div>
      ${list.length ? `<section class="project-grid">${list.map(projectCard).join('')}</section>`
        : `<section class="card">${emptyState('No hay proyectos aquí.', 'add-project', 'Nuevo proyecto')}</section>`}`;
  }

  const PROJECT_TABS = [
    ['tablero', 'Tablero', 'kanban'], ['fases', 'Fases', 'list'], ['entregas', 'Entregas', 'package'],
    ['ideas', 'Ideas', 'bulb'], ['recursos', 'Recursos', 'clip'], ['tiempo', 'Tiempo', 'timer'],
  ];

  function viewProject() {
    const p = Store.get('projects', ui.projectId);
    const s = projectStats(p);
    const counts = { entregas: s.dels.length, ideas: s.ideas, recursos: (p.links || []).length + (p.attachments || []).length };
    const body = {
      tablero: projectBoard, fases: projectPhases, entregas: projectDeliveries,
      ideas: projectIdeas, recursos: projectResources, tiempo: projectTime,
    }[ui.projectTab] || projectBoard;

    return `
      <a class="back-link" href="#proyectos">${icon('left')}Proyectos</a>
      <header class="project-head c-${p.color || 'aqua'}">
        <div class="project-title">
          <h1><span class="pdot big"></span>${esc(p.name)}</h1>
          <p class="sub">${[p.client && esc(p.client),
            p.start && `Desde ${fmtShort(p.start)}`, p.due && `Entrega final ${fmtShort(p.due)}`].filter(Boolean).join(' · ')}</p>
          ${p.description ? `<p class="project-desc">${esc(p.description)}</p>` : ''}
        </div>
        <div class="project-actions">
          <select class="status-select" data-change="project-status" data-id="${p.id}" aria-label="Estado del proyecto">
            ${Object.entries(PROJECT_STATUS).map(([v, l]) => `<option value="${v}" ${v === p.status ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          <button class="btn ghost" data-action="edit-project" data-id="${p.id}">${icon('edit')}Editar</button>
          <button class="btn primary" data-action="add-task" data-project="${p.id}">${icon('plus')}Nueva tarea</button>
        </div>
      </header>

      <section class="project-kpis">
        <div class="kpi kpi-progress"><span class="kpi-label">Progreso</span>
          <div class="kpi-row">${progressBar(s.pct, 'lg')}<strong>${s.pct}%</strong></div>
          <span class="muted small">${s.done} de ${s.total} tareas hechas</span></div>
        <div class="kpi"><span class="kpi-label">Abiertas</span><strong>${s.open}</strong><span class="muted small">tareas</span></div>
        <div class="kpi"><span class="kpi-label">Próxima entrega</span><strong>${s.dels[0] ? relDay(s.dels[0].date) : '—'}</strong>
          <span class="muted small">${s.dels[0] ? esc(s.dels[0].title) : 'Sin entregas pendientes'}</span></div>
        <div class="kpi"><span class="kpi-label">Tiempo</span><strong>${s.minutes ? fmtMinutes(s.minutes) : '0 min'}</strong><span class="muted small">registrado</span></div>
      </section>

      <nav class="tabs" role="tablist">
        ${PROJECT_TABS.map(([key, label, ic]) => `
          <button class="tab-btn ${ui.projectTab === key ? 'active' : ''}" data-action="project-tab" data-tab="${key}" role="tab">
            ${icon(ic)}${label}${counts[key] ? `<span class="chip-count">${counts[key]}</span>` : ''}
          </button>`).join('')}
      </nav>
      <section class="tab-body">${body(p, s)}</section>`;
  }

  function projectBoard(p, s) {
    const phases = p.phases || [];
    const tasks = s.tasks.filter(t => !ui.boardPhase || t.phaseId === ui.boardPhase);
    const card = t => {
      const ph = phaseOf(t);
      const overdue = statusOf(t) !== 'done' && t.due && t.due < today();
      const mins = minutesFor('taskId', t.id);
      return `
        <article class="kcard ${timerRunning(t.id) ? 'is-timing' : ''}" draggable="true" data-id="${t.id}" data-action="edit-task">
          <div class="kcard-top">
            ${ph ? `<span class="tag">${esc(ph.name)}</span>` : ''}
            ${prioBadge(t.priority)}
          </div>
          <span class="kcard-title">${esc(t.title)}</span>
          <div class="kcard-meta">
            ${t.due ? `<span class="due ${overdue ? 'overdue' : ''}">${icon('clock')}${relDay(t.due)}</span>` : ''}
            ${subtaskCount(t)}
            ${mins ? `<span class="due">${icon('timer')}${fmtMinutes(mins)}</span>` : ''}
            <span class="spacer"></span>
            ${timerButton(t)}
          </div>
        </article>`;
    };
    return `
      ${phases.length ? `<div class="toolbar">${chips('board-phase', ui.boardPhase,
        [['', 'Todas las fases'], ...phases.map(f => [f.id, f.name])])}</div>` : ''}
      <div class="board">
        ${Object.entries(TASK_STATUS).map(([st, label]) => {
          const col = boardSort(tasks.filter(t => statusOf(t) === st));
          return `
            <div class="kcol ks-${st}" data-status="${st}">
              <div class="kcol-head"><span class="kdot"></span>${label}<span class="chip-count">${col.length}</span></div>
              <div class="kcol-body">
                ${col.map(card).join('')}
                <button class="kadd" data-action="add-task" data-project="${p.id}" data-status="${st}"
                  ${ui.boardPhase ? `data-phase="${ui.boardPhase}"` : ''}>${icon('plus')}Añadir</button>
              </div>
            </div>`;
        }).join('')}
      </div>
      <p class="muted small board-hint">Arrastra las tarjetas entre columnas. En el móvil, toca una tarjeta para cambiar su estado.</p>`;
  }

  function projectPhases(p, s) {
    const phases = p.phases || [];
    const group = (f, i) => {
      const tasks = sortTasks(s.tasks.filter(t => (f ? t.phaseId === f.id : !phases.some(x => x.id === t.phaseId))));
      if (!f && !tasks.length) return '';
      const done = tasks.filter(t => statusOf(t) === 'done').length;
      const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
      return `
        <section class="card phase">
          <div class="card-head">
            <h3>${f ? `<span class="phase-num">${i + 1}</span>${esc(f.name)}` : 'Sin fase'}<span class="chip-count">${done}/${tasks.length}</span></h3>
            <div class="card-head-actions">
              ${f ? `
                <button class="icon-btn" data-action="phase-move" data-phase="${f.id}" data-dir="-1" title="Subir" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button>
                <button class="icon-btn" data-action="phase-move" data-phase="${f.id}" data-dir="1" title="Bajar" ${i === phases.length - 1 ? 'disabled' : ''}>${icon('down')}</button>
                <button class="icon-btn" data-action="phase-rename" data-phase="${f.id}" title="Renombrar">${icon('edit')}</button>
                <button class="icon-btn danger" data-action="phase-delete" data-phase="${f.id}" title="Eliminar fase">${icon('trash')}</button>` : ''}
            </div>
          </div>
          ${tasks.length ? progressBar(pct, 'sm') : ''}
          <ul class="rows">${tasks.map(t => taskRow(t, { actions: true, showProject: false })).join('')}</ul>
          <button class="btn ghost sm" data-action="add-task" data-project="${p.id}" ${f ? `data-phase="${f.id}"` : ''}>${icon('plus')}Añadir tarea${f ? ` a ${esc(f.name)}` : ''}</button>
        </section>`;
    };
    return `
      ${phases.map(group).join('')}
      ${group(null)}
      <button class="btn ghost" data-action="phase-add">${icon('plus')}Nueva fase</button>`;
  }

  function projectDeliveries(p) {
    const list = Store.all('deliveries').filter(x => x.projectId === p.id)
      .sort((a, b) => (a.done - b.done) || a.date.localeCompare(b.date));
    return `
      <section class="card">
        ${cardHead('Entregas del proyecto', { icon: 'package', add: 'add-delivery', addData: `data-project="${p.id}"` })}
        ${list.length ? `<ul class="rows">${list.map(x => deliveryRow(x, { actions: true, showProject: false })).join('')}</ul>`
          : emptyState('Este proyecto aún no tiene entregas.', '', '')}
      </section>`;
  }

  function projectIdeas(p) {
    const list = Store.all('ideas').filter(i => i.projectId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return `
      <div class="toolbar"><span class="muted">Ideas ligadas a este proyecto.</span>
        <button class="btn ghost" data-action="add-idea" data-project="${p.id}">${icon('plus')}Nueva idea</button></div>
      ${list.length ? `<section class="ideas-grid">${list.map(i => ideaCard(i, { showProject: false })).join('')}</section>`
        : `<section class="card">${emptyState('Sin ideas todavía.', '', '')}</section>`}`;
  }

  function projectResources(p) {
    const links = p.links || [];
    return `
      <section class="card">
        ${cardHead('Enlaces', { icon: 'link', add: 'add-link', addData: `data-id="${p.id}"` })}
        ${links.length ? `<ul class="rows">${links.map(l => `
          <li class="row">
            <span class="link-icon">${icon('external')}</span>
            <a class="row-main" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
              <span class="row-title">${esc(l.title || l.url)}</span>
              <span class="row-meta">${esc(l.url)}</span>
            </a>
            <button class="icon-btn danger" data-action="remove-link" data-id="${p.id}" data-link="${l.id}" title="Quitar">${icon('trash')}</button>
          </li>`).join('')}</ul>`
          : `<p class="muted">Guarda aquí enlaces a Drive, Figma, documentos…</p>`}
      </section>
      <section class="card">
        ${cardHead('Archivos', { icon: 'clip' })}
        ${attachmentsHTML('projects', p)}
        <p class="muted small att-hint">Las imágenes se comprimen solas. Otros archivos se sincronizan si pesan hasta ${fmtSize(Files.MAX_CLOUD)}; los más grandes quedan solo en este dispositivo.</p>
      </section>`;
  }

  function projectTime(p, s) {
    const logs = Store.all('timelogs').filter(l => l.projectId === p.id).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const byTask = {};
    logs.forEach(l => { byTask[l.taskId || ''] = (byTask[l.taskId || ''] || 0) + (l.minutes || 0); });
    const taskName = id => (Store.get('tasks', id) || {}).title || 'Sin tarea';
    return `
      <section class="time-grid">
        <article class="card">
          ${cardHead('Por tarea', { icon: 'check' })}
          ${Object.keys(byTask).length ? `<ul class="rows">${Object.entries(byTask).sort((a, b) => b[1] - a[1]).map(([id, m]) => `
            <li class="row"><div class="row-main"><span class="row-title">${esc(taskName(id))}</span>
              ${progressBar(Math.round((m / s.minutes) * 100), 'sm')}</div><strong class="time-val">${fmtMinutes(m)}</strong></li>`).join('')}</ul>`
            : '<p class="muted">Aún no hay tiempo registrado. Pulsa ▶ en una tarea para empezar.</p>'}
        </article>
        <article class="card">
          ${cardHead('Registros', { icon: 'timer', add: 'add-timelog', addData: `data-project="${p.id}"` })}
          ${logs.length ? `<ul class="rows">${logs.map(l => `
            <li class="row">
              <div class="row-main" data-action="edit-timelog" data-id="${l.id}">
                <span class="row-title">${esc(taskName(l.taskId))}</span>
                <span class="row-meta">${l.date ? fmtShort(l.date) : ''}${l.note ? ` · ${esc(l.note)}` : ''}</span>
              </div>
              <strong class="time-val">${fmtMinutes(l.minutes || 0)}</strong>
              ${rowActions('timelogs', l.id, 'edit-timelog')}
            </li>`).join('')}</ul>` : '<p class="muted">Sin registros.</p>'}
        </article>
      </section>`;
  }

  function ideaCard(i, { showProject = true } = {}) {
    const conv = i.convertedTo;
    const convTarget = conv && (conv.type === 'task' ? Store.get('tasks', conv.id) : Store.get('projects', conv.id));
    return `
      <article class="idea is-${i.status}">
        <header>
          <select class="idea-status" data-change="idea-status" data-id="${i.id}" aria-label="Estado de la idea">
            ${Object.entries(IDEA_STATUS).map(([v, l]) => `<option value="${v}" ${v === i.status ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          ${i.impact ? `<span class="impact im-${i.impact}">${IMPACT[i.impact]}</span>` : ''}
          ${showProject ? projectTag(i) : ''}
        </header>
        <h3 data-action="edit-idea" data-id="${i.id}">${esc(i.title)}</h3>
        ${i.body ? `<p data-action="edit-idea" data-id="${i.id}">${esc(i.body)}</p>` : ''}
        ${conv ? `<p class="converted">${icon('convert')}Convertida en ${conv.type === 'task' ? 'tarea' : 'proyecto'}:
          ${convTarget ? (conv.type === 'project' ? `<a href="#proyecto/${conv.id}">${esc(convTarget.name)}</a>`
            : `<button class="linkish" data-action="edit-task" data-id="${conv.id}">${esc(convTarget.title)}</button>`) : 'eliminada'}</p>` : ''}
        ${attachmentsHTML('ideas', i)}
        <footer>
          ${i.status !== 'convertida' ? `
            <button class="btn ghost sm" data-action="idea-to-task" data-id="${i.id}">${icon('check')}A tarea</button>
            <button class="btn ghost sm" data-action="idea-to-project" data-id="${i.id}">${icon('briefcase')}A proyecto</button>` : ''}
          <span class="spacer"></span>
          ${rowActions('ideas', i.id, 'edit-idea')}
        </footer>
      </article>`;
  }

  function viewIdeas() {
    const all = Store.all('ideas');
    const filters = {
      activas: i => ['nueva', 'evaluando', 'aprobada'].includes(i.status),
      nueva: i => i.status === 'nueva', evaluando: i => i.status === 'evaluando', aprobada: i => i.status === 'aprobada',
      descartada: i => i.status === 'descartada', convertida: i => i.status === 'convertida', todas: () => true,
    };
    const byProject = i => !ui.ideaProject || (ui.ideaProject === 'none' ? !i.projectId : i.projectId === ui.ideaProject);
    const IMP = { alto: 0, medio: 1, bajo: 2 };
    const list = all.filter(filters[ui.ideaFilter]).filter(byProject)
      .sort((a, b) => ((IMP[a.impact] ?? 3) - (IMP[b.impact] ?? 3)) || b.createdAt.localeCompare(a.createdAt));
    const count = k => all.filter(filters[k]).filter(byProject).length;
    return `${pageHead('Ideas', 'bandeja', 'Apunta ideas al vuelo, adjunta referencias y conviértelas en tareas o proyectos.')}
      <form class="capture" data-form="idea-capture" autocomplete="off">
        ${icon('bulb')}
        <input name="title" placeholder="Apunta una idea y pulsa Enter…" aria-label="Nueva idea">
        <select name="projectId" aria-label="Proyecto">${Object.entries(projectOptions())
          .map(([v, l]) => `<option value="${v}" ${v === (ui.ideaProject !== 'none' ? ui.ideaProject : '') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
        <button class="btn primary" type="submit">${icon('plus')}Añadir</button>
      </form>
      <div class="toolbar">
        ${chips('filter-ideas', ui.ideaFilter, [
          ['activas', 'Activas', count('activas')], ['nueva', 'Nuevas', count('nueva')], ['evaluando', 'Evaluando', count('evaluando')],
          ['aprobada', 'Aprobadas', count('aprobada')], ['convertida', 'Convertidas', count('convertida')],
          ['descartada', 'Descartadas', count('descartada')], ['todas', 'Todas', count('todas')],
        ])}
        <select class="status-select" data-change="ideas-project" aria-label="Filtrar por proyecto">
          <option value="">Todos los proyectos</option>
          <option value="none" ${ui.ideaProject === 'none' ? 'selected' : ''}>Sin proyecto</option>
          ${Store.all('projects').map(p => `<option value="${p.id}" ${ui.ideaProject === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
        </select>
      </div>
      ${list.length ? `<section class="ideas-grid">${list.map(i => ideaCard(i)).join('')}</section>`
        : `<section class="card">${emptyState('No hay ideas aquí. ¡Apunta la primera arriba!', '', '')}</section>`}`;
  }

  function weatherSettings() {
    const place = Store.getSetting('weatherPlace');
    const results = ui.city.results;
    return `
      <p class="muted">Ubicación actual: <strong class="place-now">${place
        ? `${esc(place.name)}${place.region ? `, ${esc(place.region)}` : ''}`
        : 'la del navegador'}</strong></p>
      <div class="city-search">
        <label class="search">${icon('search')}
          <input type="search" id="city-q" placeholder="Buscar ciudad" value="${esc(ui.city.query)}">
        </label>
        <button class="btn ghost" data-action="city-search">${ui.city.loading ? 'Buscando…' : 'Buscar'}</button>
      </div>
      ${ui.city.error ? `<p class="form-error">${esc(ui.city.error)}</p>` : ''}
      ${results.length ? `<ul class="city-results">${results.map((r, i) => `
        <li><button data-action="pick-city" data-idx="${i}">
          <strong>${esc(r.name)}</strong><span class="muted small">${esc(r.region)}</span>
        </button></li>`).join('')}</ul>` : ''}
      ${place ? `<div class="btn-row"><button class="btn ghost" data-action="use-location">${icon('locate')}Usar mi ubicación</button></div>` : ''}`;
  }

  const SYNC_LABEL = {
    off: 'Solo en este dispositivo', unsupported: 'Solo en este dispositivo', loading: 'Conectando…',
    signedout: 'Sin sincronizar', syncing: 'Sincronizando…', synced: 'Sincronizado',
    offline: 'Sin conexión', error: 'Error al sincronizar',
  };

  function agoText(ms) {
    const min = Math.floor((Date.now() - ms) / 60000);
    if (min < 1) return 'hace un momento';
    if (min < 60) return `hace ${min} min`;
    return `hace ${Math.floor(min / 60)} h`;
  }

  const syncPill = () => {
    const s = Sync.state;
    return `<a href="#ajustes" class="sync-pill st-${s.status}" title="Sincronización">
      <span class="sync-dot"></span>${SYNC_LABEL[s.status] || ''}</a>`;
  };

  function syncSettings() {
    const s = Sync.state;
    const u = s.user;
    const body = {
      off: `<p class="muted">Aún no está conectada la nube (Firebase). Mientras tanto, tus datos se guardan solo en este dispositivo.</p>`,
      unsupported: `<p class="muted">Para sincronizar, abre el organizador desde su web, no como archivo.</p>`,
      loading: `<p class="muted">Conectando…</p>`,
      signedout: `
        <p class="muted">Entra con tu cuenta de Google en cada dispositivo y tus datos se mantendrán iguales en todos.</p>
        <div class="btn-row"><button class="btn primary" data-action="sync-signin">${icon('cloud')}Entrar con Google</button></div>`,
    }[s.status];
    if (body) return body;

    return `
      <div class="sync-user">
        ${u && u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : `<span class="sync-avatar">${icon('cloud')}</span>`}
        <div>
          <strong>${esc(u ? (u.name || u.email) : '')}</strong>
          <span class="muted small">${esc(u ? u.email : '')}</span>
        </div>
      </div>
      <p class="sync-status st-${s.status}"><span class="sync-dot"></span>
        ${s.status === 'synced' && s.lastSynced ? `Sincronizado ${agoText(s.lastSynced)}`
          : s.status === 'offline' ? 'Sin conexión: los cambios se guardan aquí y se subirán al volver la conexión.'
          : s.status === 'error' ? esc(s.error || 'Error al sincronizar.')
          : SYNC_LABEL[s.status]}</p>
      <div class="btn-row">
        <button class="btn ghost" data-action="sync-now">${icon('refresh')}Sincronizar ahora</button>
        <button class="btn ghost" data-action="sync-signout">${icon('logout')}Cerrar sesión</button>
      </div>`;
  }

  function viewSettings() {
    return `${pageHead('Ajustes', '', 'Personaliza el organizador y gestiona tus datos.')}
      <section class="settings-grid">
        <article class="card wide">
          ${cardHead('Sincronización entre dispositivos', { icon: 'cloud' })}
          ${syncSettings()}
        </article>

        <article class="card">
          ${cardHead('Perfil')}
          <label class="field"><span>Tu nombre (para el saludo)</span>
            <input type="text" value="${esc(Store.getSetting('name') || '')}" data-change="set-name" placeholder="Ej. Gabo">
          </label>
        </article>

        <article class="card">
          ${cardHead('Clima', { icon: 'partly' })}
          ${weatherSettings()}
        </article>

        <article class="card wide">
          ${cardHead('Tus datos')}
          <p class="muted">Todo se guarda en este navegador. Exporta una copia de seguridad de vez en cuando.</p>
          <div class="btn-row">
            <button class="btn ghost" data-action="export">${icon('download')}Exportar copia</button>
            <button class="btn ghost" data-action="import">${icon('upload')}Importar copia</button>
          </div>
          <div class="btn-row">
            <button class="btn ghost" data-action="reset-sample">Cargar datos de ejemplo</button>
            <button class="btn ghost danger" data-action="clear-all">${icon('trash')}Borrar todo</button>
          </div>
        </article>

        <article class="card wide">
          ${cardHead('Integraciones', { icon: 'link' })}
          <p class="muted">Conecta tus herramientas para que el panel se llene solo. Disponibles en una próxima fase.</p>
          <div class="integrations">
            ${Integrations.list().map(c => `
              <div class="integration">
                <span class="integration-icon">${icon(c.icon)}</span>
                <div><strong>${esc(c.name)}</strong><p class="muted small">${esc(c.desc)}</p></div>
                <span class="soon">${c.connected ? 'Conectado' : 'Próximamente'}</span>
              </div>`).join('')}
          </div>
        </article>
      </section>`;
  }

  const RENDERERS = {
    panel: viewPanel, calendario: viewCalendar, tareas: viewTasks, correos: viewEmails,
    entregas: viewDeliveries, notas: viewNotes, ajustes: viewSettings,
    proyectos: viewProjects, proyecto: viewProject, ideas: viewIdeas,
  };

  /* ---------- Navegación ---------- */

  const NAV = [
    { id: 'panel', label: 'Panel', icon: 'home' },
    { id: 'calendario', label: 'Calendario', icon: 'calendar' },
    { id: 'tareas', label: 'Tareas', icon: 'check' },
    { id: 'correos', label: 'Correos', icon: 'mail' },
    { id: 'notas', label: 'Notas', icon: 'note' },
    { id: 'proyectos', label: 'Proyectos', icon: 'briefcase', group: 'Trabajo' },
    { id: 'ideas', label: 'Ideas', icon: 'bulb' },
    { id: 'entregas', label: 'Entregas', icon: 'package' },
  ];

  function renderNav() {
    const counts = {
      tareas: pendingTasks().length,
      correos: pendingEmails().length,
      entregas: upcomingDeliveries(today(), 7).length,
      ideas: Store.all('ideas').filter(i => i.status === 'nueva').length,
    };
    const navView = ui.view === 'proyecto' ? 'proyectos' : ui.view;
    $('#nav').innerHTML = NAV.map(n => `
      ${n.group ? `<span class="nav-label">${n.group}</span>` : ''}
      <a href="#${n.id}" class="nav-item ${navView === n.id ? 'active' : ''}">
        ${icon(n.icon)}<span>${n.label}</span>
        ${counts[n.id] ? `<span class="badge">${counts[n.id]}</span>` : ''}
      </a>`).join('');
    $('#nav-settings').classList.toggle('active', ui.view === 'ajustes');

    // Barra inferior (móvil): 4 secciones + "Más".
    const inMore = MORE.some(n => n.id === ui.view);
    const moreCount = MORE.reduce((sum, n) => sum + (counts[n.id] || 0), 0);
    const tab = (href, ic, label, active, count, action) => `
      <${action ? `button data-action="${action}"` : `a href="${href}"`} class="tab ${active ? 'active' : ''}">
        <span class="tab-icon">${icon(ic)}${count ? `<span class="tab-badge">${count}</span>` : ''}</span>
        <span>${label}</span>
      </${action ? 'button' : 'a'}>`;
    $('#tabbar').innerHTML = NAV.filter(n => !MORE.some(m => m.id === n.id))
      .map(n => tab(`#${n.id}`, n.icon, n.label, navView === n.id, counts[n.id])).join('')
      + tab('', 'grid', 'Más', inMore, moreCount, 'open-more');
    $('#fab').hidden = ui.view === 'ajustes';
    $('#sync-indicator').innerHTML = syncPill();
    renderTimer();
  }

  const MORE = [
    { id: 'ideas', label: 'Ideas', icon: 'bulb' },
    { id: 'correos', label: 'Correos', icon: 'mail' },
    { id: 'entregas', label: 'Entregas', icon: 'package' },
    { id: 'notas', label: 'Notas', icon: 'note' },
    { id: 'ajustes', label: 'Ajustes', icon: 'settings' },
  ];

  /* ---------- Cronómetro ---------- */

  function elapsedText(startISO) {
    const sec = Math.max(0, Math.floor((Date.now() - new Date(startISO)) / 1000));
    return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}`;
  }

  function renderTimer() {
    const tm = Store.getSetting('timer');
    const task = tm && Store.get('tasks', tm.taskId);
    const html = task ? `
      <div class="timer-pill">
        <span class="rec-dot"></span>
        <a class="timer-info" href="#proyecto/${task.projectId}">
          <strong data-timer-elapsed>${elapsedText(tm.start)}</strong>
          <span>${esc(task.title)}</span>
        </a>
        <button class="icon-btn" data-action="timer-stop" title="Parar y guardar">${icon('stop')}</button>
      </div>` : '';
    document.querySelectorAll('[data-timer-slot]').forEach(el => { el.innerHTML = html; });
    document.body.classList.toggle('has-timer', !!task);
  }

  function stopTimer({ silent = false } = {}) {
    const tm = Store.getSetting('timer');
    if (!tm) return;
    const minutes = Math.round((Date.now() - new Date(tm.start)) / 60000);
    const task = Store.get('tasks', tm.taskId);
    Store.batch(() => {
      if (minutes >= 1) {
        Store.add('timelogs', { taskId: tm.taskId, projectId: task ? task.projectId : tm.projectId, date: toISO(new Date(tm.start)), minutes, note: '' });
      }
      Store.setSetting('timer', null);
    });
    if (!silent) toast(minutes >= 1 ? `Registrado: ${fmtMinutes(minutes)}` : 'Menos de un minuto: no se registra');
  }

  function toggleTimer(taskId) {
    const tm = Store.getSetting('timer');
    if (tm && tm.taskId === taskId) return stopTimer();
    if (tm) stopTimer({ silent: true });
    const task = Store.get('tasks', taskId);
    Store.batch(() => {
      Store.setSetting('timer', { taskId, projectId: task.projectId || '', start: new Date().toISOString() });
      if (statusOf(task) === 'todo') Store.update('tasks', taskId, { status: 'doing' });
    });
    toast('Cronómetro en marcha');
  }

  function openSheet(title, body) {
    $('#modal-root').innerHTML = `
      <div class="modal-backdrop sheet-backdrop">
        <div class="sheet" role="dialog" aria-label="${esc(title)}">
          <span class="sheet-handle"></span>
          <h2>${esc(title)}</h2>
          ${body}
        </div>
      </div>`;
  }

  const sheetItem = (ic, label, attrs) => `
    <${attrs.startsWith('href') ? 'a' : 'button'} class="sheet-item" ${attrs}>
      <span class="sheet-icon">${icon(ic)}</span><span>${label}</span>${icon('right', 'chev')}
    </${attrs.startsWith('href') ? 'a' : 'button'}>`;

  function render() {
    if (ui.view === 'proyecto' && !Store.get('projects', ui.projectId)) ui.view = 'proyectos';
    renderNav();
    $('#view').innerHTML = RENDERERS[ui.view]();
    hydrateThumbs();
  }

  // Rutas: #vista, #proyecto/<id> y #proyecto/<id>/<pestaña>
  function route() {
    const [v, id, tab] = location.hash.slice(1).split('/');
    if (v === 'proyecto' && id) {
      if (ui.projectId !== id) ui.boardPhase = '';
      ui.view = 'proyecto';
      ui.projectId = id;
      ui.projectTab = PROJECT_TABS.some(([k]) => k === tab) ? tab : 'tablero';
    } else {
      ui.view = VIEWS.includes(v) ? v : 'panel';
    }
    closeModal();
    render();
    $('#main').scrollTop = 0;
  }

  /* ---------- Formularios (modal) ---------- */

  const optionsHTML = (options, v) => Object.entries(options)
    .map(([val, lab]) => `<option value="${esc(val)}" ${val === v ? 'selected' : ''}>${esc(lab)}</option>`).join('');

  const subtaskRowHTML = (s = {}) => `
    <li data-sub-id="${esc(s.id || '')}">
      <input type="checkbox" ${s.done ? 'checked' : ''} aria-label="Paso hecho">
      <input type="text" value="${esc(s.title || '')}" placeholder="Describe el paso…">
      <button type="button" class="icon-btn xs" data-sub-del title="Quitar paso">${icon('x')}</button>
    </li>`;

  const collectSubtasks = form => [...form.querySelectorAll('[data-subtasks] li')].map(li => ({
    id: li.dataset.subId || uidLocal('s'),
    title: li.querySelector('input[type=text]').value.trim(),
    done: li.querySelector('input[type=checkbox]').checked,
  })).filter(s => s.title);

  function fieldHTML(f, value) {
    const v = value ?? f.default ?? '';
    const id = `f-${f.name}`;
    const req = f.required ? 'required' : '';
    let input;
    if (f.type === 'textarea') {
      input = `<textarea id="${id}" name="${f.name}" rows="${f.rows || 4}" ${req} placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>`;
    } else if (f.type === 'select') {
      input = `<select id="${id}" name="${f.name}">${optionsHTML(f.options, v)}</select>`;
    } else if (f.type === 'subtasks') {
      return `<div class="field wide"><span>${f.label}</span>
        <ul class="subtasks" data-subtasks>${(Array.isArray(value) ? value : []).map(subtaskRowHTML).join('')}</ul>
        <button type="button" class="btn ghost sm" data-sub-add>${icon('plus')}Añadir paso</button></div>`;
    } else if (f.type === 'info') {
      return value ? `<div class="field wide info-field">${value}</div>` : '';
    } else if (f.type === 'swatch') {
      return `<div class="field ${f.wide ? 'wide' : ''}"><span>${f.label}</span><div class="swatches">
        ${Object.entries(COLORS).map(([c, lab]) => `
          <label class="swatch c-${c}" title="${lab}">
            <input type="radio" name="${f.name}" value="${c}" ${c === (v || 'aqua') ? 'checked' : ''}><span></span>
          </label>`).join('')}</div></div>`;
    } else {
      input = `<input id="${id}" type="${f.type || 'text'}" name="${f.name}" value="${esc(v)}" ${req}
        placeholder="${esc(f.placeholder || '')}" autocomplete="off">`;
    }
    return `<label class="field ${f.wide ? 'wide' : ''}" for="${id}"><span>${f.label}${f.required ? ' <em>*</em>' : ''}</span>${input}</label>`;
  }

  function openForm({ title, fields, values = {}, validate, onSave, onDelete, deleteConfirm }) {
    const root = $('#modal-root');
    root.innerHTML = `
      <div class="modal-backdrop">
        <form class="modal" novalidate>
          <header class="modal-head">
            <h2>${esc(title)}</h2>
            <button type="button" class="icon-btn" data-action="close-modal" aria-label="Cerrar">${icon('x')}</button>
          </header>
          <div class="form-grid">${fields.map(f => fieldHTML(f, values[f.name])).join('')}</div>
          <p class="form-error" role="alert"></p>
          <footer class="modal-foot">
            ${onDelete ? `<button type="button" class="btn ghost danger" data-modal-delete>${icon('trash')}Eliminar</button>` : ''}
            <span class="spacer"></span>
            <button type="button" class="btn ghost" data-action="close-modal">Cancelar</button>
            <button type="submit" class="btn primary">Guardar</button>
          </footer>
        </form>
      </div>`;
    const form = $('form', root);
    const err = $('.form-error', root);

    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      Object.keys(data).forEach(k => { if (typeof data[k] === 'string') data[k] = data[k].trim(); });
      fields.forEach(f => {
        if (f.collect) data[f.name] = f.collect(form);
        if (f.type === 'info') delete data[f.name];
      });
      const missing = fields.find(f => f.required && !data[f.name]);
      if (missing) {
        err.textContent = `Completa el campo “${missing.label}”.`;
        form.elements[missing.name]?.focus();
        return;
      }
      const msg = validate && validate(data);
      if (msg) { err.textContent = msg; return; }
      onSave(data);
      closeModal();
      toast('Guardado');
    });

    const del = $('[data-modal-delete]', root);
    if (del) del.addEventListener('click', () => {
      if (!confirm(deleteConfirm || '¿Eliminar este elemento?')) return;
      onDelete();
      closeModal();
      toast('Eliminado');
    });

    // Subtareas: añadir / quitar pasos; Enter en un paso crea el siguiente.
    const addSub = () => {
      const list = $('[data-subtasks]', form);
      list.insertAdjacentHTML('beforeend', subtaskRowHTML());
      list.lastElementChild.querySelector('input[type=text]').focus();
    };
    form.addEventListener('click', ev => {
      if (ev.target.closest('[data-sub-add]')) addSub();
      const rm = ev.target.closest('[data-sub-del]');
      if (rm) rm.closest('li').remove();
    });
    form.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' && ev.target.closest('[data-subtasks]')) { ev.preventDefault(); addSub(); }
    });

    // Selects que dependen de otro (fase según proyecto).
    fields.filter(f => f.dependsOn).forEach(f => {
      form.elements[f.dependsOn]?.addEventListener('change', e => {
        form.elements[f.name].innerHTML = optionsHTML(f.optionsFor(e.target.value), '');
      });
    });

    setTimeout(() => form.querySelector('input:not([type=radio]), textarea, select')?.focus(), 30);
  }

  // Las hojas con clase `locked` exigen elegir una opción (solo se cierran con force).
  function closeModal(force = false) {
    if (!force && $('#modal-root .locked')) return;
    $('#modal-root').innerHTML = '';
  }
  const modalOpen = () => !!$('#modal-root').firstElementChild;

  // Crea o edita un elemento de una colección con el mismo formulario.
  function editItem(col, id, { title, fields, defaults = {}, extra = {}, validate, toData = d => d, afterCreate, onDelete, deleteConfirm }) {
    const item = id ? Store.get(col, id) : null;
    openForm({
      title: item ? title[1] : title[0],
      fields,
      values: { ...(item || defaults), ...extra },
      validate,
      deleteConfirm,
      onSave: data => {
        if (item) return Store.update(col, id, toData(data));
        const created = Store.add(col, toData(data));
        if (afterCreate) afterCreate(created);
        return created;
      },
      onDelete: item ? (onDelete ? () => onDelete(id) : () => removeItem(col, id)) : null,
    });
  }

  // Borra un elemento y sus archivos adjuntos.
  function removeItem(col, id) {
    const item = Store.get(col, id);
    if (col === 'projects') return deleteProject(id);
    (item && item.attachments || []).forEach(a => Files.remove(a.id));
    Store.remove(col, id);
  }

  // Al borrar un proyecto, sus tareas, entregas e ideas se conservan sin proyecto.
  function deleteProject(id) {
    const p = Store.get('projects', id);
    if (!p) return;
    (p.attachments || []).forEach(a => Files.remove(a.id));
    Store.batch(() => {
      ['tasks', 'deliveries', 'ideas'].forEach(c => Store.all(c)
        .filter(x => x.projectId === id)
        .forEach(x => Store.update(c, x.id, { projectId: '', phaseId: '' })));
      Store.remove('projects', id);
    });
    if (ui.view === 'proyecto') location.hash = '#proyectos';
  }

  const nextOrder = (pid, status) => projectTasks(pid)
    .filter(t => statusOf(t) === status).reduce((m, t) => Math.max(m, (t.order ?? -1) + 1), 0);

  const FORMS = {
    event: (id, date) => editItem('events', id, {
      title: ['Nuevo evento', 'Editar evento'],
      defaults: { date: date || ui.date, color: 'aqua' },
      fields: [
        { name: 'title', label: 'Título', required: true, wide: true, placeholder: 'Ej. Reunión con el equipo' },
        { name: 'date', label: 'Fecha', type: 'date', required: true },
        { name: 'location', label: 'Lugar o enlace', placeholder: 'Opcional' },
        { name: 'start', label: 'Inicio', type: 'time' },
        { name: 'end', label: 'Fin', type: 'time' },
        { name: 'color', label: 'Color', type: 'swatch', wide: true },
        { name: 'notes', label: 'Notas', type: 'textarea', wide: true, rows: 3 },
      ],
      validate: d => d.start && d.end && d.end <= d.start ? 'La hora de fin debe ser posterior a la de inicio.' : null,
    }),
    task: (id, preset = {}, afterCreate) => {
      const item = id ? Store.get('tasks', id) : null;
      const pid = item ? item.projectId || '' : preset.projectId || '';
      const mins = id ? minutesFor('taskId', id) : 0;
      editItem('tasks', id, {
        title: ['Nueva tarea', 'Editar tarea'],
        defaults: {
          priority: 'media', status: 'todo', projectId: '', phaseId: '', subtasks: [],
          due: ui.view === 'panel' && !preset.projectId ? ui.date : '', ...preset,
        },
        extra: item ? { status: statusOf(item), timeInfo: mins ? `${icon('timer')}Tiempo registrado: <strong>${fmtMinutes(mins)}</strong>` : '' } : {},
        fields: [
          { name: 'title', label: 'Tarea', required: true, wide: true, placeholder: '¿Qué hay que hacer?' },
          { name: 'projectId', label: 'Proyecto', type: 'select', options: projectOptions(pid) },
          { name: 'phaseId', label: 'Fase', type: 'select', options: phaseOptions(pid), dependsOn: 'projectId', optionsFor: phaseOptions },
          { name: 'status', label: 'Estado', type: 'select', options: TASK_STATUS },
          { name: 'priority', label: 'Prioridad', type: 'select', options: PRIORITY },
          { name: 'due', label: 'Fecha límite', type: 'date' },
          { name: 'subtasks', label: 'Subtareas', type: 'subtasks', collect: collectSubtasks },
          { name: 'notes', label: 'Notas', type: 'textarea', wide: true, rows: 3 },
          { name: 'timeInfo', type: 'info' },
        ],
        toData: d => {
          const out = { ...d, done: d.status === 'done', project: '' };
          if (!item || item.status !== d.status || item.projectId !== d.projectId) out.order = nextOrder(d.projectId, d.status);
          return out;
        },
        afterCreate,
      });
    },
    email: id => editItem('emails', id, {
      title: ['Añadir correo', 'Editar correo'],
      defaults: { status: 'sin_leer', priority: 'media', date: today() },
      fields: [
        { name: 'from', label: 'Remitente', required: true },
        { name: 'date', label: 'Recibido', type: 'date' },
        { name: 'subject', label: 'Asunto', required: true, wide: true },
        { name: 'status', label: 'Estado', type: 'select', options: EMAIL_STATUS },
        { name: 'priority', label: 'Prioridad', type: 'select', options: PRIORITY },
        { name: 'notes', label: 'Qué hay que hacer', type: 'textarea', wide: true, rows: 3 },
      ],
    }),
    delivery: (id, preset = {}) => editItem('deliveries', id, {
      title: ['Nueva entrega', 'Editar entrega'],
      defaults: { date: addDays(today(), 1), projectId: '', ...preset },
      fields: [
        { name: 'title', label: 'Entrega', required: true, wide: true, placeholder: 'Ej. Informe mensual' },
        { name: 'date', label: 'Fecha límite', type: 'date', required: true },
        { name: 'projectId', label: 'Proyecto', type: 'select', options: projectOptions(id ? Store.get('deliveries', id).projectId : preset.projectId) },
        { name: 'notes', label: 'Notas', type: 'textarea', wide: true, rows: 3 },
      ],
      toData: d => ({ ...d, project: '', done: id ? Store.get('deliveries', id).done : false }),
    }),
    project: (id, preset = {}, afterCreate) => editItem('projects', id, {
      title: ['Nuevo proyecto', 'Editar proyecto'],
      defaults: { status: 'activo', color: 'aqua', start: today(), phasesText: 'Planificación\nEjecución\nEntrega', ...preset },
      fields: [
        { name: 'name', label: 'Nombre', required: true, wide: true, placeholder: 'Ej. Web de cliente X' },
        { name: 'client', label: 'Cliente', placeholder: 'Opcional' },
        { name: 'status', label: 'Estado', type: 'select', options: PROJECT_STATUS },
        { name: 'start', label: 'Inicio', type: 'date' },
        { name: 'due', label: 'Entrega final', type: 'date' },
        { name: 'color', label: 'Color', type: 'swatch', wide: true },
        { name: 'description', label: 'Descripción', type: 'textarea', wide: true, rows: 3 },
        ...(id ? [] : [{ name: 'phasesText', label: 'Fases (una por línea)', type: 'textarea', wide: true, rows: 4 }]),
      ],
      validate: d => d.start && d.due && d.due < d.start ? 'La entrega final no puede ser anterior al inicio.' : null,
      toData: d => {
        const out = { ...d };
        delete out.phasesText;
        if (!id) {
          out.phases = (d.phasesText || '').split('\n').map(s => s.trim()).filter(Boolean).map(name => ({ id: uidLocal('ph'), name }));
          out.links = [];
          out.attachments = [];
        }
        return out;
      },
      afterCreate: created => { if (afterCreate) afterCreate(created); location.hash = `#proyecto/${created.id}`; },
      deleteConfirm: '¿Eliminar el proyecto? Sus tareas, entregas e ideas se conservan, sin proyecto.',
    }),
    idea: (id, preset = {}) => editItem('ideas', id, {
      title: ['Nueva idea', 'Editar idea'],
      defaults: { status: 'nueva', impact: '', projectId: '', ...preset },
      fields: [
        { name: 'title', label: 'Idea', required: true, wide: true, placeholder: '¿Qué se te ha ocurrido?' },
        { name: 'projectId', label: 'Proyecto', type: 'select', options: projectOptions(id ? Store.get('ideas', id).projectId : preset.projectId) },
        { name: 'impact', label: 'Valoración', type: 'select', options: { '': 'Sin valorar', ...IMPACT } },
        { name: 'status', label: 'Estado', type: 'select', options: IDEA_STATUS },
        { name: 'body', label: 'Detalles', type: 'textarea', wide: true, rows: 4, placeholder: 'Contexto, por qué merece la pena, referencias…' },
      ],
      toData: d => (id ? d : { ...d, attachments: [] }),
    }),
    timelog: (id, preset = {}) => {
      const item = id ? Store.get('timelogs', id) : null;
      const pid = item ? item.projectId : preset.projectId;
      const taskOpts = { '': 'Sin tarea' };
      boardSort(projectTasks(pid)).forEach(t => { taskOpts[t.id] = t.title; });
      const m = item ? item.minutes || 0 : 30;
      editItem('timelogs', id, {
        title: ['Añadir tiempo', 'Editar tiempo'],
        defaults: { date: today(), taskId: '' },
        extra: { hours: String(Math.floor(m / 60)), mins: String(m % 60) },
        fields: [
          { name: 'taskId', label: 'Tarea', type: 'select', options: taskOpts, wide: true },
          { name: 'date', label: 'Fecha', type: 'date', required: true },
          { name: 'hours', label: 'Horas', type: 'number' },
          { name: 'mins', label: 'Minutos', type: 'number' },
          { name: 'note', label: 'Nota', wide: true, placeholder: 'Opcional' },
        ],
        validate: d => (Number(d.hours) || 0) * 60 + (Number(d.mins) || 0) > 0 ? null : 'Indica cuánto tiempo.',
        toData: d => ({
          taskId: d.taskId, projectId: pid, date: d.date, note: d.note,
          minutes: (Number(d.hours) || 0) * 60 + (Number(d.mins) || 0),
        }),
      });
    },
    link: pid => openForm({
      title: 'Nuevo enlace',
      fields: [
        { name: 'url', label: 'Dirección (URL)', required: true, wide: true, placeholder: 'https://…' },
        { name: 'title', label: 'Nombre', wide: true, placeholder: 'Ej. Diseños en Figma' },
      ],
      onSave: d => {
        const url = /^https?:\/\//i.test(d.url) ? d.url : `https://${d.url}`;
        const p = Store.get('projects', pid);
        Store.update('projects', pid, { links: [...(p.links || []), { id: uidLocal('l'), title: d.title, url }] });
      },
    }),
    note: id => editItem('notes', id, {
      title: ['Nueva nota', 'Editar nota'],
      fields: [
        { name: 'title', label: 'Título', wide: true, placeholder: 'Opcional' },
        { name: 'body', label: 'Nota', type: 'textarea', required: true, wide: true, rows: 7 },
      ],
      toData: d => ({ ...d, pinned: id ? !!Store.get('notes', id).pinned : !Store.all('notes').some(n => n.pinned) }),
    }),
  };

  /* ---------- Acciones ---------- */

  const toggle = (col, id) => { const x = Store.get(col, id); if (x) Store.update(col, id, { done: !x.done }); };

  function toggleTask(id) {
    const t = Store.get('tasks', id);
    if (!t) return;
    const done = !t.done;
    const prev = statusOf(t);
    Store.batch(() => {
      Store.update('tasks', id, { done, status: done ? 'done' : (prev === 'done' ? 'todo' : prev) });
      if (done && timerRunning(id)) stopTimer();
    });
  }

  // Mueve una tarjeta del tablero a otra columna y posición.
  function moveTask(id, status, beforeId) {
    const t = Store.get('tasks', id);
    if (!t) return;
    const col = boardSort(projectTasks(t.projectId).filter(x => statusOf(x) === status && x.id !== id));
    let idx = beforeId ? col.findIndex(x => x.id === beforeId) : col.length;
    if (idx < 0) idx = col.length;
    col.splice(idx, 0, t);
    Store.batch(() => col.forEach((x, i) => {
      const patch = {};
      if (x.order !== i) patch.order = i;
      if (x.id === id && statusOf(x) !== status) { patch.status = status; patch.done = status === 'done'; }
      if (Object.keys(patch).length) Store.update('tasks', x.id, patch);
    }));
    if (status === 'done' && timerRunning(id)) stopTimer();
  }

  function updatePhases(fn) {
    const p = Store.get('projects', ui.projectId);
    Store.update('projects', p.id, { phases: fn((p.phases || []).slice()) });
  }

  // Adjunta archivos a una idea o proyecto.
  let attachTarget = null;
  async function attachFiles(col, id, fileList) {
    const files = [...fileList];
    if (!files.length) return;
    toast(files.length > 1 ? `Guardando ${files.length} archivos…` : 'Guardando archivo…');
    const metas = [];
    for (const f of files) {
      try { metas.push(await Files.save(f)); } catch (e) { console.warn(e); }
    }
    const item = Store.get(col, id);
    if (!item) return;
    Store.update(col, id, { attachments: [...(item.attachments || []), ...metas] });
    const local = metas.filter(m => !m.cloud).length;
    toast(!metas.length ? 'No se pudo guardar el archivo'
      : local && Sync.cloud() ? `${local} archivo(s) demasiado grande(s): solo en este dispositivo`
      : local ? 'Guardado en este dispositivo (se subirá al iniciar sesión)'
      : 'Archivo adjuntado');
  }

  // Sube los adjuntos que se añadieron sin sesión iniciada.
  let flushing = false;
  async function flushAttachments() {
    if (flushing || !Sync.cloud()) return;
    flushing = true;
    try {
      for (const col of ['ideas', 'projects']) {
        for (const item of Store.all(col).slice()) {
          const pending = (item.attachments || []).filter(a => !a.cloud && a.size <= Files.MAX_CLOUD);
          if (!pending.length) continue;
          const done = new Set();
          for (const a of pending) if (await Files.upload(a)) done.add(a.id);
          if (!done.size) continue;
          const fresh = Store.get(col, item.id);
          if (fresh) Store.update(col, item.id, { attachments: fresh.attachments.map(a => (done.has(a.id) ? { ...a, cloud: true } : a)) });
        }
      }
    } finally {
      flushing = false;
    }
  }

  const ACTIONS = {
    'add-event': d => FORMS.event(null, d.date),
    'edit-event': d => FORMS.event(d.id),
    'add-task': d => FORMS.task(null, {
      ...(d.project ? { projectId: d.project } : ui.view === 'proyecto' ? { projectId: ui.projectId } : {}),
      ...(d.phase ? { phaseId: d.phase } : {}),
      ...(d.status ? { status: d.status } : {}),
    }),
    'edit-task': d => FORMS.task(d.id),
    'toggle-task': d => toggleTask(d.id),
    'add-email': () => FORMS.email(null),
    'edit-email': d => FORMS.email(d.id),
    'add-delivery': d => FORMS.delivery(null, d.project ? { projectId: d.project } : {}),
    'edit-delivery': d => FORMS.delivery(d.id),
    'toggle-delivery': d => toggle('deliveries', d.id),
    'add-note': () => FORMS.note(null),
    'edit-note': d => FORMS.note(d.id),
    'pin-note': d => {
      const wasPinned = Store.get('notes', d.id).pinned;
      Store.batch(() => Store.all('notes').forEach(n => Store.update('notes', n.id, { pinned: !wasPinned && n.id === d.id })));
    },
    'delete': d => {
      if (!confirm('¿Eliminar este elemento?')) return;
      removeItem(d.col, d.id);
      toast('Eliminado');
    },

    // Proyectos
    'add-project': () => FORMS.project(null),
    'edit-project': d => FORMS.project(d.id),
    'filter-projects': d => { ui.projectFilter = d.filter; render(); },
    'project-tab': d => {
      ui.projectTab = d.tab;
      history.replaceState(null, '', `#proyecto/${ui.projectId}${d.tab === 'tablero' ? '' : `/${d.tab}`}`);
      render();
    },
    'board-phase': d => { ui.boardPhase = d.filter; render(); },
    'phase-add': () => {
      const name = (prompt('Nombre de la nueva fase:') || '').trim();
      if (name) updatePhases(ph => [...ph, { id: uidLocal('ph'), name }]);
    },
    'phase-rename': d => {
      const p = Store.get('projects', ui.projectId);
      const f = (p.phases || []).find(x => x.id === d.phase);
      const name = (prompt('Nuevo nombre de la fase:', f ? f.name : '') || '').trim();
      if (name) updatePhases(ph => ph.map(x => (x.id === d.phase ? { ...x, name } : x)));
    },
    'phase-move': d => updatePhases(ph => {
      const i = ph.findIndex(x => x.id === d.phase);
      const j = i + Number(d.dir);
      if (i < 0 || j < 0 || j >= ph.length) return ph;
      [ph[i], ph[j]] = [ph[j], ph[i]];
      return ph;
    }),
    'phase-delete': d => {
      if (!confirm('¿Eliminar la fase? Sus tareas se conservan, sin fase.')) return;
      Store.batch(() => {
        projectTasks(ui.projectId).filter(t => t.phaseId === d.phase).forEach(t => Store.update('tasks', t.id, { phaseId: '' }));
        updatePhases(ph => ph.filter(x => x.id !== d.phase));
      });
      if (ui.boardPhase === d.phase) ui.boardPhase = '';
    },
    'add-link': d => FORMS.link(d.id),
    'remove-link': d => {
      const p = Store.get('projects', d.id);
      Store.update('projects', d.id, { links: (p.links || []).filter(l => l.id !== d.link) });
    },
    'add-timelog': d => FORMS.timelog(null, { projectId: d.project }),
    'edit-timelog': d => FORMS.timelog(d.id),

    // Cronómetro
    'timer-toggle': d => toggleTimer(d.id),
    'timer-stop': () => stopTimer(),

    // Ideas
    'add-idea': d => FORMS.idea(null, d.project ? { projectId: d.project } : {}),
    'edit-idea': d => FORMS.idea(d.id),
    'filter-ideas': d => { ui.ideaFilter = d.filter; render(); },
    'idea-to-task': d => {
      const i = Store.get('ideas', d.id);
      FORMS.task(null, { title: i.title, notes: i.body || '', projectId: i.projectId || '' }, created =>
        Store.update('ideas', i.id, { status: 'convertida', convertedTo: { type: 'task', id: created.id } }));
    },
    'idea-to-project': d => {
      const i = Store.get('ideas', d.id);
      FORMS.project(null, { name: i.title, description: i.body || '' }, created =>
        Store.update('ideas', i.id, { status: 'convertida', projectId: created.id, convertedTo: { type: 'project', id: created.id } }));
    },

    // Archivos
    'attach': d => { attachTarget = { col: d.col, id: d.id }; $('#attach-file').click(); },
    'open-file': async d => {
      const w = window.open('', '_blank');
      try {
        const u = await Files.url(d.file);
        if (!u) {
          if (w) w.close();
          return toast(Sync.cloud() ? 'Este archivo solo está en el dispositivo donde se subió' : 'Inicia sesión para ver este archivo');
        }
        if (w) w.location.href = u; else location.href = u;
      } catch (e) {
        if (w) w.close();
        toast('No se pudo abrir el archivo');
      }
    },
    'remove-file': d => {
      if (!confirm('¿Quitar este archivo?')) return;
      const item = Store.get(d.col, d.id);
      Store.update(d.col, d.id, { attachments: (item.attachments || []).filter(a => a.id !== d.file) });
      Files.remove(d.file);
    },
    'close-modal': () => closeModal(),
    'sync-signin': () => Sync.signIn(),
    'sync-signout': () => {
      if (!confirm('¿Cerrar sesión? Tus datos se quedan en este dispositivo pero dejarán de sincronizarse.')) return;
      Sync.signOut();
    },
    'sync-now': () => Sync.syncNow(),
    'sync-choice': d => {
      closeModal(true);
      if (syncChoiceResolve) syncChoiceResolve(d.choice);
      syncChoiceResolve = null;
    },
    'open-more': () => openSheet('Más', MORE.map(n => sheetItem(n.icon, n.label, `href="#${n.id}"`)).join('')),
    'quick-add': () => {
      const direct = {
        calendario: 'add-event', tareas: 'add-task', correos: 'add-email', entregas: 'add-delivery', notas: 'add-note',
        proyectos: 'add-project', proyecto: 'add-task', ideas: 'add-idea',
      };
      if (direct[ui.view]) return ACTIONS[direct[ui.view]]({});
      openSheet('Crear', [
        ['calendar', 'Evento', 'add-event'], ['check', 'Tarea', 'add-task'], ['briefcase', 'Proyecto', 'add-project'],
        ['bulb', 'Idea', 'add-idea'], ['package', 'Entrega', 'add-delivery'], ['mail', 'Correo', 'add-email'], ['note', 'Nota', 'add-note'],
      ].map(([ic, label, action]) => sheetItem(ic, label, `data-action="${action}"`)).join(''));
    },

    'day-prev': () => { ui.date = addDays(ui.date, -1); render(); },
    'day-next': () => { ui.date = addDays(ui.date, 1); render(); },
    'day-today': () => { ui.date = today(); render(); },
    'week-prev': () => { ui.weekStart = addDays(ui.weekStart, -7); render(); },
    'week-next': () => { ui.weekStart = addDays(ui.weekStart, 7); render(); },
    'week-today': () => { ui.weekStart = startOfWeek(today()); render(); },
    'filter-tasks': d => { ui.taskFilter = d.filter; render(); },
    'filter-emails': d => { ui.emailFilter = d.filter; render(); },

    'weather-refresh': () => { Weather.load({ force: true }); render(); },
    'city-search': async () => {
      const q = ($('#city-q')?.value || '').trim();
      ui.city = { query: q, results: [], loading: !!q, error: '' };
      render();
      if (!q) return;
      try {
        ui.city.results = await Weather.searchCity(q);
        if (!ui.city.results.length) ui.city.error = 'No encontré esa ciudad. Prueba con otro nombre.';
      } catch (e) {
        ui.city.error = 'No se pudo buscar. Revisa tu conexión.';
      }
      ui.city.loading = false;
      render();
    },
    'pick-city': d => {
      const place = ui.city.results[Number(d.idx)];
      if (!place) return;
      ui.city = { query: '', results: [], loading: false, error: '' };
      Store.setSetting('weatherPlace', place);
      Weather.load({ force: true });
      toast(`Clima de ${place.name}`);
    },
    'use-location': () => {
      Store.setSetting('weatherPlace', null);
      Weather.load({ force: true });
      toast('Usando tu ubicación');
    },

    'export': () => {
      const blob = new Blob([JSON.stringify(Store.exportData(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `organizador-copia-${today()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Copia exportada');
    },
    'import': () => $('#import-file').click(),
    'reset-sample': () => {
      if (!confirm('Esto reemplaza todos tus datos por los de ejemplo. ¿Continuar?')) return;
      Store.reset(seed);
      toast('Datos de ejemplo cargados');
    },
    'clear-all': () => {
      if (!confirm('Se borrarán todos tus eventos, tareas, correos, entregas y notas. ¿Continuar?')) return;
      const name = Store.getSetting('name');
      Store.reset(() => ({ settings: { name } }));
      toast('Datos borrados');
    },
  };

  const CHANGES = {
    'set-date': el => { ui.date = el.value || today(); render(); },
    'email-status': el => Store.update('emails', el.dataset.id, { status: el.value }),
    'set-name': el => { Store.setSetting('name', el.value.trim()); toast('Nombre guardado'); },
    'project-status': el => Store.update('projects', el.dataset.id, { status: el.value }),
    'idea-status': el => Store.update('ideas', el.dataset.id, { status: el.value }),
    'ideas-project': el => { ui.ideaProject = el.value; render(); },
  };

  /* ---------- Toast ---------- */

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  /* ---------- Arranque ---------- */

  let syncChoiceResolve = null;

  // Primera vez que este dispositivo encuentra datos en la nube.
  function chooseSyncStart() {
    return new Promise(resolve => {
      syncChoiceResolve = resolve;
      openSheet('Ya tienes datos en la nube', `
        <p class="muted sheet-text">¿Qué hacemos con los datos que hay en este dispositivo?</p>
        ${sheetItem('cloud', 'Usar los de la nube (recomendado)', 'data-action="sync-choice" data-choice="cloud"')}
        ${sheetItem('refresh', 'Combinar con los de este dispositivo', 'data-action="sync-choice" data-choice="merge"')}`);
      $('#modal-root .modal-backdrop').classList.add('locked');
    });
  }

  function init() {
    Store.init(seed);
    migrateWork();
    Store.subscribe(render);
    // Lo que llega de otro dispositivo puede venir con el formato antiguo.
    Store.subscribe(meta => { if (meta.fromSync) migrateWork(); });

    Sync.setChooser(chooseSyncStart);
    let lastSyncStatus = Sync.state.status;
    Sync.subscribe(s => {
      $('#sync-indicator').innerHTML = syncPill();
      if (ui.view === 'ajustes' && s.status !== lastSyncStatus && !modalOpen()) render();
      if (s.status === 'synced' && lastSyncStatus !== 'synced') flushAttachments();
      lastSyncStatus = s.status;
    });
    Sync.boot();

    // Captura rápida de ideas.
    document.addEventListener('submit', ev => {
      const form = ev.target;
      if (form.dataset.form !== 'idea-capture') return;
      ev.preventDefault();
      const title = form.elements.title.value.trim();
      if (!title) return;
      Store.add('ideas', { title, body: '', projectId: form.elements.projectId.value, status: 'nueva', impact: '', attachments: [] });
      toast('Idea guardada');
      $('.capture input[name=title]')?.focus();
    });

    // Arrastrar: tarjetas del tablero y archivos sobre las zonas de adjuntos.
    let dragId = null;
    const clearDrop = () => document.querySelectorAll('.drop-over').forEach(e => e.classList.remove('drop-over'));
    const hasFiles = ev => [...(ev.dataTransfer?.types || [])].includes('Files');
    document.addEventListener('dragstart', ev => {
      const card = ev.target.closest?.('.kcard');
      if (!card) return;
      dragId = card.dataset.id;
      ev.dataTransfer.setData('text/plain', dragId);
      ev.dataTransfer.effectAllowed = 'move';
      requestAnimationFrame(() => card.classList.add('dragging'));
    });
    document.addEventListener('dragend', () => {
      dragId = null;
      clearDrop();
      document.querySelectorAll('.dragging').forEach(e => e.classList.remove('dragging'));
    });
    document.addEventListener('dragover', ev => {
      const zone = dragId ? ev.target.closest?.('.kcol') : hasFiles(ev) ? ev.target.closest?.('[data-drop-attach]') : null;
      if (hasFiles(ev) || zone) ev.preventDefault(); // evita que el navegador abra el archivo
      if (zone && !zone.classList.contains('drop-over')) { clearDrop(); zone.classList.add('drop-over'); }
      if (!zone) clearDrop();
    });
    document.addEventListener('drop', ev => {
      if (hasFiles(ev)) {
        ev.preventDefault();
        clearDrop();
        const zone = ev.target.closest?.('[data-drop-attach]');
        if (zone) attachFiles(zone.dataset.col, zone.dataset.id, ev.dataTransfer.files);
        return;
      }
      const col = ev.target.closest?.('.kcol');
      if (!col || !dragId) return;
      ev.preventDefault();
      const before = ev.target.closest('.kcard');
      moveTask(dragId, col.dataset.status, before && before.dataset.id !== dragId ? before.dataset.id : null);
    });

    $('#attach-file').addEventListener('change', ev => {
      const files = ev.target.files;
      if (attachTarget && files.length) attachFiles(attachTarget.col, attachTarget.id, files);
      attachTarget = null;
      setTimeout(() => { ev.target.value = ''; }, 0);
    });

    document.addEventListener('click', ev => {
      if (ev.target.classList.contains('modal-backdrop')) return closeModal();
      if (ev.target.closest('.sheet a')) return closeModal();
      if (ev.target.matches('.date-pill input[type=date]')) {
        try { ev.target.showPicker(); } catch (e) { /* navegador sin showPicker */ }
        return;
      }
      const el = ev.target.closest('[data-action]');
      if (!el || !ACTIONS[el.dataset.action]) return;
      ev.preventDefault();
      ACTIONS[el.dataset.action](el.dataset, el);
    });

    document.addEventListener('change', ev => {
      const el = ev.target.closest('[data-change]');
      if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el);
    });

    document.addEventListener('input', ev => {
      if (ev.target.dataset.input === 'task-search') {
        ui.taskQuery = ev.target.value;
        $('#task-list').innerHTML = taskListHTML();
      }
    });

    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && modalOpen()) closeModal();
      if (ev.key === 'Enter' && ev.target.id === 'city-q') ACTIONS['city-search']();
    });

    Weather.subscribe(() => {
      if ((ui.view === 'panel' || ui.view === 'calendario') && !modalOpen()) render();
    });

    // Reloj en vivo sin repintar toda la vista.
    setInterval(() => {
      const tm = Store.getSetting('timer');
      if (tm) document.querySelectorAll('[data-timer-elapsed]').forEach(el => { el.textContent = elapsedText(tm.start); });
      const t = $('[data-clock]');
      if (!t) return;
      const { hm, s } = clockParts();
      t.textContent = hm;
      $('[data-clock-sec]').textContent = s;
    }, 1000);

    $('#import-file').addEventListener('change', async ev => {
      const file = ev.target.files[0];
      ev.target.value = '';
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!confirm('Esto reemplaza tus datos actuales por los de la copia. ¿Continuar?')) return;
        Store.importData(data);
        toast('Copia importada');
      } catch (e) {
        alert(e.message || 'No se pudo leer el archivo.');
      }
    });

    window.addEventListener('hashchange', route);

    // Refresca el panel cada minuto para mantener "Ahora" y la próxima reunión al día.
    setInterval(() => {
      if (ui.view === 'panel' && !modalOpen() && document.activeElement === document.body) render();
    }, 60000);

    route();
    Weather.load();
    setInterval(() => Weather.load(), 10 * 60 * 1000);
  }

  init();
})();
