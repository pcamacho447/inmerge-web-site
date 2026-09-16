// Inmerge Technology Stack, Tools, and Methodology (English)

export const METHODOLOGY_STEPS = [
  {
    step: '01',
    phase: 'Initial Audit & Technical Diagnostic',
    title: 'Exhaustive evaluation of existing systems',
    desc: 'Deep audit across data stores, schema consistency, cloud security, and technical debt. We isolate vulnerabilities, anomalies, and structural bottlenecks before writing a single line of production code.',
    deliverables: ['Technical audit opinion', 'Risk & data quality matrix', 'Prioritized engineering roadmap'],
    tag: 'Discovery Phase',
  },
  {
    step: '02',
    phase: 'Architecture & System Design',
    title: 'Robust modeling on modern cloud standards',
    desc: 'Designing decoupled architectures, idempotent data pipelines, and optimized relational schemas. We prioritize security-by-design, continuous observability, and horizontal scalability across AWS environments.',
    deliverables: ['Cloud architecture blueprints', 'API specifications & contracts', 'Relational data models'],
    tag: 'Structural Phase',
  },
  {
    step: '03',
    phase: 'Engineering, Development & Modeling',
    title: 'Precision construction with automated testing',
    desc: 'Agile development of enterprise platforms, ETL/ELT pipelines, and machine learning models. We enforce strict type validation, comprehensive unit & integration test coverage, and clean-code engineering.',
    deliverables: ['Documented source code in Git', 'Automated CI/CD pipelines', 'Trained & benchmarked ML models'],
    tag: 'Construction Phase',
  },
  {
    step: '04',
    phase: 'Validation, Certification & Deployment',
    title: 'Controlled delivery and continuous telemetry',
    desc: 'Post-implementation audit, stress testing, and zero-downtime automated release. We deliver production systems with real-time observability dashboards and full handover training for complete client autonomy.',
    deliverables: [
      'Production deployment with live telemetry',
      'Technical validation certificate',
      'Operations manual & knowledge transfer',
    ],
    tag: 'Production Phase',
  },
];

export const STACK_CATEGORIES = [
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    desc: 'Resilient, automated, and horizontally scalable cloud infrastructure.',
    tools: [
      { name: 'Amazon Web Services (AWS)', role: 'ECS, Lambda, RDS, S3, Glue, CloudFront', level: 'Primary Specialty' },
      { name: 'Docker & Containers', role: 'Reproducible and portable microservices', level: 'Standard' },
      { name: 'CI/CD & GitHub Actions', role: 'Frictionless continuous integration and deployment', level: 'Standard' },
      { name: 'Terraform / IaC', role: 'Declarative, auditable infrastructure as code', level: 'Advanced' },
    ],
  },
  {
    id: 'data',
    name: 'Data Science & AI',
    desc: 'Analytical pipelines, machine learning models, and applied intelligence.',
    tools: [
      { name: 'Python', role: 'Pandas, NumPy, Scipy, Polars for high-throughput computation', level: 'Core' },
      { name: 'Machine Learning', role: 'Scikit-learn, XGBoost, LightGBM for predictive analytics', level: 'Core' },
      { name: 'Generative AI & LLMs', role: 'Foundation model integration, RAG architectures, and agents', level: 'Advanced' },
      { name: 'Apache Airflow / Orchestration', role: 'DAG orchestration and resilient ETL workflows', level: 'Advanced' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend & Databases',
    desc: 'High-throughput transactional engines and secure API platforms.',
    tools: [
      { name: 'PostgreSQL', role: 'Postgres 16+, query optimization, RLS, and extensions', level: 'Core' },
      { name: 'FastAPI & Node.js', role: 'Low-latency asynchronous REST and GraphQL APIs', level: 'Core' },
      { name: 'Supabase', role: 'Serverless backend, Auth, Realtime, and enterprise Storage', level: 'Specialty' },
      { name: 'Redis', role: 'In-memory caching, distributed queues, and rate limiting', level: 'Advanced' },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend & Visualization',
    desc: 'Intuitive, accessible, and reactive executive web interfaces.',
    tools: [
      { name: 'React & TypeScript', role: 'Modular SPA/SSR architectures with strict type safety', level: 'Core' },
      { name: 'Vite & Next.js', role: 'High-performance tooling and sub-second page loads', level: 'Core' },
      { name: 'Plotly / D3 / Chart.js', role: 'Interactive data visualization for executive decision-making', level: 'Advanced' },
      { name: 'Design Systems & Semantic CSS', role: 'Refined interfaces with premium editorial brand identity', level: 'Core' },
    ],
  },
  {
    id: 'audit',
    name: 'Auditing & Security',
    desc: 'End-to-end quality assurance, traceability, and strict compliance.',
    tools: [
      { name: 'Data Auditing', role: 'Integrity verification, anomaly detection, and schema consistency', level: 'Specialty' },
      { name: 'Security & RLS', role: 'Row Level Security policies, end-to-end encryption, and JWTs', level: 'Standard' },
      { name: 'Observability & Logging', role: 'Real-time telemetry, latency profiling, and distributed tracing', level: 'Advanced' },
      { name: 'Automated Testing', role: 'Vitest, Jest, Playwright for full unit and E2E coverage', level: 'Standard' },
    ],
  },
];

export const PILLARS_DETAIL = [
  {
    id: 'auditoria',
    number: '01',
    title: 'Technical & Data Auditing',
    tagline: 'Guaranteed accuracy, security, and consistency across mission-critical systems.',
    shortDesc:
      'We conduct independent assessments of data integrity, system resilience, and compliance against strict security and architectural benchmarks.',
    color: 'var(--terracotta)',
    services: [
      {
        name: 'Data Quality & Integrity Audit',
        desc: 'Exhaustive examination of database stores, identifying duplicates, orphaned records, type inconsistencies, and validation gaps.',
        timeline: '2 to 4 weeks',
      },
      {
        name: 'Systems & Cloud Architecture Audit',
        desc: 'Evaluation of security postures, cloud spend, latency bottlenecks, technical debt, and infrastructure resilience.',
        timeline: '3 to 5 weeks',
      },
      {
        name: 'Process & Regulatory Compliance Audit',
        desc: 'Verification of data lineage, governance policies, and access controls in preparation for certifications and audits.',
        timeline: '3 to 6 weeks',
      },
    ],
    deliverables: ['Formal technical audit opinion', 'Vulnerability matrix with severity scoring', 'Immediate remediation playbook'],
  },
  {
    id: 'desarrollo',
    number: '02',
    title: 'Cloud Development & Architecture',
    tagline: 'Bespoke software engineering, cloud systems, and scalable platforms.',
    shortDesc:
      'We architect and build high-performance web applications, decoupled microservices, and resilient cloud backbones built to last.',
    color: 'var(--ochre)',
    services: [
      {
        name: 'Cloud Architecture & AWS Pipelines',
        desc: 'Design and deployment of modern cloud infrastructure, spend optimization, and continuous automation pipelines.',
        timeline: '4 to 8 weeks',
      },
      {
        name: 'Custom Enterprise Software & Web Platforms',
        desc: 'Bespoke corporate portals, internal software, and customer-facing web platforms built with React, Node, and PostgreSQL.',
        timeline: '6 to 12 weeks',
      },
      {
        name: 'Systems Modernization & API Integration',
        desc: 'Legacy system refactoring, architectural decoupling, and secure third-party platform integration.',
        timeline: '4 to 10 weeks',
      },
    ],
    deliverables: ['Production-ready live platform', 'Tested & documented source code', 'Provisioned cloud infrastructure (IaC)'],
  },
  {
    id: 'datos',
    number: '03',
    title: 'Applied Data Science & Artificial Intelligence',
    tagline: 'Predictive modeling, machine learning, and executive dashboards for strategic advantage.',
    shortDesc: 'We transform complex, siloed data into automated decision models, predictive analytics, and real-time executive telemetry.',
    color: 'var(--gold)',
    services: [
      {
        name: 'Predictive Modeling & Machine Learning',
        desc: 'Design, training, and production deployment of classification, forecasting, and mathematical optimization models.',
        timeline: '4 to 8 weeks',
      },
      {
        name: 'Generative AI & Intelligent Agents Integration',
        desc: 'Custom enterprise intelligent assistants, automated document extraction, and RAG systems linked to your knowledge base.',
        timeline: '3 to 6 weeks',
      },
      {
        name: 'Executive Dashboards & Live Telemetry',
        desc: 'Real-time interactive analytical interfaces for C-suite and engineering leaders with unified KPIs.',
        timeline: '3 to 5 weeks',
      },
    ],
    deliverables: ['Calibrated & deployed ML models', 'Interactive executive dashboards', 'Sub-second real-time inference pipelines'],
  },
];
