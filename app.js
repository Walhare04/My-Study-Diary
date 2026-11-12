// ==================== Diario de Estudio ====================
// Tres bloques: guardar sesiones, calcular la racha y pintar la página.

// ---------- Referencias al HTML ----------

const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const lista = document.getElementById("lista");
const mensajeVacio = document.getElementById("vacio");
const textoRacha = document.getElementById("racha");
const textoRachaDetalles = document.getElementById("racha-texto");
const textoMejorRacha = document.getElementById("mejor-racha");
const textoTotalSemana = document.getElementById("total-semana");

const CLAVE = "diario-estudio-sesiones"; // nombre con el que se guarda en localStorage

// ---------- Guardar y leer sesiones ----------

function cargarSesiones() {
  const datos = localStorage.getItem(CLAVE);
  if (!datos) {
    return [];
  }
  return JSON.parse(datos);
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE, JSON.stringify(sesiones));
}

// ---------- Fechas (siempre en hora local, nunca en UTC) ----------
// Working con el formato "AAAA-MM-DD", que es el mismo que usa el campo <input type="date">.

function aISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

function hoyEnISO() {
  return aISO(new Date());
}

// Devuelve la fecha "AAAA-MM-DD" que está "dias" días antes (o después) de fechaISO.
function moverDias(fechaISO, dias) {
  const partes = fechaISO.split("-").map(Number);
  const anio = partes[0];
  const mes = partes[1];
  const dia = partes[2];
  return aISO(new Date(anio, mes - 1, dia + dias));
}

// Convierte "AAAA-MM-DD" en algo legible: "mié, 1 oct 2026".
function textoFecha(fechaISO) {
  const partes = fechaISO.split("-").map(Number);
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  return fecha.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------- Calcular la racha ----------

function calcularRacha(sesiones) {
  // Un día cuenta si tiene al menos una sesión.
  const diasConSesion = new Set(sesiones.map((sesion) => sesion.fecha));

  // Empezamos por hoy. Si hoy todavía no hay sesión, miramos ayer:
  // la racha sigue viva hasta que el día termina.
  let cursor = hoyEnISO();
  if (!diasConSesion.has(cursor)) {
    cursor = moverDias(cursor, -1);
    if (!diasConSesion.has(cursor)) {
      return 0;
    }
  }

  // Contamos hacia atrás mientras haya sesiones en días consecutivos.
  let racha = 0;
  while (diasConSesion.has(cursor)) {
    racha++;
    cursor = moverDias(cursor, -1);
  }
  return racha;
}

function calcularMejorRacha(sesiones) {
  // Las fechas futuras no cuentan para la mejor racha.
  // "AAAA-MM-DD" se puede comparar como texto porque el formato lleva ceros a la izquierda.
  const hoy = hoyEnISO();
  const diasConSesion = new Set(
    sesiones.map((sesion) => sesion.fecha).filter((fecha) => fecha <= hoy)
  );

  // Desde cada día contamos hacia atrás cuántos días seguidos tienen sesión,
  // y nos quedamos con el tramo más largo.
  let mejor = 0;
  for (const dia of diasConSesion) {
    let cuenta = 0;
    let cursor = dia;
    while (diasConSesion.has(cursor)) {
      cuenta++;
      cursor = moverDias(cursor, -1);
    }
    if (cuenta > mejor) {
      mejor = cuenta;
    }
  }
  return mejor;
}

// ---------- Minutos de esta semana ----------

// Devuelve el lunes (inicio de semana) de la semana a la que pertenece fechaISO.
function inicioSemana(fechaISO) {
  const partes = fechaISO.split("-").map(Number);
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const diasDesdeLunes = (diaSemana + 6) % 7;
  return moverDias(fechaISO, -diasDesdeLunes);
}

function calcularMinutosSemana(sesiones) {
  const hoy = hoyEnISO();
  const lunes = inicioSemana(hoy);
  const domingo = moverDias(lunes, 6);

  // "AAAA-MM-DD" se puede comparar como texto porque el formato lleva ceros a la izquierda.
  // A diferencia de las rachas, las fechas futuras sí cuentan si caen en esta semana.
  let total = 0;
  for (const sesion of sesiones) {
    if (sesion.fecha >= lunes && sesion.fecha <= domingo) {
      total += sesion.minutos;
    }
  }
  return total;
}

function formatearMinutos(total) {
  if (total < 60) {
    return total + " min";
  }
  const horas = Math.floor(total / 60);
  const minutos = total % 60;
  return horas + " h " + minutos + " min";
}

// ---------- Pintar la página ----------

function crearFilaSesion(sesion) {
  const fila = document.createElement("li");
  fila.className = "item";

  const datos = document.createElement("div");

  const tema = document.createElement("p");
  tema.className = "item-tema";
  tema.textContent = sesion.tema;

  const fecha = document.createElement("p");
  fecha.className = "item-fecha";
  fecha.textContent = textoFecha(sesion.fecha);

  datos.append(tema, fecha);

  const minutos = document.createElement("span");
  minutos.className = "item-minutos";
  minutos.textContent = sesion.minutos + " min";

  fila.append(datos, minutos);
  return fila;
}

function ordenarParaMostrar(sesiones) {
  // De la más reciente a la más antigua. A igualdad de fecha, la añadida más
  // reciente va primero.
  return [...sesiones].sort((a, b) => {
    if (a.fecha !== b.fecha) {
      return a.fecha < b.fecha ? 1 : -1;
    }
    return b.id - a.id;
  });
}

function pintar() {
  const sesiones = cargarSesiones();

  const racha = calcularRacha(sesiones);
  textoRacha.textContent = racha;
  textoRachaDetalles.textContent =
    racha === 1 ? "día seguido estudiando" : "días seguidos estudiando";

  textoMejorRacha.textContent = calcularMejorRacha(sesiones);
  textoTotalSemana.textContent = formatearMinutos(calcularMinutosSemana(sesiones));

  lista.innerHTML = "";
  mensajeVacio.hidden = sesiones.length > 0;
  for (const sesion of ordenarParaMostrar(sesiones)) {
    lista.appendChild(crearFilaSesion(sesion));
  }
}

// ---------- Guardar una sesión nueva ----------

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault(); // evita que la página se recargue

  const sesiones = cargarSesiones();

  sesiones.push({
    id: Date.now(), // sirve para ordenar sesiones del mismo día
    fecha: campoFecha.value,
    tema: campoTema.value.trim(),
    minutos: Number(campoMinutos.value),
  });

  guardarSesiones(sesiones);

  // Dejamos el formulario listo para la siguiente sesión, con la fecha de hoy.
  formulario.reset();
  campoFecha.value = hoyEnISO();
  campoTema.focus();

  pintar();
});

// ---------- Arranque ----------

campoFecha.value = hoyEnISO();
pintar();