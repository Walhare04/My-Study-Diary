# Tasks 001 — Mapa de calor de estudio

Basado en `specs/001-heat-map/spec.md` y `specs/001-heat-map/plan.md`. Tareas pequeñas (máx. 20–30 min), en orden de dependencia.

## Tareas

- [x] **T1. Preparar la lógica pura para pruebas con `node --test`**
  - **RF:** soporte a RF-1 a RF-13 (cálculo), RNF-6; alineado con criterios de finalización y constitución 3 y 4.
  - **Descripción:** crear el archivo de pruebas (p. ej. `heatmap.test.js`) con la estructura de `node:test`/`node:assert/strict` y dejar la lógica pura de `app.js` accesible desde Node sin ejecutar DOM/`localStorage` al cargar, manteniendo el funcionamiento con doble clic en `file://` y sin instalar paquetes.
  - **Depende de:** —
  - **Hecho cuando:** `node --test` ejecuta el archivo de pruebas sin errores de carga/importación y `index.html` sigue abriendo y funcionando con doble clic.

- [ ] **T2. Periodo del mapa (`obtenerPeriodoMapa`) con pruebas**
  - **RF:** RF-1, RF-2, RNF-3, RNF-6.
  - **Descripción:** implementar la función pura que recibe `hoy` y devuelve el periodo de 16 columnas semanales completas (lunes–domingo), desde el lunes de 15 semanas antes de la semana de `hoy` hasta el domingo de la semana de `hoy`, en orden columnas antigua→reciente y filas lunes→domingo. Añadir pruebas.
  - **Depende de:** T1.
  - **Hecho cuando:** `node --test` pasa casos que verifican 16×7 días, inicio/fin correctos (incluido `hoy` en distintos días de la semana), orden de filas/columnas y cruces de mes/año.

- [ ] **T3. Validación de fechas y sesiones con pruebas**
  - **RF:** RF-4, RF-10, RNF-4, RNF-6.
  - **Descripción:** implementar funciones puras para validar fecha `AAAA-MM-DD` de calendario real y sesión válida para el mapa (`minutos` número finito ≥ 0, campos presentes). Sesiones inválidas, con fecha inexistente (p. ej. `2026-02-30`) o estructura inesperada deben poder ignorarse. Añadir pruebas.
  - **Depende de:** T1.
  - **Hecho cuando:** `node --test` pasa casos que aceptan fechas/minutos válidos (incl. 0 y decimales) y rechazan formatos malos, fechas inexistentes, negativos, no numéricos/no finitos y campos faltantes.

- [ ] **T4. Niveles y totales por día con pruebas**
  - **RF:** RF-3, RF-4, RF-5, RF-7, RF-10, RNF-3, RNF-4, RNF-6.
  - **Descripción:** implementar `nivelPorMinutos(total)` (0→0, 1–29→1, 30–59→2, 60–119→3, ≥120→4) y el cálculo puro de totales por día que recibe `(sesiones, hoy)`, suma sesiones válidas, excluye fechas posteriores a `hoy`, ignora inválidas y suma duplicadas. Añadir pruebas.
  - **Depende de:** T3.
  - **Hecho cuando:** `node --test` pasa los umbrales exactos y casos de suma (varias/duplicadas), exclusión de futuras, ignorar inválidas y mezcla con almacén vacío.

- [ ] **T5. Modelo del mapa y etiquetas de mes con pruebas**
  - **RF:** RF-1, RF-2, RF-4, RF-5, RF-6, RF-7, RF-8, RF-11, RF-13, RNF-3, RNF-4, RNF-6.
  - **Descripción:** implementar la función pura que recibe `(sesiones, hoy)` y devuelve el modelo completo: días del periodo con `{fecha, totalMinutos, nivel, esFuturo}` (futuros neutros, sin minutos), y etiquetas de mes (abreviatura en español en la primera columna del periodo que contiene algún día de ese mes). Añadir pruebas.
  - **Depende de:** T2, T4.
  - **Hecho cuando:** `node --test` pasa casos de periodo con y sin datos (nivel 0/futuro neutro), clasificación pasado/hoy/futuro (incluida la semana en curso), integración de totales/niveles y etiquetas de mes en bordes de periodo.

- [ ] **T6. Datos de detalle del día con pruebas**
  - **RF:** RF-5, RF-8, RF-9, RF-10, RF-11, RNF-6.
  - **Descripción:** implementar la función pura que, dado un día (y el modelo/`hoy`), produce el detalle: fecha legible en español (local), y estado `"Sin estudio (0 min)"` (pasado/hoy total 0), total de minutos (pasado/hoy con estudio) o `"Fecha futura"` (futuro). Definir selección por defecto = `hoy`. Añadir pruebas.
  - **Depende de:** T5.
  - **Hecho cuando:** `node --test` pasa casos para día pasado/hoy con y sin minutos, día futuro y día actual por defecto.

- [ ] **T7. Estructura HTML del mapa de calor**
  - **RF:** RF-1, RF-4, RF-6, RF-8, RF-9, RF-10, RF-12, RF-13, RNF-5.
  - **Descripción:** añadir en `index.html`, junto a los resúmenes existentes, la sección del mapa con contenedores para etiquetas de mes, cuadrícula de celdas, leyenda ("Menos"–"Más", niveles 0–4) y área de detalle; preparar las celdas como elementos focables/activables.
  - **Depende de:** T1.
  - **Hecho cuando:** al abrir `index.html` la sección del mapa aparece en la página con los contenedores/leyenda/área de detalle presentes y sin errores en consola.

- [ ] **T8. Estilos del mapa y adaptación móvil (375 px)**
  - **RF:** RF-1, RF-4, RF-5, RF-6, RF-7, RF-8, RF-12, RF-13, RNF-1, RNF-2, RNF-5.
  - **Descripción:** en `styles.css`, dar estilo a la cuadrícula (16 columnas × 7 filas, lun–dom), celdas por nivel 0–4 y estado futuro neutro diferenciado, leyenda, etiquetas de mes, detalle y estados de foco/selección; ajustar tamaños para que el mapa completo quepa y sea usable en 375 px sin desplazamiento horizontal.
  - **Depende de:** T7.
  - **Hecho cuando:** en Chrome DevTools a 375 px de ancho el mapa completo (celdas, leyenda, etiquetas y detalle) se ve y usa sin scroll horizontal, con niveles y estado futuro distinguibles.

- [ ] **T9. Pintado del mapa e integración con el flujo existente**
  - **RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-11, RF-13, RNF-3, RNF-4.
  - **Descripción:** en `app.js`, generar el modelo con las funciones puras (`sesiones` actuales y `hoy` local), renderizar celdas/etiquetas/leyenda/detalle inicial (hoy seleccionado) y ejecutar este pintado al cargar y tras registrar una sesión, sin romper el resto del diario.
  - **Depende de:** T5, T6, T7, T8.
  - **Hecho cuando:** al abrir con datos existentes/vacíos y al registrar una sesión, el mapa se muestra con niveles/estado futuro correctos según los datos y el detalle inicial corresponde a hoy, sin errores en consola.

- [ ] **T10. Interacción de selección y actualización del detalle**
  - **RF:** RF-5, RF-6, RF-8, RF-9, RF-10, RF-11, RF-12, RNF-2, RNF-5.
  - **Descripción:** implementar la selección de celdas por puntero y teclado (foco/activación), actualizar el detalle al seleccionar otro día (pasado/hoy, sin estudio o futuro) y, ante cambios de datos, refrescar mapa/detalle manteniendo la selección si la fecha sigue en el periodo (si no, volver a hoy).
  - **Depende de:** T9.
  - **Hecho cuando:** con ratón y con teclado se puede seleccionar cualquier día (pasado, hoy, futuro) y el detalle muestra la fecha legible y el texto/minutos correcto; tras añadir una sesión el mapa se actualiza y la selección válida se conserva.

- [ ] **T11. Verificación final y cierre**
  - **RF:** RF-1 a RF-13, RNF-1 a RNF-6; criterios de finalización de la spec.
  - **Descripción:** ejecutar la batería de comprobaciones: `node --test` en verde, `node --check app.js`, y verificación funcional con Chrome DevTools (abrir `index.html`, probar casos principales y de borde — sin datos, datos inválidos, futuros, umbrales, hoy sin estudio —, revisar consola y vista móvil 375 px). Ajustar solo lo necesario para cumplir la spec.
  - **Depende de:** T10.
  - **Hecho cuando:** `node --test` y `node --check app.js` finalizan sin fallos, la consola no muestra errores en los casos probados, el mapa cumple los RF en escritorio y 375 px, y el resto del diario sigue funcionando.