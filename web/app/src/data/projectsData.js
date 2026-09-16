/**
 * Casos de éxito y proyectos representativos de Inmerge por pilar estratégico.
 * Contenido estructurado bilingüe (ES / EN) con métricas de impacto y stack de ingeniería.
 */

export const PROJECTS_DATA = [
  {
    id: 'audit-fintech-db',
    pillarId: 'auditoria',
    title: {
      es: 'Saneamiento y Auditoría Forense de Base de Datos de 18M Registros',
      en: 'Forensic Audit & Data Cleansing for 18M Record PostgreSQL Database',
    },
    clientType: {
      es: 'Fintech & Pasarela de Pagos',
      en: 'Fintech & Payment Gateway',
    },
    challenge: {
      es: 'Inconsistencias y duplicados en tablas críticas de transacciones causaban desajustes en el balance contable mensual y lentitud en reportes regulados.',
      en: 'Duplicate records and constraint violations in critical transaction tables caused monthly reconciliation mismatches and slow regulatory reporting.',
    },
    solution: {
      es: 'Scripts forenses auditables en SQL/Python para deduplicación sin pérdida, reindexación optimizada y diseño de llaves de integridad con pipeline de validación continua.',
      en: 'Auditable SQL/Python forensic scripts for zero-loss deduplication, optimized reindexing, and schema constraint refactoring with continuous verification.',
    },
    metrics: [
      { value: '99.999%', label: { es: 'Integridad contable', en: 'Accounting integrity' } },
      { value: '7 días', label: { es: 'Tiempo de ejecución', en: 'Execution timeline' } },
      { value: '-65%', label: { es: 'Latencia en queries', en: 'Query latency reduction' } },
    ],
    stack: ['PostgreSQL', 'Python', 'AWS RDS', 'pgAdmin', 'Data Quality Engine'],
    duration: {
      es: 'Sprint de 1 semana',
      en: '1-week sprint',
    },
  },
  {
    id: 'audit-aws-security-cost',
    pillarId: 'auditoria',
    title: {
      es: 'Auditoría de Seguridad, IAM y Optimización de Costos en AWS Cloud',
      en: 'AWS Cloud Security, IAM Governance & Cost Optimization Audit',
    },
    clientType: {
      es: 'E-commerce & Retail Corporativo',
      en: 'Corporate E-commerce & Retail',
    },
    challenge: {
      es: 'Costos desbordados de infraestructura AWS mensual con permisos IAM sobredimensionados y falta de políticas de retención y cifrado en reposo.',
      en: 'Uncontrolled monthly AWS infrastructure spend with over-privileged IAM roles and missing data retention/encryption-at-rest policies.',
    },
    solution: {
      es: 'Auditoría integral de topología AWS, rediseño de políticas de mínimo privilegio (Least Privilege), readecuación de instancias ECS Fargate y planes Savings Plans.',
      en: 'Full AWS topology audit, Least Privilege IAM overhaul, ECS Fargate right-sizing, and reserved capacity allocation.',
    },
    metrics: [
      { value: '-42%', label: { es: 'Ahorro en factura AWS', en: 'Monthly AWS bill savings' } },
      { value: '100%', label: { es: 'Conformidad IAM & MFA', en: 'IAM & MFA compliance' } },
      { value: '48 horas', label: { es: 'Diagnóstico preliminar', en: 'Preliminary diagnosis' } },
    ],
    stack: ['AWS IAM', 'CloudWatch', 'AWS ECS', 'Terraform', 'S3 Glacier'],
    duration: {
      es: 'Sprint de 10 días',
      en: '10-day sprint',
    },
  },
  {
    id: 'dev-microservices-logistics',
    pillarId: 'desarrollo',
    title: {
      es: 'Modernización de Plataforma de Microservicios & API Gateway',
      en: 'Microservices Modernization & High-Throughput API Gateway',
    },
    clientType: {
      es: 'Operador Logístico & Supply Chain',
      en: 'Logistics & Supply Chain Operator',
    },
    challenge: {
      es: 'Monolito heredado con caídas recurrentes durante picos de tracking de flota y tiempos de respuesta superiores a 2.5 segundos.',
      en: 'Legacy monolith with recurring crashes during fleet tracking peaks and P99 response times exceeding 2.5 seconds.',
    },
    solution: {
      es: 'Arquitectura de microservicios contenerizados en AWS ECS Fargate, colas SQS para eventos asíncronos y API Gateway optimizada con Node.js y Go.',
      en: 'Containerized microservices on AWS ECS Fargate, asynchronous event queuing with SQS, and ultra-low latency Node.js/Go API Gateway.',
    },
    metrics: [
      { value: '95ms', label: { es: 'Latencia P99', en: 'P99 response latency' } },
      { value: '99.98%', label: { es: 'Uptime operativo', en: 'Operational uptime' } },
      { value: '2 semanas', label: { es: 'Despliegue a producción', en: 'Production rollout' } },
    ],
    stack: ['AWS ECS', 'Docker', 'Node.js', 'Go', 'Redis', 'AWS SQS'],
    duration: {
      es: 'Sprint de 2 semanas',
      en: '2-week sprint',
    },
  },
  {
    id: 'dev-b2b-portal-billing',
    pillarId: 'desarrollo',
    title: {
      es: 'Portal Web B2B Corporativo con Facturación y Conciliación Directa',
      en: 'B2B Corporate Client Portal with Invoicing & Reconciliation',
    },
    clientType: {
      es: 'Distribuidor Mayorista Industrial',
      en: 'Industrial Wholesale Distributor',
    },
    challenge: {
      es: 'Gestión manual de pedidos por WhatsApp y correos sin trazabilidad, demorando hasta 72 horas en validar comprobantes de pago bancario.',
      en: 'Manual order management via scattered emails/chats with no audit trail, taking 72 hours to verify bank deposit slips.',
    },
    solution: {
      es: 'Plataforma web reactiva con portal de clientes bilingüe, panel de consultores, módulo de conciliación bancaria y generación de órdenes con códigos únicos.',
      en: 'Reactive web platform with bilingual client portal, consultant admin panel, automated bank reconciliation, and unique order tracking.',
    },
    metrics: [
      { value: '-80%', label: { es: 'Tiempo de procesamiento', en: 'Order processing time' } },
      { value: '100%', label: { es: 'Trazabilidad de pagos', en: 'Payment auditability' } },
      { value: '12 días', label: { es: 'Tiempo de entrega', en: 'Time to deliver' } },
    ],
    stack: ['React', 'Supabase', 'PostgreSQL', 'Tailored CSS', 'Vite'],
    duration: {
      es: 'Sprint de 2 semanas',
      en: '2-week sprint',
    },
  },
  {
    id: 'ai-rag-legal-finance',
    pillarId: 'datos',
    title: {
      es: 'Asistente RAG & Búsqueda Semántica sobre 50,000 Documentos',
      en: 'Enterprise RAG Agent & Semantic Search over 50,000 Documents',
    },
    clientType: {
      es: 'Firma de Asesoría Legal & Contable',
      en: 'Corporate Legal & Financial Advisory',
    },
    challenge: {
      es: 'Horas perdidas de analistas buscando cláusulas contractuales y normativas en miles de PDFs y resoluciones judiciales desestructuradas.',
      en: 'Analyst hours wasted manually searching clauses and regulatory policies across thousands of unstructured PDFs and rulings.',
    },
    solution: {
      es: 'Pipeline de ingesta y embeddings vectoriales con pgvector, reranking semántico e interfaz conversacional con Gemini 1.5 Flash y citas de página auditables.',
      en: 'Vector ingestion pipeline with pgvector, semantic reranking, and Gemini 1.5 Flash agent with strict auditable source citations.',
    },
    metrics: [
      { value: '< 2 seg', label: { es: 'Respuesta con citas', en: 'Cited answer time' } },
      { value: '0%', label: { es: 'Alucinaciones en datos', en: 'Hallucination rate' } },
      { value: '8 días', label: { es: 'Prototipo funcional', en: 'Working prototype' } },
    ],
    stack: ['Gemini API', 'pgvector', 'PostgreSQL', 'Python', 'LangChain/Genkit'],
    duration: {
      es: 'Sprint de 8 días',
      en: '8-day sprint',
    },
  },
  {
    id: 'ai-demand-forecasting',
    pillarId: 'datos',
    title: {
      es: 'Modelo Predictivo de Demanda & Dashboard Ejecutivo en Tiempo Real',
      en: 'Demand Forecasting ML Model & Realtime Executive Dashboard',
    },
    clientType: {
      es: 'Cadena de Retail & Consumo Masivo',
      en: 'Retail & Consumer Goods Chain',
    },
    challenge: {
      es: 'Excesos de inventario perecible en unos locales y desabastecimiento en otros debido a proyecciones basadas en hojas de cálculo estáticas.',
      en: 'Perishable inventory surplus in some branches and stockouts in others due to static spreadsheet forecasting.',
    },
    solution: {
      es: 'Modelo de Machine Learning para series temporales con estacionalidad, pipeline de actualización diaria y dashboard ejecutivo interactivo en tiempo real.',
      en: 'Time-series Machine Learning model with seasonality adjustment, daily data refresh pipeline, and interactive executive dashboard.',
    },
    metrics: [
      { value: '-28%', label: { es: 'Quiebres de inventario', en: 'Stockout reduction' } },
      { value: '94.2%', label: { es: 'Precisión predictiva', en: 'Forecast accuracy' } },
      { value: '10 días', label: { es: 'Puesta en marcha', en: 'Deployment sprint' } },
    ],
    stack: ['Python', 'Scikit-learn', 'LightGBM', 'PostgreSQL', 'React Charts'],
    duration: {
      es: 'Sprint de 10 días',
      en: '10-day sprint',
    },
  },
];
