// PostgREST serializa `numeric` sin comillas, así que 2390.00 llega como el
// número 2390 y se renderizaba "S/ 2390" mientras el copy del sitio dice
// "S/ 2,390". Un solo helper para que no vuelva a divergir.
//
// Céntimos SOLO cuando existen, no "nunca": `price_pen` es `numeric(10,2)` —
// nada en el schema impide que el dueño ponga 199.90 — y approve_order()
// (0007_money_invariants.sql) compara el monto recibido con `is distinct
// from`, tolerancia CERO. Si esta función redondeara siempre a entero, un
// precio de 199.90 se vería "S/ 200" en TODAS partes, incluido el mensaje de
// WhatsApp (waVoucherMessage) que el cliente cita al depositar — pagaría
// exactamente el número que la app le mostró, y approve_order rechazaría por
// "MONTO NO COINCIDE". Mostrar céntimos solo cuando el valor no es entero
// evita ese choque sin ensuciar el 99% de los precios de hoy, que sí lo son
// (`S/ 2,390`, no `S/ 2,390.00`, para /planes en particular — ver el
// comentario histórico que esto reemplaza).
export function formatPEN(valor) {
  if (valor === null || valor === undefined) return '—';
  const n = Number(valor);
  if (!Number.isFinite(n)) return '—';
  const decimales = Number.isInteger(n) ? 0 : 2;
  return n.toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}
