/**
 * Casos de éxito y proyectos representativos de Inmerge por pilar estratégico.
 * Contenido estructurado bilingüe (ES / EN) con esquemas de arquitectura visual,
 * métricas de impacto verificables y stack de ingeniería senior.
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
    diagram: {
      type: 'database_audit',
      badge: 'Zero-Loss Forensic Pipeline',
      steps: [
        { name: '18M Raw Records', detail: 'Ingestion & Hash Profiling' },
        { name: 'Forensic Sanitizer', detail: 'Automated Deduplication' },
        { name: 'Hardened RDS', detail: '99.999% Verified Integrity' },
      ],
    },
    deliverables: {
      es: ['Scripts SQL de saneamiento reproducibles', 'Reporte forense de inconsistencias', 'Diccionario de datos normalizado'],
      en: ['Reproducible SQL sanitization scripts', 'Forensic inconsistency audit report', 'Normalized data dictionary'],
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
    diagram: {
      type: 'cloud_topology',
      badge: 'AWS Well-Architected Security',
      steps: [
        { name: 'AWS IAM Audit', detail: 'Least Privilege Enforcement' },
        { name: 'ECS Right-Sizing', detail: 'Compute Cost Reduction' },
        { name: 'S3 LifeCycle & KMS', detail: 'Encryption & Archival Tiering' },
      ],
    },
    deliverables: {
      es: ['Matriz de permisos IAM auditada', 'Módulos Terraform de infraestructura base', 'Plan de ahorro cloud con ROI proyectado'],
      en: ['Audited IAM permission matrix', 'Baseline Terraform infrastructure modules', 'Cloud cost optimization roadmap with ROI'],
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
    diagram: {
      type: 'microservices',
      badge: 'AWS ECS Microservices Topology',
      steps: [
        { name: 'API Gateway', detail: 'Rate Limiting & Auth Filter' },
        { name: 'ECS Task Runners', detail: 'Node.js/Go Parallel Workers' },
        { name: 'Redis Cache & RDS', detail: 'Sub-100ms Data Fetch' },
      ],
    },
    deliverables: {
      es: ['Contenedores Docker listos para CI/CD', 'Documentación OpenAPI / Swagger auditada', 'Suite de pruebas de carga k6'],
      en: ['CI/CD production-ready Docker containers', 'OpenAPI/Swagger specs', 'k6 load testing suite'],
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
    diagram: {
      type: 'b2b_platform',
      badge: 'Realtime Portal Architecture',
      steps: [
        { name: 'Client UI (Bilingual)', detail: 'Self-serve Order Flow' },
        { name: 'Reconciliation Engine', detail: 'Unique Code & Receipt Matcher' },
        { name: 'Admin Dashboard', detail: 'Instant Order Approval' },
      ],
    },
    deliverables: {
      es: ['Aplicación web SPA React en producción', 'Esquema PostgreSQL con RLS y validaciones', 'Panel administrativo con roles RBAC'],
      en: ['Production SPA React web application', 'PostgreSQL schema with RLS & validation', 'Admin panel with granular RBAC'],
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
    diagram: {
      type: 'rag_engine',
      badge: 'Audited RAG Vector Pipeline',
      steps: [
        { name: 'Document Chunking', detail: 'Text Extraction & Metadata' },
        { name: 'pgvector Embeddings', detail: 'Dense Semantic Indexing' },
        { name: 'Gemini LLM Agent', detail: 'Strict Page-Cited Answers' },
      ],
    },
    deliverables: {
      es: ['Pipeline ETL de vectorización automatizada', 'API REST de consulta semántica', 'Interfaz conversacional con trazabilidad de citas'],
      en: ['Automated vectorization ETL pipeline', 'Semantic query REST API', 'Chat UI with strict source verification'],
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
    diagram: {
      type: 'forecasting_model',
      badge: 'Predictive ML Time-Series Engine',
      steps: [
        { name: 'Sales History ETL', detail: 'Outlier Removal & Cleansing' },
        { name: 'LightGBM Regressor', detail: 'Multi-Store Seasonality Model' },
        { name: 'Executive Dashboard', detail: 'Realtime Stock Recommendations' },
      ],
    },
    deliverables: {
      es: ['Modelo ML entrenado con métricas de validación', 'Pipeline cron de inferencia diaria', 'Dashboard interactivo de decisiones en tiempo real'],
      en: ['Trained ML model with cross-validation', 'Daily inference batch cron pipeline', 'Interactive realtime executive dashboard'],
    },
  },
];
