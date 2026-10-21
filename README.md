# Organizador personal

Panel diario con calendario, tareas, correos en seguimiento, entregas y notas.
HTML + CSS + JavaScript sin dependencias ni compilación.

## Cómo abrirlo

Doble clic en `index.html`, o con un servidor local:

```
python -m http.server 5173
```

y abre http://localhost:5173

## Estructura

- `index.html` – esqueleto (barra lateral + vista)
- `css/styles.css` – estilo oscuro aquamarina; tokens de color en `:root`
- `js/store.js` – datos en `localStorage`; cada elemento lleva `source` para futuras integraciones
- `js/weather.js` – clima con Open-Meteo (sin clave); ubicación del navegador o ciudad elegida en Ajustes
- `js/integrations.js` – registro de conectores (Google Calendar, Gmail, Drive, Slack: pendientes)
- `js/app.js` – vistas, formularios y acciones

Los datos viven en el navegador: usa **Ajustes → Exportar copia** para respaldarlos.

## Móvil

Por debajo de 760 px la barra lateral pasa a ser una barra de pestañas inferior
(Panel, Calendario, Tareas, Correos, Más), aparece un botón flotante "+" y el
calendario se muestra como agenda vertical. `manifest.webmanifest` permite
añadirla a la pantalla de inicio cuando se sirve por https.

Los datos se guardan por dispositivo: el móvil y el PC no comparten datos
(usa Exportar/Importar copia hasta que haya sincronización).

## Próximas fases

1. Publicarla online para abrirla desde el móvil.
2. Integraciones reales vía `Integrations.register()` + `Store.upsertExternal()`.
