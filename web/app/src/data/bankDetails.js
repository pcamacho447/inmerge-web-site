// Instrucciones de depósito que ve el cliente. Estos valores son PÚBLICOS por
// diseño: viajan en el bundle del navegador porque el cliente tiene que
// leerlos. Nunca pongas acá la service-role key ni nada secreto.
//
// FALTA CONFIGURAR: completa estos datos antes del primer pedido real. Los
// valores de abajo son deliberadamente evidentes para que un despliegue sin
// configurar sea imposible de confundir con uno funcionando.
export const BANK_ACCOUNT = {
  bank: 'BCP',
  accountType: 'Cuenta corriente soles',
  number: 'FALTA CONFIGURAR',
  cci: 'FALTA CONFIGURAR',
  holder: 'FALTA CONFIGURAR',
  taxId: 'FALTA CONFIGURAR',
};

export const YAPE_PLIN = {
  phone: 'FALTA CONFIGURAR',
  holder: 'FALTA CONFIGURAR',
};

export const VERIFICATION_SLA = 'hasta 24 horas hábiles';
