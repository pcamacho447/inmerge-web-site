// PostgREST serializa `numeric` sin comillas, así que 2390.00 llega como el
// número 2390 y se renderizaba "S/ 2390" mientras el copy del sitio dice
// "S/ 2,390". Un solo helper para que no vuelva a divergir.
//
// Sin decimales a propósito: este catálogo nunca tiene precios con céntimos, y
// el copy del sitio ya escribe "S/ 2,390/año" — agregar ".00" no sumaba
// información y en la tarjeta anual (con "Ahorra ~20%" encima) alargaba el
// texto lo suficiente para partir " / año" a una segunda línea en viewports
// angostos.
export function formatPEN(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
