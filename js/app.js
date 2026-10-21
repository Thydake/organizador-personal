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
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
  };
  const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ---------- Catálogos ---------- */

  const PRIORITY = { alta: 'Alta', media: 'Media', baja: 'Baja' };
  const PRIO_ORDER = { alta: 0, media: 1, baja: 2 };
  const COLORS = { aqua: 'Aquamarina', orange: 'Naranja', violet: 'Violeta', sky: 'Azul' };
  const EMAIL_STATUS = { sin_leer: 'Sin leer', responder: 'Por responder', esperando: 'Esperando respuesta', hecho: 'Hecho' };

  const prioOf = x => PRIO_ORDER[x.priority] ?? 1;
  const prioBadge = p => `<span class="prio prio-${p || 'media'}">${PRIORITY[p] || 'Media'}</span>`;

  /* ---------- Datos de ejemplo ---------- */

  function seed(make) {
    const t = today();
    return {
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
        make({ title: 'Finalizar presentación de producto', priority: 'alta', due: t, project: 'Proyecto Alpha', done: false }),
        make({ title: 'Revisar feedback de clientes', priority: 'alta', due: addDays(t, 1), project: 'Producto', done: false }),
        make({ title: 'Responder correos importantes', priority: 'media', due: t, project: '', done: false }),
        make({ title: 'Planificar contenido de la próxima semana', priority: 'media', due: addDays(t, 3), project: 'Marketing', done: false }),
        make({ title: 'Actualizar presupuesto Q4', priority: 'baja', due: addDays(t, 5), project: 'Finanzas', done: false }),
        make({ title: 'Enviar acta de la reunión', priority: 'media', due: addDays(t, -1), project: 'Producto', done: true }),
      ],
      emails: [
        make({ from: 'Ana Pérez', subject: 'Propuesta revisada para Alpha', status: 'responder', priority: 'alta', date: t }),
        make({ from: 'Equipo Alpha', subject: 'Cambios en el alcance del sprint', status: 'sin_leer', priority: 'alta', date: t }),
        make({ from: 'Facturación', subject: 'Factura de octubre', status: 'sin_leer', priority: 'media', date: addDays(t, -1) }),
        make({ from: 'Marcos Ruiz', subject: '¿Café el jueves?', status: 'esperando', priority: 'baja', date: addDays(t, -2) }),
        make({ from: 'Newsletter Diseño', subject: 'Tendencias de la semana', status: 'hecho', priority: 'baja', date: addDays(t, -3) }),
      ],
      deliveries: [
        make({ title: 'Informe mensual de resultados', date: addDays(t, 1), project: 'Proyecto Alpha', done: false }),
        make({ title: 'Mockups v2 de la app', date: addDays(t, 4), project: 'Diseño', done: false }),
        make({ title: 'Propuesta comercial Beta', date: addDays(t, 10), project: 'Ventas', done: false }),
        make({ title: 'Guion del vídeo de lanzamiento', date: addDays(t, -2), project: 'Marketing', done: true }),
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

  /* ---------- Estado de la interfaz ---------- */

  const VIEWS = ['panel', 'calendario', 'tareas', 'correos', 'entregas', 'notas', 'ajustes'];
  const ui = {
    view: 'panel',
    date: today(),
    weekStart: startOfWeek(today()),
    taskFilter: 'pendientes',
    taskQuery: '',
    emailFilter: 'pendientes',
    city: { query: '', results: [], loading: false, error: '' },
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

  function taskRow(t, { actions = false } = {}) {
    const overdue = !t.done && t.due && t.due < today();
    return `
      <li class="row task-row ${t.done ? 'is-done' : ''}">
        <button class="check ${t.done ? 'on' : ''}" data-action="toggle-task" data-id="${t.id}"
          aria-label="${t.done ? 'Marcar como pendiente' : 'Marcar como hecha'}">${icon('tick')}</button>
        <div class="row-main" data-action="edit-task" data-id="${t.id}">
          <span class="row-title">${esc(t.title)}</span>
          <span class="row-meta">
            ${prioBadge(t.priority)}
            ${t.project ? `<span class="tag">${esc(t.project)}</span>` : ''}
            ${t.due ? `<span class="due ${overdue ? 'overdue' : ''}">${icon('clock')}${relDay(t.due)}</span>` : ''}
          </span>
        </div>
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

  function deliveryRow(x, { actions = false } = {}) {
    const n = diffDays(x.date, today());
    const urgency = x.done ? '' : n < 0 ? 'overdue' : n <= 1 ? 'soon' : '';
    return `
      <li class="row delivery-row ${x.done ? 'is-done' : ''}">
        <button class="check ${x.done ? 'on' : ''}" data-action="toggle-delivery" data-id="${x.id}"
          aria-label="${x.done ? 'Marcar como pendiente' : 'Marcar como entregada'}">${icon('tick')}</button>
        <div class="row-main" data-action="edit-delivery" data-id="${x.id}">
          <span class="row-title">${esc(x.title)}</span>
          <span class="row-meta">
            ${x.project ? `<span class="tag">${esc(x.project)}</span>` : ''}
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
      .filter(x => !q || `${x.title} ${x.project || ''}`.toLowerCase().includes(q));
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

  function viewSettings() {
    return `${pageHead('Ajustes', '', 'Personaliza el organizador y gestiona tus datos.')}
      <section class="settings-grid">
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
  };

  /* ---------- Navegación ---------- */

  const NAV = [
    { id: 'panel', label: 'Panel', icon: 'home' },
    { id: 'calendario', label: 'Calendario', icon: 'calendar' },
    { id: 'tareas', label: 'Tareas', icon: 'check' },
    { id: 'correos', label: 'Correos', icon: 'mail' },
    { id: 'entregas', label: 'Entregas', icon: 'package' },
    { id: 'notas', label: 'Notas', icon: 'note' },
  ];

  function renderNav() {
    const counts = {
      tareas: pendingTasks().length,
      correos: pendingEmails().length,
      entregas: upcomingDeliveries(today(), 7).length,
    };
    $('#nav').innerHTML = NAV.map(n => `
      <a href="#${n.id}" class="nav-item ${ui.view === n.id ? 'active' : ''}">
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
      .map(n => tab(`#${n.id}`, n.icon, n.label, ui.view === n.id, counts[n.id])).join('')
      + tab('', 'grid', 'Más', inMore, moreCount, 'open-more');
    $('#fab').hidden = ui.view === 'ajustes';
  }

  const MORE = [
    { id: 'entregas', label: 'Entregas', icon: 'package' },
    { id: 'notas', label: 'Notas', icon: 'note' },
    { id: 'ajustes', label: 'Ajustes', icon: 'settings' },
  ];

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
    renderNav();
    $('#view').innerHTML = RENDERERS[ui.view]();
  }

  function route() {
    const v = location.hash.slice(1);
    ui.view = VIEWS.includes(v) ? v : 'panel';
    closeModal();
    render();
    $('#main').scrollTop = 0;
  }

  /* ---------- Formularios (modal) ---------- */

  function fieldHTML(f, value) {
    const v = value ?? f.default ?? '';
    const id = `f-${f.name}`;
    const req = f.required ? 'required' : '';
    let input;
    if (f.type === 'textarea') {
      input = `<textarea id="${id}" name="${f.name}" rows="${f.rows || 4}" ${req} placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>`;
    } else if (f.type === 'select') {
      input = `<select id="${id}" name="${f.name}">${Object.entries(f.options)
        .map(([val, lab]) => `<option value="${val}" ${val === v ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
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

  function openForm({ title, fields, values = {}, validate, onSave, onDelete }) {
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
      if (!confirm('¿Eliminar este elemento?')) return;
      onDelete();
      closeModal();
      toast('Eliminado');
    });

    setTimeout(() => form.querySelector('input:not([type=radio]), textarea, select')?.focus(), 30);
  }

  function closeModal() { $('#modal-root').innerHTML = ''; }
  const modalOpen = () => !!$('#modal-root').firstElementChild;

  // Crea o edita un elemento de una colección con el mismo formulario.
  function editItem(col, id, { title, fields, defaults = {}, validate, toData = d => d }) {
    const item = id ? Store.get(col, id) : null;
    openForm({
      title: item ? title[1] : title[0],
      fields,
      values: item || defaults,
      validate,
      onSave: data => item ? Store.update(col, id, toData(data)) : Store.add(col, toData(data)),
      onDelete: item ? () => Store.remove(col, id) : null,
    });
  }

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
    task: id => editItem('tasks', id, {
      title: ['Nueva tarea', 'Editar tarea'],
      defaults: { priority: 'media', due: ui.view === 'panel' ? ui.date : '' },
      fields: [
        { name: 'title', label: 'Tarea', required: true, wide: true, placeholder: '¿Qué hay que hacer?' },
        { name: 'priority', label: 'Prioridad', type: 'select', options: PRIORITY },
        { name: 'due', label: 'Fecha límite', type: 'date' },
        { name: 'project', label: 'Proyecto', wide: true, placeholder: 'Opcional' },
        { name: 'notes', label: 'Notas', type: 'textarea', wide: true, rows: 3 },
      ],
      toData: d => ({ ...d, done: id ? Store.get('tasks', id).done : false }),
    }),
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
    delivery: id => editItem('deliveries', id, {
      title: ['Nueva entrega', 'Editar entrega'],
      defaults: { date: addDays(today(), 1) },
      fields: [
        { name: 'title', label: 'Entrega', required: true, wide: true, placeholder: 'Ej. Informe mensual' },
        { name: 'date', label: 'Fecha límite', type: 'date', required: true },
        { name: 'project', label: 'Proyecto', placeholder: 'Opcional' },
        { name: 'notes', label: 'Notas', type: 'textarea', wide: true, rows: 3 },
      ],
      toData: d => ({ ...d, done: id ? Store.get('deliveries', id).done : false }),
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

  const ACTIONS = {
    'add-event': d => FORMS.event(null, d.date),
    'edit-event': d => FORMS.event(d.id),
    'add-task': () => FORMS.task(null),
    'edit-task': d => FORMS.task(d.id),
    'toggle-task': d => toggle('tasks', d.id),
    'add-email': () => FORMS.email(null),
    'edit-email': d => FORMS.email(d.id),
    'add-delivery': () => FORMS.delivery(null),
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
      Store.remove(d.col, d.id);
      toast('Eliminado');
    },
    'close-modal': closeModal,
    'open-more': () => openSheet('Más', MORE.map(n => sheetItem(n.icon, n.label, `href="#${n.id}"`)).join('')),
    'quick-add': () => {
      const direct = { calendario: 'add-event', tareas: 'add-task', correos: 'add-email', entregas: 'add-delivery', notas: 'add-note' };
      if (direct[ui.view]) return ACTIONS[direct[ui.view]]({});
      openSheet('Crear', [
        ['calendar', 'Evento', 'add-event'], ['check', 'Tarea', 'add-task'], ['mail', 'Correo', 'add-email'],
        ['package', 'Entrega', 'add-delivery'], ['note', 'Nota', 'add-note'],
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

  function init() {
    Store.init(seed);
    Store.subscribe(render);

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
