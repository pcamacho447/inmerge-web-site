export const WA_LINK = 'https://wa.me/51957251279';

// Prefilled WhatsApp message per CTA context — gives whoever replies instant
// context on what page/section drove the contact, instead of a blank chat.
export function waLink(message) {
  return message ? `${WA_LINK}?text=${encodeURIComponent(message)}` : WA_LINK;
}

// Assumed production domain, based on the "contacto@inmerge.pe" address used
// throughout the copy — the site isn't deployed yet. Update this in one place
// if the real domain differs; sitemap.xml/robots.txt in public/ also
// hardcode it and need updating to match.
export const SITE_URL = 'https://inmerge.pe';

export const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/planes', label: 'Planes' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

// Copy de los planes. El precio y la duración viven en la tabla `plans` de
// Supabase: un precio acá que discrepe de la BD significaría que el cliente ve
// un número y el trigger de pedidos le cobra otro. usePlans() los une.
export const PLAN_COPY = {
  monthly: {
    description: 'Acceso a todos los reportes premium mientras estés suscrito.',
    features: ['Todos los reportes premium publicados cada mes', 'Acceso inmediato a nuevas series', 'Renuevas solo si quieres'],
  },
  annual: {
    badge: 'Ahorra ~20%',
    description: 'La misma suscripción, un pago al año.',
    features: ['Todo lo del plan mensual', 'Precio congelado por 12 meses', 'Un solo pago, sin recordatorios'],
  },
};

export function periodLabel(periodMonths) {
  return periodMonths === 12 ? 'año' : 'mes';
}

// Mensaje de WhatsApp para mandar la constancia. Un link wa.me no puede
// adjuntar la foto: abre el chat con el texto listo y el cliente adjunta.
export function waVoucherMessage(order) {
  return `Hola, deposité S/ ${order.amount_pen} por el pedido ${order.code}. Adjunto mi constancia.`;
}

export const VALUES = [
  { name: 'Trazabilidad', desc: 'Todo número tiene una fuente citable, sin excepción.' },
  { name: 'Cercanía', desc: 'Respondemos donde el cliente ya está — WhatsApp incluido.' },
  { name: 'Precisión', desc: 'Preferimos "no lo sabemos aún" a una cifra bonita pero débil.' },
  { name: 'Permanencia', desc: 'Diseñamos sistemas que el cliente puede operar sin nosotros después.' },
];

export const SERVICES = [
  {
    number: '01',
    name: 'Diagnóstico de Datos',
    line: 'Mapa objetivo del estado real de tus datos, en 2-3 semanas.',
    timeline: '2-3 semanas',
    problem:
      'El cliente sospecha que sus datos están dispersos o son poco confiables, pero no tiene un mapa claro de qué tan grave es el problema.',
    value: 'Un mapa objetivo y citable del estado de sus datos, sin comprometerse todavía a un proyecto grande.',
    deliverables: ['Inventario de fuentes', 'Informe de brechas', 'Hoja de ruta priorizada'],
  },
  {
    number: '02',
    name: 'Arquitectura en la Nube',
    line: 'Pipelines e infraestructura confiable sobre AWS.',
    timeline: '6-10 semanas',
    problem:
      'Los datos existen pero viven dispersos en hojas de cálculo o sistemas legados, sin un flujo confiable hacia donde se necesitan.',
    value: 'Una base técnica sólida y escalable que sostiene todos los servicios siguientes.',
    deliverables: ['Pipelines ETL', 'Modelo de datos documentado', 'Infraestructura en AWS'],
  },
  {
    number: '03',
    name: 'Dashboards y Apps Ejecutivas',
    line: 'Producto analítico vivo, a medida de cada cliente.',
    timeline: '4-8 semanas',
    problem: 'Las decisiones se toman con reportes estáticos y desactualizados, sin una vista ejecutiva unificada.',
    value: 'Un producto analítico vivo que el cliente consulta directamente, sin depender de un Excel actualizado a mano.',
    deliverables: ['App web en la nube', 'Dashboards ejecutivos', 'Documentación de uso'],
  },
  {
    number: '04',
    name: 'Gobierno de Datos',
    line: 'Estándares que aseguran datos citables en el tiempo.',
    timeline: 'Continuo — trimestral',
    problem: 'Sin reglas claras de calidad, los sistemas de datos se degradan con el tiempo y pierden trazabilidad.',
    value: 'Confianza sostenida: cada dato sigue siendo citable ante una auditoría o directorio.',
    deliverables: ['Diccionario de datos', 'Proceso de trazabilidad', 'Reporte trimestral de salud'],
  },
  {
    number: '05',
    name: 'Capacitación en IA',
    line: 'Tu equipo usando Claude en su trabajo diario.',
    timeline: '2-4 semanas',
    problem: 'El equipo del cliente tiene acceso a herramientas de IA pero no sabe aplicarlas a su trabajo real.',
    value: 'Un equipo interno capaz de sostener y extender el trabajo entre proyectos.',
    deliverables: ['Talleres con casos reales', 'Guía adaptada al flujo del cliente', 'Sesión de seguimiento'],
  },
  {
    number: '06',
    name: 'Sistema Vivo',
    line: 'Mantenimiento y evolución continua del sistema entregado.',
    timeline: 'Contrato continuo',
    problem: 'Los sistemas entregados por un proyecto puntual quedan obsoletos en meses si nadie los actualiza.',
    value: 'Ingreso recurrente para Inmerge y continuidad garantizada para el cliente.',
    deliverables: ['Monitoreo mensual', 'Actualizaciones incrementales', 'Reporte de salud del sistema'],
  },
];

export const SEGMENTS = [
  {
    name: 'Gobiernos regionales y municipales',
    quote: 'Un informe que resiste una auditoría antes de que llegue Contraloría.',
    line: 'Ejecución presupuestal y rendición de cuentas verificable.',
    bg: '#241A12',
    fg: '#F3EADA',
  },
  {
    name: 'Empresas y consultoras',
    quote: 'Decisiones con el método a la vista, no una caja negra.',
    line: 'Analítica que escala sin depender de una sola persona.',
    bg: '#EBDFC9',
    fg: '#241A12',
  },
  {
    name: 'Investigadores y prensa',
    quote: 'La fuente y el cálculo, no solo la cifra final.',
    line: 'Apoyo técnico puntual sin comprometer tu independencia.',
    bg: '#A8472B',
    fg: '#F3EADA',
  },
];

export const PHASES = [
  { number: '01', name: 'Descubrimiento' },
  { number: '02', name: 'Diseño' },
  { number: '03', name: 'Construcción' },
  { number: '04', name: 'Validación y Transferencia' },
  { number: '05', name: 'Sostenimiento' },
];

export const MARQUEE_ITEMS = [
  'GOBIERNOS REGIONALES',
  'EMPRESAS Y CONSULTORAS',
  'INVESTIGADORES Y PRENSA',
  'GOBIERNOS REGIONALES',
  'EMPRESAS Y CONSULTORAS',
  'INVESTIGADORES Y PRENSA',
];

// The report catalog itself no longer lives here — src/hooks/useReports.js
// fetches it live from Supabase's `reports` table (supabase/migrations/
// 0001_init.sql + 0002_seed_premium_examples.sql), which is now the only
// source of truth. This used to be a duplicated static array that could
// drift from the database; don't reintroduce that.

export const ROLES = [
  { name: 'Consultor Senior', desc: 'Lidera la relación con el cliente y la calidad estratégica.' },
  { name: 'Data Scientist', desc: 'Diagnóstico, modelado de datos y métricas.' },
  { name: 'Ingeniero de Cloud', desc: 'Arquitectura e infraestructura en AWS.' },
  { name: 'Software Engineer', desc: 'Construcción de dashboards y aplicaciones.' },
  { name: 'Director de Diseño', desc: 'Diseño visual y experiencia de cada entregable.' },
];
