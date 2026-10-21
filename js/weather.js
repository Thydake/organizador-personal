/*
 * Clima con Open-Meteo (gratis, sin clave).
 * Ubicación: la ciudad elegida en Ajustes (setting `weatherPlace`) o, si no hay,
 * la del navegador. La previsión se guarda en caché 30 minutos.
 */
const Weather = (() => {
  const CACHE_KEY = 'organizador-personal:weather';
  const TTL = 30 * 60 * 1000;

  // Códigos WMO -> [descripción, tipo de icono]
  const CODES = {
    0: ['Despejado', 'clear'], 1: ['Mayormente despejado', 'partly'], 2: ['Parcialmente nublado', 'partly'],
    3: ['Nublado', 'cloud'], 45: ['Niebla', 'fog'], 48: ['Niebla helada', 'fog'],
    51: ['Llovizna ligera', 'drizzle'], 53: ['Llovizna', 'drizzle'], 55: ['Llovizna intensa', 'drizzle'],
    56: ['Llovizna helada', 'drizzle'], 57: ['Llovizna helada', 'drizzle'],
    61: ['Lluvia ligera', 'rain'], 63: ['Lluvia', 'rain'], 65: ['Lluvia intensa', 'rain'],
    66: ['Lluvia helada', 'rain'], 67: ['Lluvia helada', 'rain'],
    71: ['Nieve ligera', 'snow'], 73: ['Nieve', 'snow'], 75: ['Nieve intensa', 'snow'], 77: ['Granizo fino', 'snow'],
    80: ['Chubascos ligeros', 'rain'], 81: ['Chubascos', 'rain'], 82: ['Chubascos fuertes', 'rain'],
    85: ['Chubascos de nieve', 'snow'], 86: ['Chubascos de nieve', 'snow'],
    95: ['Tormenta', 'storm'], 96: ['Tormenta con granizo', 'storm'], 99: ['Tormenta con granizo', 'storm'],
  };

  const listeners = new Set();
  let state = { status: 'idle', data: null };
  let pending = null;

  function set(next) {
    state = next;
    listeners.forEach(fn => fn(state));
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* sin espacio */ }
  }

  const samePlace = (a, b) => !!a && !!b && a.lat.toFixed(2) === b.lat.toFixed(2) && a.lon.toFixed(2) === b.lon.toFixed(2);

  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Sin geolocalización'));
      navigator.geolocation.getCurrentPosition(
        p => resolve({ name: 'Tu ubicación', lat: p.coords.latitude, lon: p.coords.longitude }),
        reject,
        { timeout: 10000, maximumAge: 60 * 60 * 1000 },
      );
    });
  }

  async function fetchForecast(place) {
    const url = 'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${place.lat}&longitude=${place.lon}`
      + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day'
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
      + '&timezone=auto&forecast_days=7';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
    const j = await res.json();
    return {
      place,
      fetchedAt: Date.now(),
      current: {
        temp: j.current.temperature_2m,
        feels: j.current.apparent_temperature,
        humidity: j.current.relative_humidity_2m,
        wind: j.current.wind_speed_10m,
        code: j.current.weather_code,
        isDay: !!j.current.is_day,
      },
      daily: j.daily.time.map((date, i) => ({
        date,
        code: j.daily.weather_code[i],
        max: j.daily.temperature_2m_max[i],
        min: j.daily.temperature_2m_min[i],
        rain: j.daily.precipitation_probability_max[i],
      })),
    };
  }

  async function run(force) {
    let place = Store.getSetting('weatherPlace');
    const cache = readCache();
    const cacheFits = cache && (!place || samePlace(cache.place, place));

    if (!force && cacheFits && Date.now() - cache.fetchedAt < TTL) {
      set({ status: 'ok', data: cache });
      return;
    }
    set({ status: 'loading', data: cacheFits ? cache : null });

    if (!place) {
      try { place = await getPosition(); } catch (e) {
        set(cacheFits ? { status: 'ok', data: cache } : { status: 'nolocation', data: null });
        return;
      }
    }
    try {
      const data = await fetchForecast(place);
      writeCache(data);
      set({ status: 'ok', data });
    } catch (e) {
      console.warn('No se pudo cargar el clima', e);
      set(cacheFits ? { status: 'ok', data: cache } : { status: 'error', data: null });
    }
  }

  return {
    get state() { return state; },

    load({ force = false } = {}) {
      if (!pending) pending = run(force).finally(() => { pending = null; });
      return pending;
    },

    forDay: iso => state.data?.daily.find(d => d.date === iso) || null,

    describe: code => CODES[code] || ['—', 'cloud'],

    async searchCity(q) {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=es&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudo buscar la ciudad');
      const j = await res.json();
      return (j.results || []).map(r => ({
        name: r.name,
        region: [r.admin1, r.country].filter(Boolean).join(', '),
        lat: r.latitude,
        lon: r.longitude,
      }));
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
})();
