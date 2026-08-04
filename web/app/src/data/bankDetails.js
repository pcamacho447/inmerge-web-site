// Instrucciones de depósito que ve el cliente. Estos valores son PÚBLICOS por
// diseño: viajan en el bundle del navegador porque el cliente tiene que
// leerlos. Nunca pongas acá la service-role key ni nada secreto.
//
// El CCI es la referencia canónica: lleva embebidos el código de banco (003 =
// Interbank), la oficina (611) y el número de cuenta, así que si alguna vez
// editas `number` y no `cci` (o al revés), quedan incoherentes y el cliente
// deposita a una cuenta que no existe. Cámbialos siempre juntos.
export const BANK_ACCOUNT = {
  bank: 'Interbank',
  accountType: 'Cuenta Simple Soles',
  number: '611-3082499683',
  cci: '00361101308249968314',
  // Titular de la CUENTA — persona natural. Tiene que decir exactamente lo que
  // el banco muestra al transferir; si acá dijera la razón social, el cliente
  // vería un nombre distinto al validar el destino y pensaría que se equivocó.
  holder: 'Paul Alonso Camacho Abadie',
};

// Quién EMITE el comprobante, que no es lo mismo que el titular de la cuenta.
// Se separa a propósito: la cuenta es personal y la factura la emite la SAC, y
// mostrarlos como si fueran lo mismo confundiría a un cliente empresa que está
// cuadrando su sustento contable. `null` en cualquiera de los dos omite la
// sección entera en el modal.
export const BILLING_ENTITY = {
  legalName: 'Servicios Inmerge SAC',
  taxId: '20608620690',
};

export const YAPE_PLIN = {
  // Mismo número que el WhatsApp del sitio (WA_LINK en content.js) — a
  // propósito: el cliente yapea y manda la constancia al mismo contacto.
  phone: '957251279',
  holder: 'Paul Alonso Camacho Abadie',
};

export const VERIFICATION_SLA = 'hasta 24 horas hábiles';
