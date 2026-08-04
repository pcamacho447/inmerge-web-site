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
  holder: 'Paul Alonso Camacho Abadie',
  // Sin RUC todavía. `null` y no un placeholder a propósito: el modal omite la
  // fila entera cuando falta, en vez de mostrarle "FALTA CONFIGURAR" a alguien
  // que está por transferir dinero. Ponlo acá cuando exista.
  taxId: null,
};

export const YAPE_PLIN = {
  // Mismo número que el WhatsApp del sitio (WA_LINK en content.js) — a
  // propósito: el cliente yapea y manda la constancia al mismo contacto.
  phone: '957251279',
  holder: 'Paul Alonso Camacho Abadie',
};

export const VERIFICATION_SLA = 'hasta 24 horas hábiles';
