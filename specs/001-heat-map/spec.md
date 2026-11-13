# Spec 001 — Mapa de calor de estudio

## Contexto y objetivo
El diario ya registra sesiones y muestra rachas y totales, pero no ofrece una vista histórica de la constancia. Se quiere un mapa de calor de las últimas 16 semanas donde cada día refleje, por intensidad de color, cuántos minutos se estudió, para reconocer hábitos y motivar sin revisar la lista sesión por sesión.

## Usuarios / actores
- Estudiante que registra su estudio y quiere ver de un vistazo su constancia e intensidad reciente (uso en escritorio y en móvil).

## Historias de usuario
- H1: Como estudiante quiero ver un mapa de calor de mis últimas 16 semanas para reconocer mi constancia reciente de un vistazo.
- H2: Como estudiante quiero que el color de cada día refleje los minutos estudiados para distinguir días ligeros e intensos.
- H3: Como estudiante quiero consultar la fecha y los minutos de un día al seleccionarlo para conocer su detalle sin buscar en la lista.
- H4: Como estudiante quiero una leyenda y referencias de tiempo para interpretar el mapa sin adivinar.
- H5: Como estudiante en móvil quiero usar el mapa en una pantalla pequeña (375 px) sin depender de desplazamiento horizontal.

## Requisitos funcionales (criterios de aceptación en EARS)
- RF-1: EL SISTEMA deberá mostrar, en la pantalla principal del diario junto a los resúmenes existentes, un mapa de calor del periodo de las últimas 16 semanas consecutivas, sin configuración por parte de la persona.
- RF-2: EL SISTEMA deberá definir el periodo como 16 columnas semanales completas de lunes a domingo: la última columna es la semana (lunes a domingo) que contiene el día actual y la primera es la semana que comienza 15 semanas antes; las columnas se ordenan de la más antigua (izquierda) a la más reciente (derecha) y las filas representan los días de lunes (arriba) a domingo (abajo).
- RF-3: EL SISTEMA deberá calcular para cada día del periodo el total de minutos como la suma numérica de los minutos de todas las sesiones válidas registradas en esa fecha cuya fecha no sea posterior al día actual.
- RF-4: EL SISTEMA deberá considerar válida una sesión para el cálculo cuando su `fecha` es un texto `AAAA-MM-DD` que corresponde a una fecha de calendario real y sus `minutos` son un número finito mayor o igual a 0; SI una sesión no cumple estas condiciones o carece de esos campos, ENTONCES EL SISTEMA deberá ignorarla en el cálculo del mapa y mostrar el resto con normalidad, sin errores visibles.
- RF-5: EL SISTEMA deberá asignar a cada día del periodo un nivel de intensidad según su total de minutos: nivel 0 = 0 min; nivel 1 = 1–29 min; nivel 2 = 30–59 min; nivel 3 = 60–119 min; nivel 4 = 120 min o más (un día pasado o actual sin sesiones válidas queda en nivel 0).
- RF-6: EL SISTEMA deberá representar cada día como una celda cuyo color refleje su nivel de intensidad; mostrar una leyenda visible de "Menos" a "Más" con los 5 niveles (0 a 4); y mostrar, sobre las columnas, la abreviatura del mes en español en la primera columna del periodo que contiene algún día de ese mes.
- RF-7: EL SISTEMA deberá mostrar los días posteriores al día actual incluidos en la última semana con un estado neutro diferenciado, distinto del nivel 0 de un día pasado sin estudio.
- RF-8: CUANDO se muestre el mapa, EL SISTEMA deberá presentar seleccionado por defecto el día actual y mostrar su detalle (fecha y total de minutos o el estado correspondiente).
- RF-9: CUANDO la persona seleccione un día pasado o el día actual, EL SISTEMA deberá mostrar su fecha en formato legible en español (día de la semana, día, mes y año, en fecha local) y su total de minutos; si el total es 0, deberá indicar "Sin estudio (0 min)".
- RF-10: CUANDO la persona seleccione un día futuro del mapa, EL SISTEMA deberá mostrar su fecha en formato legible en español e indicar "Fecha futura" (sin atribuirle minutos de estudio).
- RF-11: CUANDO la persona seleccione un día distinto, EL SISTEMA deberá actualizar el detalle para mostrar la información del día recién seleccionado; si los datos cambian (p. ej. se registra una sesión), el mapa y el detalle del día seleccionado deberán actualizarse manteniendo la selección en la misma fecha mientras esté dentro del periodo.
- RF-12: EL SISTEMA deberá permitir seleccionar una celda/día mediante puntero y mediante teclado (foco y activación), tanto en escritorio como en pantallas táctiles.
- RF-13: MIENTRAS no existan sesiones válidas dentro del periodo (incluido el caso sin sesiones almacenadas), EL SISTEMA deberá mostrar igualmente el mapa completo con nivel 0 en los días pasados y el día actual, estado neutro en los días futuros y la leyenda.

## Requisitos no funcionales
- RNF-1: El mapa completo (celdas, leyenda y etiquetas) es visible y utilizable en una pantalla de 375 px de ancho sin necesidad de desplazamiento horizontal.
- RNF-2: La diferencia entre niveles y el estado de día futuro es perceptible y se explica mediante la leyenda y el detalle textual.
- RNF-3: El cálculo usa la fecha local y las mismas sesiones registradas que el resto del diario, excluyendo las fechas posteriores al día actual.
- RNF-4: Un dato de sesión inválido o mal formado no impide mostrar el mapa ni el resto del diario.
- RNF-5: La información que aporta el color (nivel, fecha y minutos/estado) es accesible también mediante el detalle textual y la leyenda, y las celdas son operables con teclado.
- RNF-6: La lógica de cálculo del mapa (periodo, totales por día, niveles y clasificación de días) se implementa como funciones puras, sin acceso al DOM ni a almacenamiento, que reciben el día actual ("hoy") como parámetro (alineado con la constitución).

## Casos límite
- Sin sesiones almacenadas o sin sesiones válidas en el periodo: mapa completo en nivel 0 (pasados/hoy), días futuros neutros, leyenda visible y detalle inicial del día actual ("Sin estudio (0 min)").
- Varias sesiones válidas el mismo día: se suman todas (incluidas las duplicadas), p. ej. 20 + 50 = 70 min → nivel 3.
- Umbrales exactos: 0→nivel 0, 1→nivel 1, 29→nivel 1, 30→nivel 2, 59→nivel 2, 60→nivel 3, 119→nivel 3, 120→nivel 4.
- Minutos no enteros o 0: el total se calcula numéricamente y se compara con los umbrales; una sesión con minutos 0 es válida y aporta 0; minutos negativos, no numéricos o no finitos invalidan la sesión.
- Fecha con forma `AAAA-MM-DD` pero inexistente en el calendario (p. ej. 2026-02-30, 2026-13-01): se considera inválida y la sesión se ignora en el cálculo.
- Sesión con campos faltantes o estructura inesperada: se ignora en el cálculo del mapa.
- Hoy sin sesiones pero con racha viva por ayer: hoy aparece en nivel 0 (la racha es independiente).
- Sesión con fecha posterior a hoy (aunque caiga dentro del periodo): no aporta minutos a su día; ese día se muestra según corresponda (futuro neutro o, si es pasado/hoy, por sus otras sesiones válidas).
- Días posteriores a hoy en la semana en curso: estado neutro diferenciado, distintos de "Sin estudio (0 min)".
- Cambio de día/mes: el periodo, la clasificación pasado/hoy/futuro y los totales se recalculan en función del día actual local.
- Borde izquierdo del periodo: el primer día incluido es el lunes de la semana que comienza 15 semanas antes de la semana del día actual.

## Fuera de alcance
- Elegir o personalizar el rango/número de semanas (fijo: 16 semanas hasta hoy).
- Ver el listado de sesiones de un día desde el mapa (solo fecha y total/estado).
- Editar o borrar sesiones.
- Exportar, compartir o imprimir el mapa.
- Comparativas, objetivos u otras estadísticas nuevas.
- Personalizar colores o umbrales.
- Animaciones o interacciones avanzadas (arrastrar, zoom, selección múltiple).

## Criterios de finalización
- Todos los RF (RF-1 a RF-13) se cumplen y pueden demostrarse.
- La lógica de cálculo se prueba con `node --test` (sin instalar paquetes), con pruebas en verde, y se verifica con `node --check app.js`.
- La lógica de cálculo cumple la constitución: funciones puras, sin DOM ni almacenamiento, que reciben "hoy" como parámetro.
- Verificación funcional con Chrome DevTools: abrir `index.html`, registrar/probar los casos principales, revisar la consola y comprobar la vista móvil (375 px).
- El mapa no produce errores visibles ante ausencia de datos o datos inválidos y el resto del diario sigue funcionando.

## Dudas abiertas
- Ninguna por ahora. Si surge una decisión no cubierta durante el plan o la implementación, se registrará como `[NECESITA ACLARACIÓN]` y se consultará antes de continuar.