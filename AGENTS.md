# AGENTS.md — Diario de Estudio

Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.

## Stack y estructura
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica y datos).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
(`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.

## Convenciones
- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.

## Datos
- localStorage, clave `diario-estudio-sesiones`: array de `{ id, fecha, tema, minutos }`.
Los nombres van en español, no los cambies sin una migración.
- `fecha` es un texto `"AAAA-MM-DD"` (lo que entrega `<input type="date">`), `minutos` es
un número y `id` es un `Date.now()` que solo sirve para ordenar sesiones del mismo día.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
perderá sus sesiones.

## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día. Usa los helpers `aISO`,
`moverDias` y `textoFecha` que ya hay en `app.js`.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Mejor racha = el tramo más largo de días consecutivos con sesión de todo el historial,
sin ancla a hoy. Se cuenta desde cada día hacia atrás y se queda con el máximo. No
aplica la regla de "ayer": cuenta historia, no presente.
- Para las rachas, varias sesiones el mismo día cuentan como un solo día y las fechas
  futuras no suman.
- Total de la semana = suma de `minutos` de las sesiones cuya `fecha` está en la semana
  en curso (lunes–domingo), en fecha local. A diferencia de las rachas, las fechas
  futuras **sí cuentan** mientras caigan dentro de la semana en curso. Se calcula al
  vuelo, sin guardarse.
- Días estudiados este mes = cantidad de fechas distintas (`AAAA-MM-DD`) con al menos
  una sesión en el mes calendario de hoy (`AAAA-MM`), en fecha local. Las fechas
  futuras del mes **no cuentan** (solo días ya estudiados). Se calcula al vuelo, sin
  guardarse.

## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 

## Comandos
- Tests: `node --test`
## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 

## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.

## Verificación
- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome
DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil. 
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave
`diario-estudio-sesiones`. 