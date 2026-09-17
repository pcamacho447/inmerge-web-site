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
  { name: 'Rigor y Trazabilidad', desc: 'Cada proceso, consulta y cálculo es auditable, citable y reproducible.' },
  { name: 'Ingeniería Robusta', desc: 'Sistemas resilientes sobre arquitecturas modernas y código probado.' },
  { name: 'Inteligencia Práctica', desc: 'Modelos de IA orientados a impacto operativo y retorno medible.' },
  { name: 'Autonomía del Cliente', desc: 'Transferencia total de infraestructura y código sin cajas negras.' },
];

export const HERO_CERTAINTIES = [
  {
    metric: '100%',
    label: 'Código Verificable & Citable',
    desc: 'Auditoría sin cajas negras, pruebas continuas y trazabilidad.',
  },
  {
    metric: '0%',
    label: 'Vendor Lock-in',
    desc: 'Infraestructura desplegada en tus propias cuentas AWS / GCP.',
  },
  {
    metric: '1 - 2 Sem',
    label: 'Sprints de Alta Densidad',
    desc: 'Entregables auditables y feedback continuo cada semana.',
  },
];

export const PILLARS = [
  {
    id: 'auditoria',
    number: '01',
    title: 'Auditoría Técnica y de Datos',
    subtitle: 'Garantía de integridad, seguridad y cumplimiento',
    desc: 'Evaluación independiente de bases de datos, sistemas y seguridad cloud para erradicar riesgos operativos.',
    tag: 'Auditoría & Calidad',
    badge: 'Diagnóstico & Certificación',
  },
  {
    id: 'desarrollo',
    number: '02',
    title: 'Desarrollo Tecnológico & Cloud',
    subtitle: 'Software a medida, arquitectura AWS y plataformas web',
    desc: 'Diseño e ingeniería de aplicaciones empresariales, microservicios e infraestructura escalable en AWS.',
    tag: 'Ingeniería de Software',
    badge: 'Arquitectura & Código',
  },
  {
    id: 'datos',
    number: '03',
    title: 'Ciencia de Datos & Inteligencia Artificial',
    subtitle: 'Modelos predictivos, analítica avanzada y dashboards ejecutivos',
    desc: 'Machine Learning en producción, pipelines de IA y dashboards vivos para decisiones en tiempo real.',
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
    problem: 'Datos dispersos o inconsistentes que generan reportes erróneos y pérdidas financieras.',
    value: 'Dictamen técnico independiente con matriz de remediación y evidencias reproducibles.',
    deliverables: ['Inventario y perfilado de fuentes', 'Informe de inconsistencias', 'Plan de saneamiento de datos'],
  },
  {
    number: '02',
    pillarId: 'auditoria',
    pillarName: 'Auditoría Técnica',
    name: 'Auditoría de Sistemas y Seguridad Cloud',
    line: 'Evaluación de arquitectura en AWS/GCP, vulnerabilidades y costos.',
    timeline: '3 a 5 semanas',
    problem: 'Arquitecturas opacas, configuraciones inseguras y costos cloud desbordados.',
    value: 'Detección de vulnerabilidades, optimización de costos y alineamiento con buenas prácticas.',
    deliverables: ['Postura de seguridad e IAM', 'Matriz de optimización de costos', 'Plano de remediación de arquitectura'],
  },
  {
    number: '03',
    pillarId: 'desarrollo',
    pillarName: 'Desarrollo Tecnológico',
    name: 'Arquitectura en la Nube & Pipelines (AWS)',
    line: 'Infraestructura serverless, contenedores y pipelines de datos.',
    timeline: '4 a 8 semanas',
    problem: 'Flujos manuales e infraestructuras legadas incapaces de responder a la demanda.',
    value: 'Arquitectura en AWS (ECS, Lambda, RDS, S3) con alta disponibilidad y despliegues CI/CD.',
    deliverables: ['Infraestructura como código (IaC)', 'Pipelines ETL/ELT automatizados', 'Manual de operación técnica'],
  },
  {
    number: '04',
    pillarId: 'desarrollo',
    pillarName: 'Desarrollo Tecnológico',
    name: 'Desarrollo de Software & Plataformas Web',
    line: 'Aplicaciones empresariales, portales a medida y APIs robustas.',
    timeline: '6 a 12 semanas',
    problem: 'Herramientas genéricas desalineadas de los procesos o plataformas con alta deuda técnica.',
    value: 'Software a medida en React, Node/Python y PostgreSQL con pruebas automatizadas.',
    deliverables: ['Aplicación web en producción', 'Suite de pruebas automatizadas', 'Documentación de APIs'],
  },
  {
    number: '05',
    pillarId: 'datos',
    pillarName: 'Ciencia de Datos & IA',
    name: 'Modelos Predictivos & Machine Learning',
    line: 'Algoritmos de clasificación, forecasting y scoring automatizado.',
    timeline: '4 a 8 semanas',
    problem: 'Decisiones basadas en intuición por falta de modelos predictivos calibrados.',
    value: 'Modelos con validación estadística rigurosa listos para inferencia en tiempo real o batch.',
    deliverables: ['Modelo ML calibrado y evaluado', 'Pipeline de reentrenamiento continuo', 'Métricas de precisión y soporte'],
  },
  {
    number: '06',
    pillarId: 'datos',
    pillarName: 'Ciencia de Datos & IA',
    name: 'Dashboards Ejecutivos & Visualización de Datos',
    line: 'Interfaces interactivas vivas para control operativo y estratégico.',
    timeline: '3 a 6 semanas',
    problem: 'Directores esperando días por reportes estáticos en hojas de cálculo.',
    value: 'Dashboards web en tiempo real con permisos por rol y actualización automática.',
    deliverables: ['Dashboard web responsive interactivo', 'Conexión a bases de datos en vivo', 'Capacitación a usuarios clave'],
  },
];

export const SEGMENTS = [
  {
    name: 'Corporativos y Medianas Empresas',
    quote: 'Sistemas que escalan y datos que resisten una auditoría de directorio.',
    line: 'Desarrollo a medida, analítica predictiva y optimización cloud.',
    bg: '#241A12',
    fg: '#F3EADA',
  },
  {
    name: 'Sector Público y Organismos',
    quote: 'Trazabilidad rigurosa y cumplimiento normativo verificable.',
    line: 'Auditoría de sistemas, calidad de datos y portales de transparencia.',
    bg: '#EBDFC9',
    fg: '#241A12',
  },
  {
    name: 'Startups & Empresas Tecnológicas',
    quote: 'Velocidad de entrega sin comprometer arquitectura ni seguridad.',
    line: 'Desarrollo full-stack, ingeniería de datos e integración de IA.',
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

export const DIRECTORS = [
  {
    id: 'auditor-director',
    number: '01',
    role: 'Director de Auditoría Técnica & Calidad de Datos',
    englishRole: 'Lead Auditor & Data Strategist',
    pillar: 'Pilar 01 — Auditoría Técnica y de Datos',
    tag: 'INTEGRIDAD FORENSE & GOBERNANZA',
    subtitle: 'Veracidad operativa, cumplimiento normativo y diagnóstico estructural de datos.',
    desc: 'Lidera auditorías independientes, integridad de modelos relacionales y seguridad perimetral para erradicar pérdidas operativas.',
    credentials: [
      '10+ años en auditoría de sistemas y bases de datos',
      'Experto en PostgreSQL, SQL Server & RLS',
      'Gobernanza de Datos & Cumplimiento SUNAT',
    ],
    quote: 'La integridad de la información no es un supuesto de fe: se audita y se demuestra matemáticamente en cada tabla y transacción.',
    accent: 'var(--terracotta)',
  },
  {
    id: 'cloud-director',
    number: '02',
    role: 'Director de Arquitectura Cloud & DevOps',
    englishRole: 'Cloud & DevOps Architect',
    pillar: 'Pilar 02 — Desarrollo Tecnológico & Cloud',
    tag: 'AWS ENTERPRISE ARCHITECTURE',
    subtitle: 'Arquitecturas cloud resilientes, alta disponibilidad y optimización de costos.',
    desc: 'Diseña infraestructura como código en AWS (ECS Fargate, RDS Multi-AZ, Lambda), pipelines CI/CD y políticas Zero-Trust.',
    credentials: [
      'AWS Certified Solutions Architect',
      'Infraestructura como Código (Terraform / CDK)',
      'Contenedores, Microservicios & Zero-Downtime',
    ],
    quote: 'Una plataforma empresarial resiliente no depende de la suerte, sino de infraestructura reproducible e inmutable.',
    accent: 'var(--gold)',
  },
  {
    id: 'data-science-director',
    number: '03',
    role: 'Director de Ciencia de Datos & Agentes IA',
    englishRole: 'Senior Data Scientist',
    pillar: 'Pilar 03 — Ciencia de Datos & IA',
    tag: 'MACHINE LEARNING & MODELOS PREDICTIVOS',
    subtitle: 'Modelado estadístico avanzado, forecasting e integración de agentes IA.',
    desc: 'Lidera algoritmos de Machine Learning en producción, pipelines MLOps reproducibles y agentes con impacto financiero medible.',
    credentials: [
      'MSc en Inteligencia Artificial & Estadística',
      'Pipelines MLOps (Python, PyTorch, Airflow)',
      'Sistemas Predictivos & Agentes Autónomos',
    ],
    quote: 'La IA en producción solo tiene valor si genera impacto operativo medible y trazabilidad algorítmica total.',
    accent: 'var(--ochre)',
  },
  {
    id: 'software-director',
    number: '04',
    role: 'Director de Ingeniería de Software & Plataformas',
    englishRole: 'Full-Stack Engineer',
    pillar: 'Pilar 02 — Ingeniería de Software',
    tag: 'PLATAFORMAS REACTIVAS & APIS',
    subtitle: 'Software a medida de alto rendimiento, interfaces reactivas y APIs resilientes.',
    desc: 'Especialista en desarrollo frontend y backend concurrente, APIs REST/GraphQL, arquitecturas por eventos y accesibilidad WCAG.',
    credentials: [
      'Arquitectura de Sistemas Distribuidos',
      'React, Node.js, TypeScript & Next.js',
      'Seguridad en Aplicaciones & WCAG 2.1 AA',
    ],
    quote: 'El software de calidad se mide por su mantenibilidad, velocidad de respuesta y absoluta ausencia de cajas negras.',
    accent: 'var(--terracotta)',
  },
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
