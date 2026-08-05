// PostgREST serializa `numeric` sin comillas, así que 2390.00 llega como el
// número 2390 y se renderizaba "S/ 2390" mientras el copy del sitio dice
// "S/ 2,390". Un solo helper para que no vuelva a divergir.
export function formatPEN(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
