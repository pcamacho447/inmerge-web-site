/**
 * Banco curatorial de proyectos y casos de éxito de ingeniería en Inmerge.
 * Soporta tanto la vista de carrusel/caso de estudio (ProjectCarousel)
 * como el feed continuo asimétrico (ProjectFeed).
 */
export const PROJECTS_DATA = [
  {
    id: 'audit-fintech-db',
    pillarId: 'auditoria',
    quotePillar: 'auditoria',
    pillar: 'web_pages',
    number: '01',
    catNumber: 'INM-CAT-2026.01',
    penBase: 2400,
    usdBase: 650,
    lead: {
      es: 'Ing. M. Seminario · Auditor Forense',
      en: 'Eng. M. Seminario · Forensic Auditor',
    },
    videoUrl: '/presencia_web_showcase.mp4',
    posterUrl: '/projects/data-sanitization.jpg',
    specs: {
      es: [
        'Arquitectura React 18 / Vite con 0 kB bloat',
        'Puntaje Lighthouse 95+ garantizado (Core Web Vitals)',
        'Formulario con validación y honeypot anti-spam',
        'Indexación y SEO técnico internacional',
      ],
      en: [
        'React 18 / Vite zero-bloat architecture',
        'Guaranteed 95+ Lighthouse score (Core Web Vitals)',
        'Accessible form with honeypot anti-spam',
        'International SEO & canonical metadata',
      ],
    },
    conditions: {
      es: [
        'Plazo Estimado: ~1 a 2 semanas',
        'Entregable: Código fuente completo en Git',
        'Despliegue configurado en Vercel / Cloudflare',
        'Soporte post-despliegue por 30 días',
      ],
      en: [
        'Estimated Timeline: ~1 to 2 weeks',
        'Deliverable: Complete source code in Git',
        'Deployment configured on Vercel / Cloudflare',
        '30 days post-launch technical warranty',
      ],
    },
    image: '/projects/data-sanitization.jpg',
    title: {
      es: 'Saneamiento y Auditoría Forense de Base de Datos de 18M Registros',
      en: 'Forensic Audit & Data Sanitization for 18M Records Database',
    },
    client: {
      es: 'Grupo Financiero & Servicios Corporativos',
      en: 'Financial & Corporate Services Group',
    },
    industry: {
      es: 'Servicios Financieros & Banca',
      en: 'Financial Services & Banking',
    },
    clientType: {
      es: 'Grupo Financiero & Servicios Corporativos',
      en: 'Financial & Corporate Services Group',
    },
    description: {
      es: 'Plataforma web transaccional bilingüe sobre lienzo continuo con arquitectura React 18 / Vite con 0 kB Deuda Técnica, carga LCP < 0.8s y accesibilidad WCAG 2.1 AA.',
      en: 'Transactional bilingual web platform on continuous canvas with React 18 / Vite zero-bloat architecture, <0.8s LCP load time, and WCAG 2.1 AA accessibility.',
    },
    summary: {
      es: 'Auditoría integral de calidad, desduplicación en tiempo real y saneamiento de registros críticos con trazabilidad forense.',
      en: 'Comprehensive quality audit, real-time deduplication, and forensic cleansing of critical business data records.',
    },
    challenge: {
      es: 'Base de datos legacy de PostgreSQL con duplicados masivos, inconsistencias de tipo en campos RUC/DNI y caídas en consultas analíticas durante el cierre mensual.',
      en: 'Legacy PostgreSQL database plagued by massive duplicates, schema type mismatch on Tax IDs, and heavy analytical query failures during monthly reporting.',
    },
    solution: {
      es: 'Diseño e implementación de pipeline de saneamiento ETL multihilo, validadores de esquema PostgREST y reglas RLS para prevenir degradación de datos.',
      en: 'Engineered multi-threaded ETL cleansing pipeline, strict PostgREST schema validators, and defensive RLS policies preventing future data decay.',
    },
    metadata: {
      year: '2026',
      location: 'Lima, Perú',
      metric: 'LCP 0.8s',
      lighthouse: '99/100',
    },
    metrics: [
      { value: '18.4M', label: { es: 'Registros auditados', en: 'Records audited' } },
      { value: '99.99%', label: { es: 'Integridad de datos', en: 'Data integrity' } },
      { value: '3 días', label: { es: 'Ejecución completa', en: 'Full run execution' } },
    ],
    stack: ['PostgreSQL', 'Python', 'React 18', 'Vite', 'PostgREST', 'Docker'],
    duration: {
      es: 'Sprint de 1 semana',
      en: '1-week sprint',
    },
    diagram: {
      type: 'pipeline',
      badge: 'Zero-Loss Forensic Pipeline',
      steps: [
        { name: 'Raw Ingestion', detail: '18.4M Unsanitized Records' },
        { name: 'Validation Rules', detail: 'Regex RUC/DNI & Deduplication' },
        { name: 'Clean Target Store', detail: '99.99% Audited Schema' },
      ],
    },
    deliverables: {
      es: [
        'Informe forense de calidad de datos y matriz de riesgos',
        'Scripts SQL idempotentes de migración y desduplicación',
        'Dashboard interactivo de telemetría de sanidad en tiempo real',
      ],
      en: [
        'Data quality forensic report & risk assessment matrix',
        'Idempotent SQL migration and deduplication scripts',
        'Interactive real-time health telemetry dashboard',
      ],
    },
    scope: {
      es: [
        'Diseño de interfaz editorial contemporánea inspirada en geometría Mochica-Chimú.',
        'Optimización extrema de Core Web Vitals (LCP < 0.8s, INP < 50ms).',
        'Sistema bilingüe espejo nativo sin dependencias de terceros.',
      ],
      en: [
        'Contemporary editorial UI design inspired by Mochica-Chimú geometry.',
        'Extreme Core Web Vitals optimization (LCP < 0.8s, INP < 50ms).',
        'Native zero-bloat bilingual mirror system.',
      ],
    },
    results: {
      es: [
        '18.4M de registros procesados con 99.99% de integridad de datos.',
        'Reducción del 85% en peso de bundle inicial respecto a CMS tradicionales.',
        '100% de cumplimiento de estándares de accesibilidad e integridad de datos.',
      ],
      en: [
        '18.4M records processed with 99.99% data integrity.',
        '85% bundle weight reduction compared to legacy CMS platforms.',
        '100% compliance with accessibility and data integrity standards.',
      ],
    },
    media: [
      {
        id: 'media-1',
        type: 'video',
        url: '/presencia_web_showcase.mp4',
        poster: '/projects/data-sanitization.jpg',
        span: 8,
        title: {
          es: 'Video Showcase: Navegación Flotante y Viewport Monumental',
          en: 'Video Showcase: Floating Navigation & Monumental Viewport',
        },
      },
      {
        id: 'media-2',
        type: 'video',
        url: '/presencia_web_hero.mp4',
        poster: '/projects/aws-cloud.jpg',
        span: 4,
        title: {
          es: 'Video Tour: Recorrido Cinemático de Producto',
          en: 'Video Tour: Cinematic Product Walkthrough',
        },
      },
    ],
  },
  {
    id: 'audit-aws-security-cost',
    pillarId: 'auditoria',
    pillar: 'software_engineering',
    number: '02',
    catNumber: 'INM-CAT-2026.02',
    penBase: 4500,
    usdBase: 1200,
    lead: {
      es: 'Ing. C. Vega · Arquitecto Cloud AWS',
      en: 'Eng. C. Vega · AWS Cloud Architect',
    },
    videoUrl: '/presencia_web_showcase.mp4',
    posterUrl: '/projects/aws-cloud.jpg',
    specs: {
      es: [
        'Arquitectura Serverless y contenedores AWS ECS Fargate',
        'Políticas IAM de mínimo privilegio y auditoría CloudTrail',
        'Cifrado en reposo y tránsito conforme a normas financieras',
        'Monitoreo y alertas automatizadas en CloudWatch',
      ],
      en: [
        'Serverless architecture & AWS ECS Fargate containers',
        'Least-privilege IAM policies & CloudTrail auditing',
        'Encryption at rest & transit compliant with financial standards',
        'Automated CloudWatch monitoring & alerts',
      ],
    },
    conditions: {
      es: [
        'Plazo Estimado: ~5 días de auditoría',
        'Entregable: Infraestructura como código (IaC) en Terraform',
        'Informe comparativo de costos mensual con ahorros proyectados',
        'Soporte de acompañamiento por 45 días',
      ],
      en: [
        'Estimated Timeline: ~5 audit days',
        'Deliverable: Terraform Infrastructure as Code (IaC)',
        'Monthly cost comparison report with projected savings',
        '45 days technical SLA support',
      ],
    },
    image: '/projects/aws-cloud.jpg',
    title: {
      es: 'Auditoría de Seguridad, IAM y Optimización de Costos en AWS Cloud',
      en: 'AWS Cloud Security Audit, IAM Hardening & Cost Optimization',
    },
    client: {
      es: 'Plataforma SaaS B2B Regional',
      en: 'Regional B2B SaaS Platform',
    },
    industry: {
      es: 'Infraestructura Cloud & Microservicios (AWS)',
      en: 'Cloud Infrastructure & Microservices (AWS)',
    },
    clientType: {
      es: 'Plataforma SaaS B2B Regional',
      en: 'Regional B2B SaaS Platform',
    },
    description: {
      es: 'Modernización de microservicios transaccionales backend en AWS ECS Fargate y Lambda con PostgreSQL RDS y trazabilidad forense en tiempo real.',
      en: 'Modernization of backend transactional microservices on AWS ECS Fargate and Lambda with PostgreSQL RDS and real-time forensic event logging.',
    },
    summary: {
      es: 'Auditoría técnica de arquitectura en la nube, hardening de políticas IAM y reducción comprobada de facturación mensual.',
      en: 'Technical cloud architecture audit, IAM security hardening, and verified monthly bill reduction.',
    },
    challenge: {
      es: 'Costos desorbitados en instancias EC2 sobredimensionadas, permisos IAM demasiado permisivos (AdministratorAccess) y vulnerabilidades de exposición pública.',
      en: 'Skyrocketing AWS bill due to overprovisioned EC2 instances, over-permissive IAM roles, and public exposure vulnerabilities.',
    },
    solution: {
      es: 'Migración a arquitectura serverless Fargate/Lambda, implementación de políticas IAM de mínimo privilegio y configuración de reservas de capacidad S3/RDS.',
      en: 'Refactored to Fargate/Lambda serverless architecture, enforced least-privilege IAM policies, and optimized S3/RDS storage reservation models.',
    },
    metadata: {
      year: '2026',
      location: 'Lima / LatAm',
      metric: '99.99% Uptime',
      latency: '< 45ms',
    },
    metrics: [
      { value: '-42%', label: { es: 'Reducción de costos AWS', en: 'AWS bill reduction' } },
      { value: '100%', label: { es: 'Cumplimiento de seguridad', en: 'Security compliance' } },
      { value: '5 días', label: { es: 'Tiempo de auditoría', en: 'Audit completion time' } },
    ],
    stack: ['AWS IAM', 'ECS Fargate', 'Lambda', 'Terraform', 'CloudWatch', 'S3'],
    duration: {
      es: 'Sprint de 5 días',
      en: '5-day sprint',
    },
    diagram: {
      type: 'cloud_hardening',
      badge: 'AWS Security & Cost Topology',
      steps: [
        { name: 'Overprovisioned EC2', detail: 'Unused Capacity & Over-cost' },
        { name: 'IAM Least-Privilege', detail: 'Role Hardening & CloudTrail Audit' },
        { name: 'Fargate & Savings Plan', detail: '42% Monthly Cost Reduction' },
      ],
    },
    deliverables: {
      es: [
        'Matriz de recomendaciones de seguridad IAM y parches aplicados',
        'Planillas Terraform de infraestructura como código (IaC)',
        'Informe comparativo de costos mensual con ahorros proyectados',
      ],
      en: [
        'IAM security recommendation matrix & applied patches',
        'Terraform Infrastructure as Code (IaC) templates',
        'Monthly cost comparison report with projected savings',
      ],
    },
    scope: {
      es: [
        'Modelado de arquitectura serverless y contenedores aislados.',
        'Pipeline CI/CD automatizado con cobertura de pruebas unitarias > 90%.',
        'Cifrado en reposito y tránsito conforme a normas de seguridad financiera.',
      ],
      en: [
        'Serverless architecture & isolated container modeling.',
        'Automated CI/CD pipeline with unit test coverage > 90%.',
        'Data encryption at rest and in transit compliant with financial security standards.',
      ],
    },
    results: {
      es: [
        '99.99% de disponibilidad operativa garantizada bajo SLA.',
        'Reducción del 42% en costos mensuales de infraestructura cloud.',
        'Tiempo de respuesta de API reducido a menos de 45 milisegundos.',
      ],
      en: [
        '99.99% operational availability guaranteed under SLA.',
        '42% reduction in monthly cloud infrastructure expenses.',
        'API response latency reduced to under 45 milliseconds.',
      ],
    },
    media: [
      {
        id: 'media-3',
        type: 'video',
        url: '/hero_inmerge.mp4',
        poster: '/projects/aws-cloud.jpg',
        span: 8,
        title: {
          es: 'Video Demostración: Telemetría de Microservicios en Tiempo Real',
          en: 'Video Demo: Real-Time Microservices Telemetry',
        },
      },
      {
        id: 'media-4',
        type: 'image',
        url: '/projects/logistics-microservices.jpg',
        poster: '/projects/logistics-microservices.jpg',
        span: 4,
        title: {
          es: 'Esquema de Topología Cloud e Infraestructura AWS',
          en: 'Cloud Topology & AWS Infrastructure Diagram',
        },
      },
    ],
  },
  {
    id: 'dev-microservices-gateway',
    pillarId: 'desarrollo',
    pillar: 'software_engineering',
    number: '03',
    catNumber: 'INM-CAT-2026.03',
    penBase: 6500,
    usdBase: 1750,
    lead: {
      es: 'Ing. D. Alva · Líder de Microservicios',
      en: 'Eng. D. Alva · Microservices Lead',
    },
    videoUrl: '/mam-inmerge-hero.mp4',
    posterUrl: '/projects/video_mam_frame0.jpg',
    specs: {
      es: [
        'Microservicios desacoplados en Node.js y Go',
        'API Gateway de alta concurrencia con caché Redis',
        'Colas SQS para eventos asíncronos y resiliencia',
        'Suite de pruebas de carga k6 para validar latencia P99',
      ],
      en: [
        'Decoupled microservices in Node.js and Go',
        'High-concurrency API Gateway with Redis caching',
        'SQS queues for async events & resilience',
        'k6 load testing suite for P99 latency validation',
      ],
    },
    conditions: {
      es: [
        'Plazo Estimado: ~2 semanas',
        'Entregable: Contenedores Docker listos para CI/CD',
        'Especificación OpenAPI / Swagger auditada',
        'Garantía técnica de 60 días post-despliegue',
      ],
      en: [
        'Estimated Timeline: ~2 weeks',
        'Deliverable: CI/CD ready Docker containers',
        'Audited OpenAPI / Swagger specification',
        '60 days post-deployment technical warranty',
      ],
    },
    image: '/projects/logistics-microservices.jpg',
    title: {
      es: 'Modernización de Plataforma de Microservicios & API Gateway',
      en: 'Microservices Platform & API Gateway Modernization',
    },
    client: {
      es: 'Empresa de Logística & Transporte Global',
      en: 'Global Logistics & Freight Enterprise',
    },
    industry: {
      es: 'Logística & Transportes',
      en: 'Logistics & Freight',
    },
    clientType: {
      es: 'Empresa de Logística & Transporte Global',
      en: 'Global Logistics & Freight Enterprise',
    },
    description: {
      es: 'Sistemas de software para la gestión de operaciones internas, plataformas B2B, automatización de flujos administrativos y portales de proveedores.',
      en: 'Core internal operations software, B2B platforms, administrative workflow automation, and vendor portals.',
    },
    summary: {
      es: 'Refactorización de monolito a microservicios desacoplados con API Gateway de alta concurrencia y baja latencia.',
      en: 'Monolith refactoring to decoupled microservices with high-concurrency low-latency API Gateway.',
    },
    challenge: {
      es: 'Monolito heredado con caídas recurrentes durante picos de tracking de flota y tiempos de respuesta superiores a 2.5 segundos.',
      en: 'Legacy monolith with recurring crashes during fleet tracking peaks and P99 response times exceeding 2.5 seconds.',
    },
    solution: {
      es: 'Arquitectura de microservicios contenerizados en AWS ECS Fargate, colas SQS para eventos asíncronos y API Gateway optimizada con Node.js y Go.',
      en: 'Containerized microservices on AWS ECS Fargate, asynchronous event queuing with SQS, and ultra-low latency Node.js/Go API Gateway.',
    },
    metadata: {
      year: '2026',
      location: 'Lima / LatAm',
      metric: '95ms Latency',
      concurrency: '10K RPS',
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
    scope: {
      es: [
        'Desacoplamiento de monolito a microservicios independientes.',
        'Implementación de API Gateway con caché Redis.',
        'Pruebas de carga extremas k6 para validar resiliencia.',
      ],
      en: [
        'Decoupling monolith to independent microservices.',
        'API Gateway setup with Redis caching.',
        'Extreme k6 load testing to guarantee resiliency.',
      ],
    },
    results: {
      es: [
        'Tiempos de respuesta P99 reducidos de 2.5s a 95ms.',
        '99.98% de uptime operativo durante días festivos.',
        'Despliegue completo a producción en 2 semanas.',
      ],
      en: [
        'P99 response time reduced from 2.5s to 95ms.',
        '99.98% operational uptime during high season peaks.',
        'Full production rollout achieved in 2 weeks.',
      ],
    },
    media: [
      {
        id: 'media-5',
        type: 'image',
        url: '/projects/logistics-microservices.jpg',
        poster: '/projects/logistics-microservices.jpg',
        span: 8,
        title: {
          es: 'Diagrama de Arquitectura de Microservicios ECS',
          en: 'ECS Microservices Architecture Diagram',
        },
      },
      {
        id: 'media-6',
        type: 'video',
        url: '/mam-inmerge-hero.mp4',
        poster: '/projects/video_mam_frame0.jpg',
        span: 4,
        title: {
          es: 'Video Tour: Demostración de Plataforma & Arquitectura',
          en: 'Video Tour: Platform & Architecture Demo',
        },
      },
    ],
  },
  {
    id: 'dev-b2b-portal-billing',
    pillarId: 'desarrollo',
    pillar: 'web_pages',
    number: '04',
    catNumber: 'INM-CAT-2026.04',
    penBase: 7200,
    usdBase: 1950,
    lead: {
      es: 'Ing. M. Seminario · Arquitecto Full-Stack',
      en: 'Eng. M. Seminario · Full-Stack Architect',
    },
    videoUrl: '/presencia_web_showcase.mp4',
    posterUrl: '/projects/b2b-portal.jpg',
    specs: {
      es: [
        'Portal web SPA React con autenticación JWT / Supabase Auth',
        'Módulo de conciliación automática de transferencias bancarias',
        'Generación de órdenes con código único correlativo',
        'Panel de administración con control de acceso por roles (RBAC)',
      ],
      en: [
        'React SPA web portal with JWT / Supabase Auth',
        'Automated bank transfer reconciliation module',
        'Order generation with unique tracking codes',
        'Admin dashboard with Role-Based Access Control (RBAC)',
      ],
    },
    conditions: {
      es: [
        'Plazo Estimado: ~12 días calendario',
        'Entregable: Código fuente SPA React + Esquema PostgreSQL',
        'Ambientes Staging y Producción configurados',
        'Soporte técnico por 45 días',
      ],
      en: [
        'Estimated Timeline: ~12 calendar days',
        'Deliverable: React SPA source code + PostgreSQL schema',
        'Configured Staging & Production environments',
        '45 days technical support',
      ],
    },
    image: '/projects/b2b-portal.jpg',
    title: {
      es: 'Portal Web B2B Corporativo con Facturación y Conciliación Directa',
      en: 'B2B Corporate Client Portal with Invoicing & Reconciliation',
    },
    client: {
      es: 'Distribuidor Mayorista Industrial',
      en: 'Industrial Wholesale Distributor',
    },
    industry: {
      es: 'Comercio Industrial & Distribución B2B',
      en: 'Industrial Commerce & B2B Distribution',
    },
    clientType: {
      es: 'Distribuidor Mayorista Industrial',
      en: 'Industrial Wholesale Distributor',
    },
    description: {
      es: 'Plataforma web con componentes interactivos complejos: cotizadores dinámicos, catálogos filtrables en tiempo real, portales de cliente autenticados y CMS headless.',
      en: 'Advanced web platform with interactive components: dynamic quote engines, real-time filtered catalogs, client portals, or headless CMS.',
    },
    summary: {
      es: 'Plataforma web reactiva B2B con automatización de conciliación bancaria y portal de clientes autenticado.',
      en: 'Reactive B2B web platform with automated bank reconciliation and authenticated client portal.',
    },
    challenge: {
      es: 'Gestión manual de pedidos por WhatsApp y correos sin trazabilidad, demorando hasta 72 horas en validar comprobantes de pago bancario.',
      en: 'Manual order management via scattered emails/chats with no audit trail, taking 72 hours to verify bank deposit slips.',
    },
    solution: {
      es: 'Plataforma web reactiva con portal de clientes bilingüe, panel de consultores, módulo de conciliación bancaria y generación de órdenes con códigos únicos.',
      en: 'Reactive web platform with bilingual client portal, consultant admin panel, automated bank reconciliation, and unique order tracking.',
    },
    metadata: {
      year: '2026',
      location: 'Lima, Perú',
      metric: '-80% Process Time',
      delivery: '12 Days',
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
    scope: {
      es: [
        'Desarrollo de portal de clientes con autenticación JWT.',
        'Módulo de conciliación automática de transferencias bancarias.',
        'Panel administrativo de gestión de órdenes e hitos.',
      ],
      en: [
        'Client portal development with JWT authentication.',
        'Automated bank transfer reconciliation module.',
        'Admin order management & milestone control dashboard.',
      ],
    },
    results: {
      es: [
        'Reducción del 80% en el tiempo de validación de pedidos.',
        '100% de auditabilidad de comprobantes y pagos.',
        'Puesta en marcha en 12 días calendario.',
      ],
      en: [
        '80% reduction in order processing & verification time.',
        '100% payment receipt auditability.',
        'Go-live achieved in 12 calendar days.',
      ],
    },
    media: [
      {
        id: 'media-7',
        type: 'video',
        url: '/presencia_web_hero.mp4',
        poster: '/projects/b2b-portal.jpg',
        span: 8,
        title: {
          es: 'Video Tour: Recorrido por la Interfaz del Portal B2B',
          en: 'Video Tour: B2B Portal UI Walkthrough',
        },
      },
      {
        id: 'media-8',
        type: 'image',
        url: '/projects/b2b-portal.jpg',
        poster: '/projects/b2b-portal.jpg',
        span: 4,
        title: {
          es: 'Captura de Pantalla: Panel de Conciliación Bancaria',
          en: 'Screenshot: Bank Reconciliation Panel',
        },
      },
    ],
  },
  {
    id: 'ai-rag-legal-finance',
    pillarId: 'datos',
    pillar: 'data_analytics',
    number: '05',
    catNumber: 'INM-CAT-2026.05',
    penBase: 9800,
    usdBase: 2650,
    lead: {
      es: 'Ing. R. Morales · Especialista en IA',
      en: 'Eng. R. Morales · AI Specialist',
    },
    videoUrl: '/presencia_web_showcase.mp4',
    posterUrl: '/projects/ai-rag.jpg',
    specs: {
      es: [
        'Chunking de PDFs y vectorización automatizada en pgvector',
        'Búsqueda semántica con reranking de alta precisión',
        'Integración con Gemini API y prompts anti-alucinación',
        'Citas de página strictly auditables en cada respuesta',
      ],
      en: [
        'PDF chunking & automated vectorization in pgvector',
        'High-precision semantic search with reranking',
        'Gemini API integration with anti-hallucination prompts',
        'Strict auditable page citations in every answer',
      ],
    },
    conditions: {
      es: [
        'Plazo Estimado: ~8 días de sprint',
        'Entregable: API REST de consulta vectorial + Interfaz UI',
        'Cuadro de benchmark de precisión en corpus legal',
        'Soporte y ajuste de modelo por 30 días',
      ],
      en: [
        'Estimated Timeline: ~8-day sprint',
        'Deliverable: Vector search REST API + UI frontend',
        'Precision benchmark matrix on legal corpus',
        '30 days model tuning & support',
      ],
    },
    image: '/projects/ai-rag.jpg',
    title: {
      es: 'Asistente RAG & Búsqueda Semántica sobre 50,000 Documentos',
      en: 'Enterprise RAG Agent & Semantic Search over 50,000 Documents',
    },
    client: {
      es: 'Firma de Asesoría Legal & Contable',
      en: 'Corporate Legal & Financial Advisory',
    },
    industry: {
      es: 'Inteligencia Artificial Aplicada & RAG',
      en: 'Applied AI & RAG Engineering',
    },
    clientType: {
      es: 'Firma de Asesoría Legal & Contable',
      en: 'Corporate Legal & Financial Advisory',
    },
    description: {
      es: 'Pipeline de ingesta y embeddings vectoriales con pgvector, reranking semántico e interfaz conversacional con Gemini API y citas de página auditables.',
      en: 'Vector ingestion pipeline with pgvector, semantic reranking, and Gemini API agent with strict auditable source citations.',
    },
    summary: {
      es: 'Motor de búsqueda vectorial y agente conversacional de IA con citación estricta de fuentes para documentos técnicos.',
      en: 'Vector search engine and AI conversational agent with strict source citations for technical legal documents.',
    },
    challenge: {
      es: 'Horas perdidas de analistas buscando cláusulas contractuales y normativas en miles de PDFs y resoluciones judiciales desestructuradas.',
      en: 'Analyst hours wasted manually searching clauses and regulatory policies across thousands of unstructured PDFs and rulings.',
    },
    solution: {
      es: 'Pipeline de ingesta y embeddings vectoriales con pgvector, reranking semántico e interfaz conversacional con Gemini 1.5 Flash y citas de página auditables.',
      en: 'Vector ingestion pipeline with pgvector, semantic reranking, and Gemini 1.5 Flash agent with strict auditable source citations.',
    },
    metadata: {
      year: '2026',
      location: 'Lima, Perú',
      metric: '< 2s Response',
      accuracy: '0% Hallucination',
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
      es: [
        'Pipeline ETL de vectorización automatizada',
        'API REST de consulta semántica',
        'Interfaz conversacional con trazabilidad de citas',
      ],
      en: ['Automated vectorization ETL pipeline', 'Semantic query REST API', 'Chat UI with strict source verification'],
    },
    scope: {
      es: [
        'Chunking de PDFs desestructurados e ingesta en pgvector.',
        'Integración de LLM con plantilla de prompts anti-alucinación.',
        'Pruebas de precisión semántica en corpuses legales.',
      ],
      en: [
        'Unstructured PDF chunking and ingestion into pgvector.',
        'LLM integration with strict anti-hallucination prompt template.',
        'Semantic precision benchmarking on legal corpora.',
      ],
    },
    results: {
      es: [
        'Tiempos de búsqueda de contratos reducidos a menos de 2 segundos.',
        '0% de tasa de alucinaciones en respuestas auditadas.',
        'Puesta en marcha en sprint de 8 días.',
      ],
      en: [
        'Contract query search times reduced to under 2 seconds.',
        '0% hallucination rate on audited queries.',
        'Deployment completed in an 8-day sprint.',
      ],
    },
    media: [
      {
        id: 'media-9',
        type: 'image',
        url: '/projects/ai-rag.jpg',
        poster: '/projects/ai-rag.jpg',
        span: 8,
        title: {
          es: 'Arquitectura del Agente RAG y Motor de Búsqueda Vectorial',
          en: 'RAG Agent Architecture & Vector Search Engine',
        },
      },
      {
        id: 'media-10',
        type: 'video',
        url: '/presencia_web_showcase.mp4',
        poster: '/projects/b2b-portal.jpg',
        span: 4,
        title: {
          es: 'Video Demostración: Agente Conversacional con Citas',
          en: 'Video Demo: Conversational Agent with Citations',
        },
      },
    ],
  },
  {
    id: 'ai-demand-forecasting',
    pillarId: 'datos',
    pillar: 'data_analytics',
    number: '06',
    catNumber: 'INM-CAT-2026.06',
    penBase: 3800,
    usdBase: 1050,
    lead: {
      es: 'Ing. R. Morales · Científico de Datos',
      en: 'Eng. R. Morales · Data Scientist',
    },
    videoUrl: '/presencia_web_showcase.mp4',
    posterUrl: '/projects/demand-forecasting.jpg',
    specs: {
      es: [
        'Modelo ML de series temporales con regredores LightGBM',
        'Explicabilidad de inferencia mediante valores SHAP',
        'Pipeline cron de inferencia y actualización diaria',
        'Dashboard ejecutivo en tiempo real para control de inventario',
      ],
      en: [
        'Time-series ML model with LightGBM regressors',
        'Inference explainability via SHAP values',
        'Daily automated inference cron pipeline',
        'Real-time executive dashboard for inventory control',
      ],
    },
    conditions: {
      es: [
        'Plazo Estimado: ~10 días de desarrollo',
        'Entregable: Modelo ML entrenado + Notebooks reproducibles',
        'Integración con fuente de datos SQL del cliente',
        'Monitoreo de drift y soporte por 60 días',
      ],
      en: [
        'Estimated Timeline: ~10-day development',
        'Deliverable: Trained ML model + reproducible notebooks',
        'Integration with client SQL data source',
        'Drift monitoring & 60 days support',
      ],
    },
    image: '/projects/demand-forecasting.jpg',
    title: {
      es: 'Modelo Predictivo de Demanda & Dashboard Ejecutivo en Tiempo Real',
      en: 'Demand Forecasting ML Model & Realtime Executive Dashboard',
    },
    client: {
      es: 'Cadena de Retail & Consumo Masivo',
      en: 'Retail & Consumer Goods Chain',
    },
    industry: {
      es: 'Ciencia de Datos & Machine Learning',
      en: 'Data Science & Machine Learning',
    },
    clientType: {
      es: 'Cadena de Retail & Consumo Masivo',
      en: 'Retail & Consumer Goods Chain',
    },
    description: {
      es: 'Pipeline de análisis de datos continuo con modelos de aprendizaje automático para detección de anomalías operativas y visualización ejecutiva auditada.',
      en: 'Continuous data analytics pipeline with machine learning models for operational anomaly detection and audited executive reporting.',
    },
    summary: {
      es: 'Modelo predictivo de series temporales para optimización de inventarios y abastecimiento en sucursales.',
      en: 'Time-series Machine Learning model optimizing store stock allocation and replenishment.',
    },
    challenge: {
      es: 'Excesos de inventario perecible en unos locales y desabastecimiento en otros debido a proyecciones basadas en hojas de cálculo estáticas.',
      en: 'Perishable inventory surplus in some branches and stockouts in others due to static spreadsheet forecasting.',
    },
    solution: {
      es: 'Modelo de Machine Learning para series temporales con estacionalidad, pipeline de actualización diaria y dashboard ejecutivo interactivo en tiempo real.',
      en: 'Time-series Machine Learning model with seasonality adjustment, daily data refresh pipeline, and interactive executive dashboard.',
    },
    metadata: {
      year: '2026',
      location: 'Lima, Perú',
      metric: '94.2% Accuracy',
      impact: '-28% Stockouts',
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
      es: [
        'Modelo ML entrenado con métricas de validación',
        'Pipeline cron de inferencia diaria',
        'Dashboard interactivo de decisiones en tiempo real',
      ],
      en: ['Trained ML model with cross-validation', 'Daily inference batch cron pipeline', 'Interactive realtime executive dashboard'],
    },
    scope: {
      es: [
        'Limpieza de datos de ventas e historial de demanda.',
        'Entrenamiento de regredores LightGBM por categoría.',
        'Visualización en tiempo real en dashboard ejecutivo.',
      ],
      en: [
        'Sales history cleaning and demand ETL.',
        'LightGBM regressor training per product category.',
        'Realtime executive dashboard visualization.',
      ],
    },
    results: {
      es: [
        'Reducción del 28% en quiebres de inventario.',
        '94.2% de precisión en proyecciones semanales.',
        'Puesta en producción en 10 días.',
      ],
    },
    media: [
      {
        id: 'media-11',
        type: 'image',
        url: '/projects/credit-risk-ml.jpg',
        poster: '/projects/credit-risk-ml.jpg',
        span: 8,
        title: {
          es: 'Matriz de Analítica Avanzada y Flujo Sankey de Datos',
          en: 'Advanced Analytics Matrix & Sankey Data Flow',
        },
      },
      {
        id: 'media-12',
        type: 'video',
        url: '/presencia_web_showcase.mp4',
        poster: '/projects/b2b-portal.jpg',
        span: 4,
        title: {
          es: 'Video Demostración: Tablero de Control de Datos Auditados',
          en: 'Video Demo: Audited Data Control Dashboard',
        },
      },
    ],
  },
];
