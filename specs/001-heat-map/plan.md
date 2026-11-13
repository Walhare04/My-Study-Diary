# Plan 001 — Mapa de calor de estudio

Plan técnico para implementar `specs/001-heat-map/spec.md`, respetando `docs/constitucion.md`.

## 1. Archivos: crear o modificar y responsabilidad

| Archivo | Acción | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `index.html` | Modificar | Añadir la sección del mapa en la pantalla principal, junto a los resúmenes existentes: contenedor del mapa, zona de leyenda ("Menos"–"Más", niveles 0–4), zona de etiquetas de mes, y zona de detalle del día seleccionado. Definir elementos interactivos (celdas/días) accesibles por puntero y teclado. Sin lógica. | RF-1, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-12, RF-13, RNF-1, RNF-2, RNF-5 |
| `styles.css` | Modificar | Definir la disposición en cuadrícula de 16 semanas (columnas izq→der, filas lun→dom), estilos por nivel (0–4) y estado futuro neutro diferenciado, leyenda, etiquetas de mes y detalle; garantizar visibilidad/uso en 375 px sin desplazamiento horizontal y estados de foco/selección perceptibles. Sin lógica. | RF-1, RF-2 (representación del periodo), RF-4, RF-6, RF-7, RF-8, RF-12, RF-13, RNF-1, RNF-2, RNF-5 |
| `app.js` | Modificar | Contener (a) las **funciones puras** de cálculo del mapa, sin DOM ni almacenamiento y con `hoy` como parámetro; (b) el pintado/actualización del mapa y del detalle en la interfaz y el manejo de selección/eventos, reutilizando las sesiones ya cargadas. | RF-1 a RF-13, RNF-3, RNF-4, RNF-6 |
| `heatmap.test.js` (o `tests/heatmap.test.js`) | Crear | Pruebas automáticas de la lógica pura con `node:test`/`node:assert` (built-in), sin instalar paquetes. Cubre cálculo de periodo, validación, totales, niveles, clasificación futuro/pasado y casos límite. | Base de verificación de RF-1 a RF-5, RF-7, RF-10, RF-11, RF-13 y casos límite; criterio de finalización (tests en verde) |
| `specs/001-heat-map/plan.md` | Crear | Este documento (plan). | Trazabilidad |

> Nota: no se añaden dependencias ni build (constitución 1). El formato de datos en almacenamiento no cambia (constitución 5, RNF-3).

## 2. Funciones puras de lógica (sin DOM ni almacenamiento, con `hoy`)

Todas reciben datos necesarios y **`hoy`** (`"AAAA-MM-DD"`, fecha local) como parámetro donde interviene el día actual. No leen ni escriben DOM ni `localStorage`. (RNF-6, constitución 3)

| Función (responsabilidad) | Entradas | Salida | RF cubiertos |
|---|---|---|---|
| `esFechaCalendarioValida(fechaISO)` | `fechaISO` | `true` si es `AAAA-MM-DD` y corresponde a una fecha de calendario real (rechaza `2026-02-30`, `2026-13-01`, etc.) | RF-4, RF-10 |
| `esSesionValidaParaMapa(sesion)` | `sesion` | `true` si tiene `fecha` válida (calendario real) y `minutos` es número finito ≥ 0; si faltan campos o no cumplen, `false` | RF-4, RF-10 |
| `obtenerPeriodoMapa(hoy)` | `hoy` | Estructura del periodo: inicio = lunes de la semana 15 semanas antes de la semana de `hoy`, fin de cuadrícula = domingo de la semana de `hoy`; lista/representación de 16 semanas × 7 días en orden columnas antigua→reciente y filas lun→dom | RF-1, RF-2, RF-8 (incluye hoy) |
| `clasificarDia(fecha, hoy)` | `fecha`, `hoy` | Estado relativo: `pasado-o-hoy` o `futuro` (comparación por `AAAA-MM-DD` local) | RF-7, RF-8, RF-9, RF-11 |
| `calcularTotalesPorDia(sesiones, hoy)` | `sesiones`, `hoy` | Mapa/objeto `fecha -> minutosTotales` sumando numéricamente los `minutos` de sesiones válidas cuya `fecha` no es posterior a `hoy` (duplicadas se suman; sesiones inválidas/futuras excluidas) | RF-2, RF-3, RF-4, RF-7, RF-10, RNF-3, RNF-4 |
| `nivelPorMinutos(totalMinutos)` | `totalMinutos` | Nivel 0–4: 0→0, 1–29→1, 30–59→2, 60–119→3, ≥120→4 (comparación numérica sobre el total) | RF-3, RF-5 |
| `obtenerDatosMapa(sesiones, hoy)` | `sesiones`, `hoy` | Modelo completo del mapa: días del periodo en orden (semana/posición), para cada día `{ fecha, totalMinutos, nivel, esFuturo }` (futuro ⇒ estado neutro, sin aporte de minutos), más metadatos de etiquetas de mes (abreviatura en español en la primera columna del periodo que contiene algún día de ese mes) | RF-1 a RF-8, RF-10, RF-11, RF-13, RNF-3, RNF-4, RNF-6 |
| `obtenerDetalleDia(fecha, datosMapa, hoy)` (o equivalente de datos) | `fecha`, datos calculados, `hoy` | Información de detalle: fecha legible en español (día semana, día, mes, año, local), total, y estado textual (`"Sin estudio (0 min)"` si pasado/hoy con total 0, `"Fecha futura"` si futuro, o minutos totales si pasado/hoy con estudio) | RF-5, RF-9, RF-10, RF-11 |

*Las firmas exactas son orientativas; lo innegociable es: puras, sin DOM/almacenamiento y recibiendo `hoy` cuando el resultado depende del día actual.*

## 3. Algoritmo del mapa (pseudocódigo)

Cubre RF-1 a RF-5, RF-7, RF-10, RF-11, RF-13, RNF-3, RNF-4.

```text
FUNCIÓN obtenerDatosMapa(sesiones, hoy):
  periodo ← obtenerPeriodoMapa(hoy)
    - lunesActual ← inicioSemana(hoy)              // lunes de la semana de hoy (reutilizable)
    - lunesInicio ← moverDias(lunesActual, -15*7)  // 15 semanas antes
    - para c de 0..15 (columnas, antigua→reciente):
        lunesCol ← moverDias(lunesInicio, c*7)
        para f de 0..6 (filas, lun→dom): fechas[c,f] ← moverDias(lunesCol, f)

  totales ← mapa vacío
  PARA CADA sesion EN sesiones:
    SI NO esSesionValidaParaMapa(sesion): CONTINUAR        // RF-4, RF-10
    SI sesion.fecha > hoy: CONTINUAR                       // RF-7 (futuras no cuentan)
    totales[sesion.fecha] ← (totales[sesion.fecha] o 0) + sesion.minutos  // RF-3

  dias ← []
  PARA CADA fecha EN periodo (orden columnas izq→der, filas lun→dom):
    esFuturo ← (fecha > hoy)
    SI esFuturo:
      dias.añadir({ fecha, totalMinutos: 0, nivel: nulo/neutro, esFuturo: true })  // RF-7,8
    SINO:
      total ← totales[fecha] o 0
      dias.añadir({ fecha, totalMinutos: total, nivel: nivelPorMinutos(total), esFuturo: false }) // RF-5

  etiquetasMes ← para cada columna c: si es la primera columna del periodo que contiene
                 algún día del mes M, etiqueta = abreviatura mes(M) en español, si no vacío  // RF-6

  DEVOLVER { dias, etiquetasMes, inicio: lunesInicio, hoy }

FUNCIÓN nivelPorMinutos(total):  // RF-3, RF-5
  SI total >= 120: 4
  SI total >= 60:  3
  SI total >= 30:  2
  SI total >= 1:   1
  SINO:            0

FUNCIÓN esFechaCalendarioValida(fechaISO):  // RF-4
  SI no cumple patrón/estructura AAAA-MM-DD: falso
  reconstruir fecha local desde partes y verificar que año/mes/día coinciden (descarta 2026-02-30, 2026-13-01)

FUNCIÓN esSesionValidaParaMapa(sesion):  // RF-4
  tiene fecha válida de calendario Y minutos es número finito Y minutos >= 0
```

## 4. Cómo se pinta en la interfaz

Responsabilidad de la capa de interfaz (usa, pero no reemplaza, la lógica pura). (RF-1, RF-4 a RF-13, RNF-1, RNF-2, RNF-5)

1. **Generación de datos (puro):** al renderizar, obtener sesiones (`cargarSesiones()`) y `hoy = hoyEnISO()` y llamar `obtenerDatosMapa(sesiones, hoy)`. (RNF-3, RNF-6)
2. **Estructura (HTML + render):** dentro de la sección del mapa, construir/actualizar: (a) fila de etiquetas de mes alineada a columnas, (b) cuadrícula 16×7 de celdas en orden columnas antigua→reciente y filas lun→dom, (c) leyenda "Menos" → niveles 0–4 → "Más", (d) área de detalle. (RF-1, RF-2, RF-4, RF-6)
3. **Celdas:** cada celda representa un día con un atributo/dato de su fecha; clase/estado visual según `esFuturo` (neutro diferenciado) o `nivel` 0–4. Las celdas son focables y activables (p. ej. elementos interactivos nativos) para cumplir puntero y teclado. (RF-5, RF-7, RF-8, RF-12, RNF-2, RNF-5)
4. **Selección y detalle:** estado de UI guarda la `fechaSeleccionada`. Por defecto `hoy` (RF-8). Al activar una celda (clic/tecla), se actualiza la selección y el área de detalle muestra: fecha legible en español y, si es futuro, "Fecha futura"; si pasado/hoy con total 0, "Sin estudio (0 min)"; si pasado/hoy con total > 0, el total de minutos. (RF-5, RF-9, RF-10, RF-11)
5. **Actualización:** integrar el pintado del mapa en el flujo de actualización existente (al cargar y tras registrar una sesión). Recalcular con el `hoy` y sesiones actuales; si la `fechaSeleccionada` sigue dentro del periodo, conservarla y refrescar su detalle; si queda fuera, volver a seleccionar `hoy`. (RF-11, caso de cambio de datos/día)
6. **Responsive/accesibilidad:** layout y tamaños de celda/espacios contenidos al ancho disponible para que el conjunto (mapa+leyenda+etiquetas) quepa en 375 px sin desplazamiento horizontal; contraste/estados distinguibles y foco visible. (RNF-1, RNF-2, RNF-5)
7. **Robustez:** el pintado usa el modelo ya depurado por las funciones puras (inválidos/futuros tratados), de modo que datos corruptos no rompen la interfaz. (RF-4, RF-10, RF-13, RNF-4)

## 5. Decisiones técnicas justificadas (y alternativa descartada)

| Decisión | Justificación | RF/RNF | Alternativa descartada |
|---|---|---|---|
| Cálculo como funciones puras que reciben `(sesiones, hoy)` / `hoy` y devuelven datos, sin DOM/almacenamiento | Exigido por constitución 3 y RNF-6; permite probar con `node --test` y razonar sin efectos secundarios | RNF-6, RF-2,3,4,7,10,11 | Calcular leyendo el DOM/`localStorage` o usando `new Date()` interno: no determinista ni testeable, incumple constitución 3 |
| Derivar el periodo desde `hoy` con helpers de fecha local ya existentes (inicio de semana/lunes, mover días) y comparación de cadenas `AAAA-MM-DD` | Coherente con el proyecto (fechas locales, sin UTC, sin ms) y con constitución 5; evita desplazamientos de huso y errores de DST | RF-1, RF-2, RNF-3, const. 5 | `toISOString()`, `new Date("AAAA-MM-DD")` o sumar 86400000 ms: desplazan día o fallan en cambios de hora (prohibido por guía del proyecto) |
| Periodo = 16 columnas semanales completas lun–dom (la de `hoy` incluida, con futuros neutros) en vez de 112 días contados desde hoy | Respeta literalmente "organizado en semanas de lunes a domingo" (RF-1/RF-2) y alinea la cuadrícula; los días futuros de la semana en curso se resuelven con el estado neutro (RF-7,8) | RF-1, RF-2, RF-7, RF-8 | Ventana deslizante de 112 días exactos terminada en hoy: rompe la alineación semanal lun–dom exigida |
| Niveles futuros como estado distinto de nivel 0 (no un nivel de minutos) | La spec diferencia "día futuro" de "sin estudio (0 min)" (RF-7, RF-8, RF-9); mezclarlo confundiría el significado del color | RF-7, RF-8, RF-9, RNF-2 | Pintar futuros como nivel 0: indistinguible de un día sin estudio |
| Validación estricta de sesión (fecha calendario real + minutos número finito ≥ 0) e ignorar inválidos sin abortar | Cumple RF-4/RF-10/RNF-4 y "nunca se pierde una sesión" válida ante datos corruptos (constitución 5) | RF-4, RF-10, RNF-4 | Rechazar/romper ante el primer dato inválido o intentar "corregir" datos: perdería información o fallaría la vista |
| Etiquetas de mes en la primera columna del periodo que contiene algún día de ese mes | Regla determinista y verificable, ligada al periodo real mostrado | RF-4, RF-6 | Etiquetar por calendario fijo o heurísticas vagas: ambiguo en bordes |
| Selección por defecto = hoy y selección mantenida al actualizar si sigue en rango | Feedback inmediato (RF-8) y continuidad al registrar sesiones (RF-11) sin comportamiento sorprendente | RF-8, RF-11 | Sin selección inicial o resetear siempre la selección: oculta información u obliga a re-seleccionar |
| Pruebas con `node --test` sobre funciones puras exportables/aislables, sin instalar paquetes | Exigido por constitución 4 y criterios de finalización; usa el runner built-in de Node disponible | Todos los RF de cálculo, const. 4 | Framework externo (Jest/Vitest) o no automatizar: incumple "sin instalar paquetes" y/o "tests como puerta" |
| Detalle y leyenda como texto visible (además del color) y celdas activables por teclado | Hace interpretable la intensidad sin depender solo del color y permite selección táctil/teclado (RNF-5, RF-12) | RNF-2, RNF-5, RF-12 | Codificar la información solo por color u hover: inaccesible en móvil/teclado y ambiguo |

## 6. Estrategia de tests con `node --test`

Sin instalar paquetes (constitución 4). Objetivo: pruebas en verde que respalden la lógica pura antes de dar por terminada la funcionalidad.

- **Herramientas:** `node --test` con `node:test` y `node:assert/strict` (módulos built-in). Verificación de sintaxis: `node --check app.js`.
- **Qué se prueba (lógica pura, con `hoy` fijo pasado por parámetro):**
  - `obtenerPeriodoMapa(hoy)`: 16 semanas, inicio lunes correcto (15 semanas antes de la semana de `hoy`), fin domingo de la semana de `hoy`, orden columnas/filas y contención de `hoy`. (RF-1, RF-2)
  - `esFechaCalendarioValida` / `esSesionValidaParaMapa`: acepta `AAAA-MM-DD` real y minutos finitos ≥ 0 (incl. 0 y decimales); rechaza forma mala, fechas inexistentes (`2026-02-30`, `2026-13-01`), minutos negativos/no numéricos/no finitos y campos faltantes/estructura inesperada. (RF-4, RF-10)
  - `calcularTotalesPorDia` / `obtenerDatosMapa`: suma por fecha, varias sesiones y duplicadas suman, excluye sesiones con fecha > `hoy`, ignora inválidas, almacén vacío. (RF-2, RF-3, RF-4, RF-7, RF-10, RF-11, RF-13)
  - `nivelPorMinutos`: umbrales exactos 0,1,29,30,59,60,119,120 y valores intermedios. (RF-3, RF-5)
  - Clasificación futuro vs pasado/hoy: días > `hoy` marcados futuros/neutros, `hoy` y pasados no; incluye días futuros de la semana en curso. (RF-7, RF-8, RF-11, RF-13)
  - Etiquetas de mes: primera columna del periodo que contiene algún día de cada mes. (RF-6)
  - Caso "hoy sin estudio" independiente de otros indicadores (total/nivel 0 para hoy). (caso límite)
- **Casos de frontera a incluir:** periodo que cruza mes y año, `hoy` en distintos días de la semana, total decimal en umbral, sin sesiones en absoluto, todas las sesiones fuera de periodo, solo sesiones inválidas.
- **Aislamiento para poder ejecutar los tests:** dado que `app.js` interactúa con el DOM al cargar, el plan prevé exponer las funciones puras de forma comprobable sin ejecutar la lógica de interfaz en Node (p. ej. una exportación condicional/guardada para entorno de pruebas o un módulo de lógica pura que `app.js` reutiliza y que los tests importan), manteniendo la app funcional con doble clic en `file://` y sin dependencias. (constitución 1, 3, 4)
- **Ejecución:** `node --test` (y/o la ruta del archivo de pruebas) debe terminar en verde; prohibido avanzar con tests en rojo. Complemento: `node --check app.js` y verificación manual con Chrome DevTools (abrir `index.html`, probar casos principales, consola limpia, móvil 375 px) según criterios de finalización.

## 7. Trazabilidad RF → plan

| RF | Dónde se cubre |
|---|---|
| RF-1 | `obtenerPeriodoMapa(hoy)`, render de 16 columnas en `index.html`/`styles.css`/pintado; tests de periodo |
| RF-2 | `obtenerPeriodoMapa`, orden lun–dom/columnas; estructura de cuadrícula; tests |
| RF-3 | `calcularTotalesPorDia`, `nivelPorMinutos`; tests de suma y umbrales |
| RF-4 | `esFechaCalendarioValida`, `esSesionValidaParaMapa`, filtrado en cálculo; tests de validez/ignorar |
| RF-5 | `nivelPorMinutos` y representación por nivel + detalle "Sin estudio (0 min)"; tests |
| RF-6 | Leyenda y etiquetas de mes en render; metadatos de etiquetas en datos; tests de etiquetas |
| RF-7 | `clasificarDia`/exclusión fecha > `hoy` y estado neutro futuro; tests |
| RF-8 | Selección inicial = `hoy` y detalle inicial en pintado |
| RF-9 | Detalle de día pasado/hoy con formato legible y minutos/0 |
| RF-10 | Detalle de día futuro "Fecha futura" |
| RF-11 | Manejo de selección, actualización al cambiar datos conservando selección válida |
| RF-12 | Celdas focables/activables por puntero y teclado |
| RF-13 | Render completo con datos vacíos/sin válidos en periodo; tests |
| RNF-1 | Estilos/layout contenidos a 375 px sin scroll horizontal |
| RNF-2,5 | Leyenda, detalle textual, foco/activación |
| RNF-3 | Fecha local, mismas sesiones, exclusión futuras en cálculo |
| RNF-4 | Ignorar inválidos sin romper vista |
| RNF-6 | Funciones puras con `hoy`, sin DOM/almacenamiento |