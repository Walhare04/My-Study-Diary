// ==================== Diario de Estudio — lógica pura ====================
// Cálculo sin DOM ni almacenamiento, reutilizable por la app y por los tests.
// En el navegador se expone como window.HEATMAP; en Node, vía module.exports.

const HEATMAP = (function () {
  // Convierte un Date en "AAAA-MM-DD" usando la fecha LOCAL (nunca la zulú/UTC).
  function aISO(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return anio + "-" + mes + "-" + dia;
  }

  function hoyEnISO() {
    return aISO(new Date());
  }

  // Fecha "AAAA-MM-DD" que está `dias` días antes (o después) de fechaISO.
  function moverDias(fechaISO, dias) {
    const partes = fechaISO.split("-").map(Number);
    const anio = partes[0];
    const mes = partes[1];
    const dia = partes[2];
    return aISO(new Date(anio, mes - 1, dia + dias));
  }

  return { aISO, hoyEnISO, moverDias };
})();

if (typeof window !== "undefined") {
  window.HEATMAP = HEATMAP;
}
if (typeof module !== "undefined") {
  module.exports = HEATMAP;
}