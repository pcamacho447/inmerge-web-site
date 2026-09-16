import { formatPEN } from '../lib/formatPEN.js';

export const WA_LINK = 'https://wa.me/51957251279';

// Prefilled WhatsApp message per CTA context — gives whoever replies instant
// context on what page/section drove the contact, instead of a blank chat.
export function waLink(message) {
  return message ? `${WA_LINK}?text=${encodeURIComponent(message)}` : WA_LINK;
}

export const SITE_URL = 'https://inmerge.pe';

export const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

export function waVoucherMessage(order) {
  return `Hola, deposité S/ ${formatPEN(order.amount_pen)} por el pedido ${order.code}. Adjunto mi constancia.`;
}

export const VALUES = [
  { name: 'Rigor y Trazabilidad', desc: 'Cada proceso, query y cálculo es auditable, citable y reproducible.' },
  { name: 'Ingeniería Robusta', desc: 'Construimos sistemas resilientes sobre arquitecturas modernas y código probado.' },
  { name: 'Inteligencia Práctica', desc: 'Aplicamos IA y ciencia de datos orientadas a resultados e impacto operativo real.' },
  { name: 'Autonomía del Cliente', desc: 'Transferimos el conocimiento y la infraestructura para que operes sin dependencias.' },
];

export const PILLARS = [
  {
    id: 'auditoria',
    number: '01',
    title: 'Auditoría Técnica y de Datos',
    subtitle: 'Garantía de integridad, seguridad y cumplimiento',
    desc: 'Evaluación independiente de bases de datos, calidad de información, arquitectura de sistemas y seguridad cloud para eliminar riesgos operativos.',
    tag: 'Auditoría & Calidad',
    badge: 'Diagnóstico & Certificación',
  },
  {
    id: 'desarrollo',
    number: '02',
    title: 'Desarrollo Tecnológico & Cloud',
    subtitle: 'Software a medida, arquitectura AWS y plataformas web',
    desc: 'Diseño y construcción de aplicaciones empresariales, microservicios e infraestructura escalable con altos estándares de ingeniería.',
    tag: 'Ingeniería de Software',
    badge: 'Arquitectura & Código',
  },
  {
    id: 'datos',
    number: '03',
    title: 'Ciencia de Datos & Inteligencia Artificial',
    subtitle: 'Modelos predictivos, analítica avanzada y dashboards ejecutivos',
    desc: 'Implementación de Machine Learning, pipelines de IA y dashboards vivos para convertir flujos de datos en ventaja competitiva.',
    tag: 'Analítica & Machine Learning',
    badge: 'IA & Modelado',
  },
];

export const SERVICES = [
  {
    number: '01',
    pillarId: 'auditoria',
    pillarName: 'Auditoría Técnica',
    name: 'Auditoría de Calidad e Integridad de Datos',
    line: 'Diagnóstico exhaustivo de consistencia, duplicados y reglas de negocio.',
    timeline: '2 a 4 semanas',
    problem:
      'Las organizaciones operan con datos dispersos, inconsistentes o no validados, generando reportes erróneos y pérdidas financieras.',
    value: 'Un dictamen técnico de auditoría y una matriz de remediación con evidencias reproducibles y reproducibilidad garantizada.',
    deliverables: ['Inventario y perfilado de fuentes', 'Informe de inconsistencias y brechas', 'Plan de saneamiento de datos'],
  },
  {
    number: '02',
    pillarId: 'auditoria',
    pillarName: 'Auditoría Técnica',
    name: 'Auditoría de Sistemas y Seguridad Cloud',
    line: 'Evaluación de arquitectura en AWS/GCP, vulnerabilidades y costos.',
    timeline: '3 a 5 semanas',
    problem: 'Sistemas con arquitectura opaca, configuraciones inseguras de nube y costos desbordados sin monitoreo adecuado.',
    value: 'Identificación de vulnerabilidades críticas, optimización de presupuesto cloud y validación de buenas prácticas.',
    deliverables: ['Análisis de postura de seguridad', 'Matriz de optimización de costos AWS', 'Recomendaciones de arquitectura'],
  },
  {
    number: '03',
    pillarId: 'desarrollo',
    pillarName: 'Desarrollo Tecnológico',
    name: 'Arquitectura en la Nube & Pipelines (AWS)',
    line: 'Infraestructura serverless, contenedores y pipelines de datos.',
    timeline: '4 a 8 semanas',
    problem: 'Flujos manuales de datos e infraestructuras legadas incapaces de escalar ante picos de demanda o integración.',
    value: 'Arquitectura moderna en AWS (ECS, Lambda, RDS, S3) con alta disponibilidad y despliegues automatizados.',
    deliverables: ['Infraestructura como código (IaC)', 'Pipelines ETL/ELT automatizados', 'Manual de operación y arquitectura'],
  },
  {
    number: '04',
    pillarId: 'desarrollo',
    pillarName: 'Desarrollo Tecnológico',
    name: 'Desarrollo de Software & Plataformas Web',
    line: 'Aplicaciones empresariales, portales a medida y APIs robustas.',
    timeline: '6 a 12 semanas',
    problem: 'Herramientas genéricas que no calzan con los procesos de negocio o plataformas obsoletas con deuda técnica.',
    value: 'Software a medida desarrollado en React, Node/Python y PostgreSQL con pruebas automatizadas y diseño premium.',
    deliverables: ['Aplicación web funcional en producción', 'Suite de pruebas automatizadas', 'Documentación de APIs y código'],
  },
  {
    number: '05',
    pillarId: 'datos',
    pillarName: 'Ciencia de Datos & IA',
    name: 'Modelos Predictivos & Machine Learning',
    line: 'Algoritmos de clasificación, forecasting y scoring automatizado.',
    timeline: '4 a 8 semanas',
    problem: 'Decisiones basadas en intuición debido a la falta de modelos capaces de anticipar tendencias o comportamientos.',
    value: 'Modelos entrenados con validación estadística rigurosa listos para inferencia en tiempo real o en batch.',
    deliverables: ['Modelo ML calibrado y evaluado', 'Pipeline de reentrenamiento continuo', 'Métricas de precisión y soporte'],
  },
  {
    number: '06',
    pillarId: 'datos',
    pillarName: 'Ciencia de Datos & IA',
    name: 'Dashboards Ejecutivos & Visualización de Datos',
    line: 'Interfaces interactivas vivas para control operativo y estratégico.',
    timeline: '3 a 6 semanas',
    problem: 'Directores y gerentes esperando días por reportes estáticos en hojas de cálculo propensas a errores.',
    value: 'Dashboards web interactivos en tiempo real con permisos por rol y actualización automática.',
    deliverables: ['Dashboard web responsive interactivo', 'Conexión a bases de datos en vivo', 'Capacitación a usuarios clave'],
  },
];

export const SEGMENTS = [
  {
    name: 'Corporativos y Medianas Empresas',
    quote: 'Sistemas que escalan y datos que resisten una auditoría de directorio.',
    line: 'Desarrollo a medida, analítica predictiva y optimización de infraestructura en la nube.',
    bg: '#241A12',
    fg: '#F3EADA',
  },
  {
    name: 'Sector Público y Organismos',
    quote: 'Trazabilidad rigurosa y cumplimiento normativo verificable.',
    line: 'Auditoría de sistemas, calidad de bases de datos fiscales y plataformas de transparencia.',
    bg: '#EBDFC9',
    fg: '#241A12',
  },
  {
    name: 'Startups & Empresas Tecnológicas',
    quote: 'Velocidad de entrega sin comprometer la arquitectura ni la seguridad.',
    line: 'Desarrollo full-stack, ingeniería de datos e integración de IA generativa.',
    bg: '#A8472B',
    fg: '#F3EADA',
  },
];

export const MARQUEE_ITEMS = [
  'AUDITORÍA TÉCNICA',
  'DESARROLLO CLOUD',
  'CIENCIA DE DATOS',
  'MACHINE LEARNING',
  'ARQUITECTURA AWS',
  'CALIDAD DE INFORMACIÓN',
];

export const ROLES = [
  { name: 'Lead Auditor & Data Strategist', desc: 'Lidera auditorías técnicas, gobernanza y diagnóstico de calidad de datos.' },
  { name: 'Cloud & DevOps Architect', desc: 'Diseña arquitecturas cloud tolerantes a fallos y pipelines automatizados en AWS.' },
  { name: 'Senior Data Scientist', desc: 'Modelado estadístico, Machine Learning en producción e integración de agentes IA.' },
  { name: 'Full-Stack Engineer', desc: 'Desarrollo de software de alta performance, interfaces reactivas y APIs resilientes.' },
];

export const TRUST_BADGES = [
  {
    title: 'Compromiso de Respuesta',
    detail: '< 24 horas hábiles (UTC-5 Lima)',
    icon: '⏱',
  },
  {
    title: 'Protocolo de Confidencialidad',
    detail: 'Acuerdo de Confidencialidad (NDA) mutuo antes de revisar sistemas o datos',
    icon: '🛡',
  },
  {
    title: 'Interlocución Senior',
    detail: 'Trato directo con Líderes de Arquitectura y Auditores Principales',
    icon: '⚖',
  },
];

export const AUTH_CONTENT = {
  loginTitle: 'Iniciar sesión',
  loginSubtitle: 'Portal seguro de seguimiento de proyectos, auditorías y entregables técnicos.',
  emailPlaceholder: 'tucorreo@empresa.com',
  passwordPlaceholder: 'Contraseña',
  signInBtn: 'Entrar',
  signingInBtn: 'Entrando...',
  noAccountPrompt: '¿No tienes cuenta?',
  createAccountLink: 'Regístrate',
  registerTitle: 'Crear cuenta',
  registerSubtitle: 'Portal de seguimiento de proyectos, auditorías e informes técnicos.',
  registerIntro: 'Registra tu cuenta corporativa para acceder al seguimiento de tus proyectos y entregables.',
  fullNamePlaceholder: 'Nombre completo',
  workEmailPlaceholder: 'tucorreo@empresa.com',
  taxIdLabel: 'RUC (11 dígitos) o DNI/CE',
  taxIdPlaceholder: 'Ej. 20601234567',
  createAccountBtn: 'Crear cuenta',
  creatingAccountBtn: 'Creando cuenta...',
  alreadyHaveAccountPrompt: '¿Ya tienes cuenta?',
  signInLink: 'Inicia sesión',
  invalidCredentialsError: 'Tus credenciales son incorrectas.',
  genericAuthError: 'No se pudo completar la autenticación.',
  complianceNote:
    'Cumplimiento Normativo Peruano: Portal seguro con validación fiscal de SUNAT y conciliación de transferencias bancarias (BCP, Interbank, BBVA en PEN).',
};

export const ACCOUNT_CONTENT = {
  portalBadge: 'PORTAL EXCLUSIVO DE CLIENTES',
  portalTitle: 'Seguimiento Técnico & Facturación',
  activeSession: 'Sesión activa:',
  signOut: 'Cerrar sesión',
  consultantPanelLink: 'Panel de Consultores →',
  tabs: {
    projects: 'Mis Proyectos & Cronogramas',
    billing: 'Facturación & Cuentas Bancarias',
    support: 'Soporte Técnico',
  },
  projects: {
    loading: 'Cargando información técnica de tus proyectos...',
    syncError: 'Error al sincronizar proyectos:',
    noProjectsTitle: 'No tienes proyectos activos asignados',
    noProjectsDesc:
      'Si ya enviaste una solicitud de cotización o TDR, nuestro equipo técnico habilitará tu cronograma y entregables una vez validado el requerimiento.',
    requestNewProjectBtn: 'Solicitar Nueva Auditoría o Proyecto →',
    pillarLabels: {
      auditoria: '01. Auditoría Técnica & Datos',
      desarrollo: '02. Desarrollo Cloud & AWS',
      datos: '03. Datos & IA',
      integral: 'Solución Integral',
    },
    deliverablesTitle: 'Entregables Técnicos & Informes',
    generateExecutiveSummary: 'Generar Resumen Ejecutivo (Markdown)',
    downloadReport: 'Descargar Informe',
    openDashboard: 'Abrir Dashboard',
    viewRepo: 'Ver Repositorio',
    downloadDataset: 'Descargar Dataset',
    viewDoc: 'Ver Documento',
  },
  support: {
    badge: 'CANAL DE MENSAJERÍA DIRECTA',
    title: 'Canales de Soporte Técnico & Tech Lead',
    desc: (count) =>
      `Tienes ${count} proyecto(s) activos en curso. Ante cualquier requerimiento urgente, consulta sobre hitos técnicos o coordinación de entregables, puedes comunicarte directamente con nuestro equipo de ingeniería.`,
    whatsappTitle: 'WhatsApp de Guardia Técnica',
    whatsappSla: 'Respuesta promedio menor a 30 minutos en días hábiles.',
    whatsappBtn: '💬 Abrir WhatsApp Directo',
    emailTitle: 'Correo Directo con Tech Lead',
    emailSla: 'Consultas formales, ampliaciones de alcance o revisión de informes.',
    emailBtn: '✉ Enviar Correo Técnico',
  },
  billing: {
    officialAccountsTitle: '1. Cuentas Bancarias Oficiales (Transferencias Exclusivas)',
    officialAccountsDesc:
      'Medio de pago exclusivo: transferencia bancaria directa a cuentas institucionales en PEN. Cada orden requiere verificación.',
    internationalNoticeTitle: 'CLIENTES CORPORATIVOS INTERNACIONALES',
    internationalNoticeDesc:
      'Para entidades internacionales que operan fuera del Perú, los pagos se coordinan mediante transferencia institucional internacional (código SWIFT) o acuerdos de servicio (MSA) en USD/EUR previa coordinación.',
    legalEntityTitle: '2. Datos de Facturación & Razón Social',
    legalNameLabel: 'Razón Social / Organización',
    taxIdLabel: 'RUC (11 dígitos)',
    billingAddressLabel: 'Dirección Fiscal',
    billingEmailLabel: 'Correo Electrónico de Facturación',
    saveBtn: 'Guardar Datos de Facturación',
    savingBtn: 'Guardando...',
    ordersTitle: '3. Historial de Órdenes y Constancias Bancarias',
    noOrders: 'No hay órdenes registradas para esta cuenta.',
  },
};
