# MyStudyDiary — Diario de Estudio

Web sencilla para registrar sesiones de estudio y motivarte viendo tu racha de días
seguidos estudiando. Proyecto educativo: HTML, CSS y JavaScript puros, sin frameworks,
sin build ni dependencias.

## Cómo abrirlo

Abre `index.html` con doble clic. Funciona desde `file://`, sin servidor ni instalación.

## Qué incluye (v1.3)

- Registro de sesiones: fecha (editable para días anteriores), tema (obligatorio) y minutos (mayores que 0).
- Racha actual en grande, con 🔥, y mejor racha.
- Total de minutos de la semana en curso (lunes–domingo) en formato `X h Y min`.
- Días estudiados del mes calendario.
- Lista de sesiones, de la más reciente a la más antigua.
- Datos guardados en `localStorage` (se pierden al borrar los datos del sitio), con fecha local.

## Verificación

- Sintaxis: `node --check app.js`.
- Pruebas: `node --test` (test de los helpers de fecha, en `heatmap.test.js`).
- Funcional: con Chrome DevTools — abre `index.html`, prueba el flujo principal, revisa la consola y comprueba la vista móvil (375 px).

## Reglas importantes

- Las fechas siempre son locales (`"AAAA-MM-DD"`), nunca UTC. No uses `toISOString()` ni `new Date("AAAA-MM-DD")`.
- Varias sesiones el mismo día cuentan como un día para la racha. Las fechas futuras no suman en rachas (sí en el total semanal mientras caigan dentro de la semana).
- La mejor racha se calcula al vuelo, sin guardar; las futuras no cuentan, y varios registros del mismo día son un día.

Ver detalle en `AGENTS.md`, `docs/constitucion.md` y `specs/001-heat-map/spec.md`.

## Estado

Versiones y decisiones en `MEMORY.md`. Estado actual: v1.3 (base del mapa de calor, `heatmap.js`).

## Licencia

Proyecto personal de estudio.