const test = require("node:test");
const assert = require("node:assert/strict");

const heatmap = require("./heatmap.js");

test("heatmap está disponible y expone los helpers de fecha", () => {
  assert.equal(typeof heatmap.aISO, "function");
  assert.equal(typeof heatmap.hoyEnISO, "function");
  assert.equal(typeof heatmap.moverDias, "function");
});

test("aISO rellena mes y día con ceros a la izquierda", () => {
  const fecha = new Date(2026, 0, 5); // 5 de enero de 2026 (mes 0 = enero)
  assert.equal(heatmap.aISO(fecha), "2026-01-05");
});

test("aISO no cambia el día por zona horaria ni por UTC", () => {
  const fecha = new Date(2026, 10, 12); // 12 de noviembre de 2026 en hora local
  assert.equal(heatmap.aISO(fecha), "2026-11-12");
});

test("hoyEnISO devuelve un texto con formato AAAA-MM-DD", () => {
  assert.match(heatmap.hoyEnISO(), /^\d{4}-\d{2}-\d{2}$/);
});

test("moverDias suma días correctamente", () => {
  assert.equal(heatmap.moverDias("2026-11-12", 3), "2026-11-15");
});

test("moverDias resta días correctamente", () => {
  assert.equal(heatmap.moverDias("2026-11-12", -3), "2026-11-09");
});

test("moverDias cruza el cambio de mes", () => {
  assert.equal(heatmap.moverDias("2026-10-01", -1), "2026-09-30");
});

test("moverDias cruza el cambio de año", () => {
  assert.equal(heatmap.moverDias("2026-01-01", -1), "2025-12-31");
});

test("moverDias respeta el 29 de febrero en año bisiesto", () => {
  assert.equal(heatmap.moverDias("2028-03-01", -1), "2028-02-29");
});