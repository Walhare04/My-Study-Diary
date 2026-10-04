# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.

## Estado actual
- v1.1: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha y lista
  de sesiones.
- Datos en localStorage, sin cambios de formato desde v1.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- La mejor racha se calcula al vuelo, no se guarda: así el formato de datos no cambia y
  no hay riesgo de perder sesiones ya guardadas.
- La mejor racha excluye fechas futuras, siguiendo la regla de `AGENTS.md`.

## Aprendizajes y errores a evitar
- `AGENTS.md` decía que los datos eran `{ date, topic, minutes }`, pero el código siempre
  usó `{ id, fecha, tema, minutos }`. El doc mentía; ya está corregido. Si algún día se
  renombran las propiedades, habrá que migrar los datos guardados.
- Cuando se añada borrar o editar sesiones, la mejor racha podrá **bajar** (hoy, al no
  poder borrar, solo sube).

## Próximos pasos
- (vacío por ahora)