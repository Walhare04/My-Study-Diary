# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.

## Estado actual
- v1.3: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha, total de
  minutos de la semana, días estudiados este mes y lista de sesiones.
- Incluye la base de tests del mapa de calor (heatmap.test.js, 9/9 en verde).
- Proyecto subido a GitHub: `https://github.com/Walhare04/My-Study-Diary.git` (rama `main`).
- Datos en localStorage, sin cambios de formato desde v1.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- La mejor racha se calcula al vuelo, no se guarda: así el formato de datos no cambia y
  no hay riesgo de perder sesiones ya guardadas.
- La mejor racha excluye fechas futuras, siguiendo la regla de `AGENTS.md`.
- El total semanal se calcula al vuelo. La semana es lunes–domingo (fecha local) y, a
  diferencia de las rachas, las fechas futuras sí cuentan mientras caigan dentro de la
  semana en curso. Se muestra en formato `X h Y min` (o `Y min` si es menos de 60).
- Días estudiados este mes = fechas distintas del mes calendario de hoy, calculado al
  vuelo. Las fechas futuras del mes no cuentan. Se muestra en la tarjeta "Esta semana"
  como "Días este mes: N" (singular/plural).
- Diseño visual: tono "cuaderno de estudio" cálido (fondo papel, tinta oscura), serif
  local en títulos/cifras y acento verde azulado para el resumen semanal, distinto del
  naranja de la racha. Cambio de piel en CSS, sin tocar lógica ni estructura.
- `.gitignore` del repo: se excluyen `opencode.json` (API key local) y los archivos de
  herramientas (`.agents/`, `.opencode/`, `skills-lock.json`). Código, docs y specs se suben.
- El clon anidado `My-Study-Diary/` (duplicado obsoleto) se eliminó; ya no hace falta
  ignorarlo. Se mejoró el `README.md` (proyecto, cómo abrir, v1.3 y verificación).

## Aprendizajes y errores a evitar
- `AGENTS.md` decía que los datos eran `{ date, topic, minutes }`, pero el código siempre
  usó `{ id, fecha, tema, minutos }`. El doc mentía; ya está corregido. Si algún día se
  renombran las propiedades, habrá que migrar los datos guardados.
- Cuando se añada borrar o editar sesiones, la mejor racha podrá **bajar** (hoy, al no
  poder borrar, solo sube).

## Próximos pasos
- (vacío por ahora)