// Stack tecnológico, herramientas y metodología de Inmerge

export const METHODOLOGY_STEPS = [
  {
    step: '01',
    phase: 'Auditoría & Diagnóstico Inicial',
    title: 'Evaluación rigurosa del estado actual',
    desc: 'Auditoría exhaustiva de fuentes de información, calidad de datos, seguridad de infraestructura y deuda técnica. Mapeamos vulnerabilidades, inconsistencias y oportunidades antes de escribir una sola línea de código.',
    deliverables: ['Informe de auditoría técnica', 'Matriz de riesgos y calidad de datos', 'Hoja de ruta priorizada'],
    tag: 'Fase de Entrada',
  },
  {
    step: '02',
    phase: 'Arquitectura & Diseño de Solución',
    title: 'Modelado robusto sobre estándares modernos',
    desc: 'Diseño de arquitecturas desacopladas, pipelines de datos idempotentes y esquemas relacionales optimizados. Priorizamos la seguridad por diseño, la observabilidad y la escalabilidad sobre AWS o entornos on-premise.',
    deliverables: ['Diagrama de arquitectura cloud', 'Especificación técnica y contratos de API', 'Definición de modelos de datos'],
    tag: 'Fase Estructural',
  },
  {
    step: '03',
    phase: 'Ingeniería, Desarrollo & Modelado',
    title: 'Construcción con código limpio y pruebas automáticas',
    desc: 'Desarrollo ágil de software empresarial, pipelines ETL/ELT y modelos de Machine Learning. Implementamos cobertura de pruebas unitarias y de integración, validaciones estrictas de tipos y buenas prácticas de ingeniería.',
    deliverables: ['Código fuente documentado en Git', 'Pipelines CI/CD automatizados', 'Modelos predictivos entrenados y validados'],
    tag: 'Fase de Construcción',
  },
  {
    step: '04',
    phase: 'Validación, Certificación & Despliegue',
    title: 'Entrega controlada y monitoreo continuo',
    desc: 'Auditoría post-implementación, pruebas de carga y despliegue automatizado sin tiempo de inactividad. Entregamos sistemas vivos con dashboards de observabilidad y capacitación para que el cliente sea autónomo.',
    deliverables: [
      'Despliegue en producción con monitoreo',
      'Certificado de validación técnica',
      'Manuales operativos y transferencia técnica',
    ],
    tag: 'Fase Productiva',
  },
];

export const STACK_CATEGORIES = [
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    desc: 'Infraestructura resiliente, escalable y automatizada.',
    tools: [
      { name: 'Amazon Web Services (AWS)', role: 'ECS, Lambda, RDS, S3, Glue, CloudFront', level: 'Especialidad Principal' },
      { name: 'Docker & Contenedores', role: 'Microservicios reproducibles y portables', level: 'Estándar' },
      { name: 'CI/CD & GitHub Actions', role: 'Integración continua y despliegues sin fricción', level: 'Estándar' },
      { name: 'Terraform / IaC', role: 'Infraestructura declarativa auditable como código', level: 'Avanzado' },
    ],
  },
  {
    id: 'data',
    name: 'Ciencia de Datos & IA',
    desc: 'Pipelines analíticos, machine learning y modelos inteligentes.',
    tools: [
      { name: 'Python', role: 'Pandas, NumPy, Scipy, Polars para procesamiento masivo', level: 'Core' },
      { name: 'Machine Learning', role: 'Scikit-learn, XGBoost, LightGBM para analítica predictiva', level: 'Core' },
      { name: 'IA Generativa & LLMs', role: 'Integración de modelos fundacionales, RAG y agentes', level: 'Avanzado' },
      { name: 'Apache Airflow / Orchestration', role: 'Programación y monitoreo de DAGs y flujos ETL', level: 'Avanzado' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend & Bases de Datos',
    desc: 'Motores transaccionales de alto rendimiento y APIs seguras.',
    tools: [
      { name: 'PostgreSQL', role: 'Postgres 16+, optimización de queries, RLS y extensiones', level: 'Core' },
      { name: 'FastAPI & Node.js', role: 'APIs REST y GraphQL asíncronas de baja latencia', level: 'Core' },
      { name: 'Supabase', role: 'Backend serverless, Auth, Realtime y Storage corporativo', level: 'Especialidad' },
      { name: 'Redis', role: 'Caché en memoria, colas y limitación de tasa', level: 'Avanzado' },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend & Visualización',
    desc: 'Interfaces ejecutivas intuitivas, reactivas y accesibles.',
    tools: [
      { name: 'React & TypeScript', role: 'Aplicaciones SPA/SSR con tipado estricto y componentes modulares', level: 'Core' },
      { name: 'Vite & Next.js', role: 'Tooling de alto rendimiento y carga ultrarrápida', level: 'Core' },
      { name: 'Plotly / D3 / Chart.js', role: 'Visualización de datos interactiva para toma de decisiones', level: 'Avanzado' },
      { name: 'Design Systems & CSS Semántico', role: 'Interfaces limpias con identidad de marca premium', level: 'Core' },
    ],
  },
  {
    id: 'audit',
    name: 'Auditoría & Seguridad',
    desc: 'Garantía de calidad, trazabilidad y cumplimiento estricto.',
    tools: [
      { name: 'Auditoría de Datos', role: 'Validación de integridad, detección de anomalías y consistencia', level: 'Especialidad' },
      { name: 'Seguridad & RLS', role: 'Políticas de acceso a nivel de fila, cifrado y JWT', level: 'Estándar' },
      { name: 'Observabilidad & Logs', role: 'Monitoreo de latencia, errores y trazas en tiempo real', level: 'Avanzado' },
      { name: 'Testing Automatizado', role: 'Vitest, Jest, Playwright para cobertura E2E y unitaria', level: 'Estándar' },
    ],
  },
];

export const PILLARS_DETAIL = [
  {
    id: 'auditoria',
    number: '01',
    title: 'Auditoría Técnica y de Datos',
    tagline: 'Garantía de precisión, seguridad y consistencia en sistemas críticos.',
    shortDesc:
      'Evaluamos de forma independiente la integridad de tus datos, la robustez de tus sistemas y el cumplimiento de estándares de seguridad y arquitectura.',
    color: 'var(--terracotta)',
    services: [
      {
        name: 'Auditoría de Calidad e Integridad de Datos',
        desc: 'Revisión exhaustiva de bases de datos, detección de duplicados, datos huérfanos, inconsistencias de tipos y brechas de validación.',
        timeline: '2 a 4 semanas',
      },
      {
        name: 'Auditoría de Sistemas y Arquitectura Cloud',
        desc: 'Evaluación de seguridad, costos, rendimiento, deuda técnica y resiliencia de infraestructuras en la nube.',
        timeline: '3 a 5 semanas',
      },
      {
        name: 'Auditoría de Procesos y Cumplimiento Normativo',
        desc: 'Verificación de trazabilidad, gobernanza de datos y políticas de acceso para preparación de certificaciones e inspecciones.',
        timeline: '3 a 6 semanas',
      },
    ],
    deliverables: ['Dictamen técnico de auditoría', 'Informe de vulnerabilidades con criticidad', 'Matriz de correcciones inmediatas'],
  },
  {
    id: 'desarrollo',
    number: '02',
    title: 'Desarrollo Tecnológico & Cloud',
    tagline: 'Software a medida, arquitectura en la nube y plataformas empresariales.',
    shortDesc:
      'Diseñamos y construimos aplicaciones web de alto rendimiento, microservicios e infraestructura escalable pensada para perdurar.',
    color: 'var(--ochre)',
    services: [
      {
        name: 'Arquitectura Cloud & Pipelines en AWS',
        desc: 'Diseño e implementación de infraestructura en la nube moderna, optimización de costos y pipelines de automatización continua.',
        timeline: '4 a 8 semanas',
      },
      {
        name: 'Desarrollo de Software & Plataformas Web a Medida',
        desc: 'Sistemas empresariales, portales corporativos y aplicaciones web de alto impacto con React, Node y PostgreSQL.',
        timeline: '6 a 12 semanas',
      },
      {
        name: 'Modernización de Sistemas e Integración de APIs',
        desc: 'Migración de sistemas legados, refactorización arquitectónica y conexión de plataformas mediante APIs seguras.',
        timeline: '4 a 10 semanas',
      },
    ],
    deliverables: ['Plataforma operativa en producción', 'Código fuente probado y documentado', 'Infraestructura aprovisionada en la nube'],
  },
  {
    id: 'datos',
    number: '03',
    title: 'Ciencia de Datos & Inteligencia Artificial',
    tagline: 'Analítica avanzada, machine learning y modelos predictivos para decisión estratégica.',
    shortDesc:
      'Transformamos datos dispersos en modelos de decisión automatizados, analítica predictiva y dashboards ejecutivos en tiempo real.',
    color: 'var(--gold)',
    services: [
      {
        name: 'Modelos Predictivos & Machine Learning',
        desc: 'Diseño, entrenamiento y despliegue de modelos de clasificación, regresión, series temporales y optimización matemática.',
        timeline: '4 a 8 semanas',
      },
      {
        name: 'Integración de IA Generativa & Agentes Inteligentes',
        desc: 'Desarrollo de asistentes inteligentes, extracción documental automatizada y sistemas RAG conectados a tus bases de conocimiento.',
        timeline: '3 a 6 semanas',
      },
      {
        name: 'Dashboards Ejecutivos & Visualización de Datos',
        desc: 'Interfaces analíticas interactivas en tiempo real para directivos y equipos operativos con métricas clave unificadas.',
        timeline: '3 a 5 semanas',
      },
    ],
    deliverables: ['Modelos calibrados y desplegados', 'Dashboards ejecutivos interactivos', 'Pipelines de inferencia en tiempo real'],
  },
];
