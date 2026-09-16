export const WA_LINK = 'https://wa.me/51957251279';

// Prefilled WhatsApp message per CTA context in English
export function waLink(message) {
  return message ? `${WA_LINK}?text=${encodeURIComponent(message)}` : WA_LINK;
}

export const SITE_URL = 'https://inmerge.pe';

export const NAV_LINKS = [
  { to: '/en', label: 'Home' },
  { to: '/en/services', label: 'Services' },
  { to: '/en/about', label: 'About Us' },
  { to: '/en/contact', label: 'Contact' },
];

export function waVoucherMessage(order) {
  return `Hello, I transferred payment for order ${order.code}. Attaching receipt.`;
}

export const VALUES = [
  { name: 'Rigor & Traceability', desc: 'Every pipeline, query, and algorithmic output is fully auditable, reproducible, and verifiable.' },
  {
    name: 'Robust Engineering',
    desc: 'We engineer resilient, zero-debt systems founded on modern cloud architecture and automated testing.',
  },
  { name: 'Applied Intelligence', desc: 'We deploy machine learning and predictive AI targeted strictly at measurable business ROI.' },
  {
    name: 'Client Autonomy',
    desc: 'We transfer complete code, architecture blueprints, and knowledge so your teams operate independently.',
  },
];

export const PILLARS = [
  {
    id: 'auditoria',
    number: '01',
    title: 'Technical & Data Auditing',
    subtitle: 'Data integrity assurance, security posture & compliance',
    desc: 'Independent assessment of enterprise databases, data quality, systems architecture, and cloud security to mitigate mission-critical risks.',
    tag: 'Auditing & Quality',
    badge: 'Diagnostic & Certification',
  },
  {
    id: 'desarrollo',
    number: '02',
    title: 'Cloud Development & Architecture',
    subtitle: 'Custom enterprise software, AWS architecture & platforms',
    desc: 'Design and engineering of scalable web applications, microservices, and resilient cloud infrastructure built to tier-1 standards.',
    tag: 'Software Engineering',
    badge: 'Architecture & Code',
  },
  {
    id: 'datos',
    number: '03',
    title: 'Applied Data Science & Artificial Intelligence',
    subtitle: 'Predictive models, advanced analytics & real-time dashboards',
    desc: 'Production-grade machine learning, intelligent pipelines, and executive telemetry to turn complex data into decisive competitive advantage.',
    tag: 'Analytics & Machine Learning',
    badge: 'AI & Predictive Modeling',
  },
];

export const SERVICES = [
  {
    number: '01',
    pillarId: 'auditoria',
    pillarName: 'Technical Auditing',
    name: 'Data Quality & Integrity Auditing',
    line: 'Exhaustive diagnostic of data consistency, anomalies, and business rule adherence.',
    timeline: '2 to 4 weeks',
    problem:
      'Organizations operate on fragmented, duplicate, or unvalidated data stores, producing erroneous board reports and financial losses.',
    value: 'A formal technical audit opinion accompanied by a reproducible remediation matrix with guaranteed verification proofs.',
    deliverables: ['Data source profiling & schema inventory', 'Inconsistency & gap diagnostic report', 'Actionable remediation roadmap'],
  },
  {
    number: '02',
    pillarId: 'auditoria',
    pillarName: 'Technical Auditing',
    name: 'Cloud Systems & Infrastructure Security Audit',
    line: 'Rigorous assessment of AWS/GCP architecture, security vulnerabilities, and spend optimization.',
    timeline: '3 to 5 weeks',
    problem: 'Opaque cloud architectures, misconfigured IAM permissions, and runaway infrastructure costs without telemetry.',
    value: 'Discovery of critical attack surfaces, immediate cloud budget optimization, and alignment with CIS benchmarks.',
    deliverables: ['Security posture & IAM assessment', 'AWS/GCP cost optimization matrix', 'Architectural remediation blueprints'],
  },
  {
    number: '03',
    pillarId: 'desarrollo',
    pillarName: 'Cloud Development',
    name: 'Cloud Architecture & Data Pipelines (AWS)',
    line: 'Serverless infrastructure, microservices, containerization, and data streaming.',
    timeline: '4 to 8 weeks',
    problem: 'Fragile legacy setups and brittle manual scripts that break under peak demand or enterprise integration.',
    value: 'Resilient cloud architecture on AWS (ECS, Lambda, RDS, S3) engineered for high availability and automated deployments.',
    deliverables: ['Infrastructure as Code (Terraform/IaC)', 'Automated ETL/ELT pipelines', 'Operational playbooks & architecture specs'],
  },
  {
    number: '04',
    pillarId: 'desarrollo',
    pillarName: 'Cloud Development',
    name: 'Custom Enterprise Software & Web Platforms',
    line: 'Mission-critical portals, responsive web platforms, and secure APIs.',
    timeline: '6 to 12 weeks',
    problem: 'Off-the-shelf software failing business requirements, or aging legacy platforms weighed down by technical debt.',
    value: 'Bespoke web applications built with React, Node/Python, and PostgreSQL, backed by comprehensive automated test suites.',
    deliverables: ['Production-ready web application', 'Automated test suite (unit + E2E)', 'Complete API documentation & specs'],
  },
  {
    number: '05',
    pillarId: 'datos',
    pillarName: 'Data Science & AI',
    name: 'Predictive Modeling & Applied Machine Learning',
    line: 'Automated scoring, classification, forecasting, and decision algorithms.',
    timeline: '4 to 8 weeks',
    problem: 'Executive decisions guided by intuition due to lack of models capable of anticipating market demand and customer behavior.',
    value: 'Statistically validated machine learning models engineered for real-time inference or batch scoring at enterprise scale.',
    deliverables: ['Calibrated & benchmarked ML model', 'Continuous retraining pipeline', 'Accuracy metrics & inference documentation'],
  },
  {
    number: '06',
    pillarId: 'datos',
    pillarName: 'Data Science & AI',
    name: 'Executive Dashboards & Live Telemetry',
    line: 'Interactive operational interfaces for high-level decision control.',
    timeline: '3 to 6 weeks',
    problem: 'C-suite executives waiting days for error-prone static spreadsheets and outdated reporting decks.',
    value: 'Sub-second, interactive web dashboards featuring role-based access control and live data streaming.',
    deliverables: ['Responsive executive web dashboard', 'Direct live database connections', 'Key stakeholder handover training'],
  },
];

export const SEGMENTS = [
  {
    name: 'Enterprises & Mid-Market Firms',
    quote: 'Architecture that scales smoothly and data that withstands board-level audit scrutiny.',
    line: 'Custom engineering, predictive modeling, and enterprise cloud infrastructure optimization.',
    bg: '#241A12',
    fg: '#F3EADA',
  },
  {
    name: 'Public Sector & Regulatory Entities',
    quote: 'Exhaustive traceability and verifiable compliance standards.',
    line: 'Systems auditing, fiscal database integrity assurance, and public transparency platforms.',
    bg: '#EBDFC9',
    fg: '#241A12',
  },
  {
    name: 'Scale-ups & Tech Companies',
    quote: 'Rapid feature velocity without compromising architecture or security.',
    line: 'Full-stack development, modern data engineering, and generative AI agent integration.',
    bg: '#A8472B',
    fg: '#F3EADA',
  },
];

export const MARQUEE_ITEMS = [
  'TECHNICAL AUDITING',
  'CLOUD ENGINEERING',
  'DATA SCIENCE',
  'MACHINE LEARNING',
  'AWS ARCHITECTURE',
  'DATA QUALITY ASSURANCE',
];

export const ROLES = [
  { name: 'Lead Auditor & Data Strategist', desc: 'Directs technical audit mandates, governance protocols, and data diagnostics.' },
  { name: 'Cloud & DevOps Architect', desc: 'Designs fault-tolerant cloud systems and automated pipelines on AWS.' },
  { name: 'Senior Data Scientist', desc: 'Statistical modeling, production machine learning, and AI agent integration.' },
  { name: 'Full-Stack Engineer', desc: 'Engineers high-performance web applications and resilient API platforms.' },
];
