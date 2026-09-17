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

export const DIRECTORS = [
  {
    id: 'auditor-director',
    number: '01',
    role: 'Lead Technical Auditor & Data Strategist',
    englishRole: 'Lead Auditor & Data Strategist',
    pillar: 'Pilar 01 — Technical & Data Auditing',
    tag: 'FORENSIC INTEGRITY & GOVERNANCE',
    subtitle: 'Operational truth assurance, regulatory compliance, and relational database diagnosis.',
    desc: 'Leads independent technical audit mandates, database structural integrity diagnostics, business rule validation, and perimeter security to eliminate mission-critical risks and data corruption.',
    credentials: [
      '10+ years in critical systems and database audit',
      'Expert in PostgreSQL, SQL Server & RLS',
      'Data Governance & Regulatory Compliance',
    ],
    quote: 'Data integrity is never an assumption of faith: it is audited and proven mathematically across every table and transaction.',
    accent: 'var(--terracotta)',
  },
  {
    id: 'cloud-director',
    number: '02',
    role: 'Cloud & DevOps Principal Architect',
    englishRole: 'Cloud & DevOps Architect',
    pillar: 'Pilar 02 — Cloud Systems & Development',
    tag: 'AWS ENTERPRISE ARCHITECTURE',
    subtitle: 'High-availability cloud engineering, fault-tolerant infrastructure, and financial cost optimization.',
    desc: 'Architects and deploys Infrastructure as Code (IaC) on AWS (ECS Fargate, RDS Multi-AZ, Lambda, isolated VPCs), automated CI/CD pipelines, and Zero-Trust policies for high-throughput enterprise systems.',
    credentials: [
      'AWS Certified Solutions Architect',
      'Infrastructure as Code (Terraform / CDK)',
      'Zero-Downtime Multi-AZ Containerization',
    ],
    quote: 'A resilient enterprise cloud does not depend on luck, but on reproducible, immutable infrastructure.',
    accent: 'var(--gold)',
  },
  {
    id: 'data-science-director',
    number: '03',
    role: 'Senior Data Scientist & AI Director',
    englishRole: 'Senior Data Scientist',
    pillar: 'Pilar 03 — Data Science & AI',
    tag: 'MACHINE LEARNING & PREDICTIVE MODELS',
    subtitle: 'Advanced statistical modeling, operational forecasting, and autonomous AI agent orchestration.',
    desc: 'Leads production machine learning architectures, reproducible MLOps pipelines, statistical anomaly detection, and AI agents strictly grounded in verifiable business ROI.',
    credentials: [
      'MSc in Applied AI & Statistical Modeling',
      'MLOps Pipelines (Python, PyTorch, Airflow)',
      'Predictive Systems & Autonomous Agents',
    ],
    quote: 'Applied AI only holds value when delivering measurable operational impact and zero black-box opacity.',
    accent: 'var(--ochre)',
  },
  {
    id: 'software-director',
    number: '04',
    role: 'Principal Full-Stack & Platforms Engineer',
    englishRole: 'Full-Stack Engineer',
    pillar: 'Pilar 02 — Software Engineering',
    tag: 'REACTIVE PLATFORMS & APIS',
    subtitle: 'Custom high-performance web applications, reactive user interfaces, and resilient API gateways.',
    desc: 'Specialist in high-concurrency frontend and backend architectures, resilient REST/GraphQL API design, event-driven distributed systems, and enterprise portals adhering to WCAG 2.1 AA accessibility.',
    credentials: ['Distributed Systems Architecture', 'React, Node.js, TypeScript & Next.js', 'AppSec Hardening & WCAG 2.1 AA Standards'],
    quote: 'Clean, well-engineered code accelerates today’s velocity while guaranteeing technological sovereignty tomorrow.',
    accent: 'var(--terracotta)',
  },
];

export const TRUST_BADGES = [
  {
    title: 'Response Commitment',
    detail: '< 24 business hours (UTC-5 / US Eastern)',
    icon: '⏱',
  },
  {
    title: 'Confidentiality Protocol',
    detail: 'Mutual NDA executed prior to architecture or data disclosure',
    icon: '🛡',
  },
  {
    title: 'Direct Senior Review',
    detail: 'Direct collaboration with Lead Architects & Senior Auditors',
    icon: '⚖',
  },
];

export const AUTH_CONTENT = {
  loginTitle: 'Sign in',
  loginSubtitle: 'Secure client portal for technical project tracking, audit reports, and deliverables.',
  emailPlaceholder: 'your.email@company.com',
  passwordPlaceholder: 'Password',
  signInBtn: 'Sign in',
  signingInBtn: 'Signing in...',
  noAccountPrompt: "Don't have an account?",
  createAccountLink: 'Create an account',
  registerTitle: 'Create account',
  registerSubtitle: 'Secure client portal for technical project tracking, audit reports, and deliverables.',
  registerIntro: 'Register your corporate account to access technical project milestones, architecture tracking, and deliverables.',
  fullNamePlaceholder: 'Full name',
  workEmailPlaceholder: 'work.email@company.com',
  taxIdLabel: 'Tax ID / Company Reg. Number (or Peruvian RUC)',
  taxIdPlaceholder: 'e.g. US EIN, VAT ID or 11-digit RUC',
  createAccountBtn: 'Create account',
  creatingAccountBtn: 'Creating account...',
  alreadyHaveAccountPrompt: 'Already have an account?',
  signInLink: 'Sign in',
  invalidCredentialsError: 'Invalid email or password.',
  genericAuthError: 'Could not complete authentication. Please try again.',
  complianceNote:
    'Peruvian Banking Compliance: Domestic billing operates via direct bank transfers in PEN (BCP, Interbank, BBVA). For international corporate entities, institutional wire transfers (SWIFT) or MSA arrangements apply.',
};

export const ACCOUNT_CONTENT = {
  portalBadge: 'EXCLUSIVE CLIENT PORTAL',
  portalTitle: 'Technical Tracking & Deliverables',
  activeSession: 'Active session:',
  signOut: 'Sign out',
  consultantPanelLink: 'Staff Panel →',
  tabs: {
    projects: 'My Projects & Milestones',
    billing: 'Invoicing & Bank Accounts',
    support: 'Technical Support',
  },
  projects: {
    loading: 'Loading technical project data...',
    syncError: 'Error synchronizing projects:',
    noProjectsTitle: 'No active projects assigned yet',
    noProjectsDesc:
      'If you have already submitted a proposal request or TDR scope, our engineering team will activate your timeline and deliverables once validated.',
    requestNewProjectBtn: 'Request New Project or Audit →',
    pillarLabels: {
      auditoria: '01. Technical & Data Auditing',
      desarrollo: '02. Cloud Architecture & AWS',
      datos: '03. Applied Data Science & AI',
      integral: 'Comprehensive Solution',
    },
    deliverablesTitle: 'Tangible Deliverables & Technical Reports',
    generateExecutiveSummary: 'Generate Executive Summary (Markdown)',
    downloadReport: 'Download Report',
    openDashboard: 'Open Dashboard',
    viewRepo: 'View Repository',
    downloadDataset: 'Download Dataset',
    viewDoc: 'View Document',
  },
  support: {
    badge: 'DIRECT MESSAGING CHANNEL',
    title: 'Technical Support & Tech Lead Channels',
    desc: (count) =>
      `You have ${count} active project(s) in progress. For urgent requirements, milestone inquiries, or deliverable coordination, reach out directly to our engineering lead.`,
    whatsappTitle: 'Technical On-Duty WhatsApp',
    whatsappSla: 'Average response under 30 minutes during business hours.',
    whatsappBtn: '💬 Open Direct WhatsApp',
    emailTitle: 'Lead Architect Direct Email',
    emailSla: 'Formal technical queries, scope amendments, or deliverable reviews.',
    emailBtn: '✉ Send Email to Engineering',
  },
  billing: {
    officialAccountsTitle: '1. Official Inmerge Bank Accounts (Direct Bank Transfers)',
    officialAccountsDesc:
      'Exclusive payment method: direct bank transfer to institutional accounts in PEN. Each order requires verification.',
    internationalNoticeTitle: 'INTERNATIONAL CORPORATE CLIENTS',
    internationalNoticeDesc:
      'For international organizations operating outside Peru, payments can be structured via institutional wire transfer (SWIFT) or corporate Master Service Agreements (MSA) in USD/EUR upon coordination.',
    legalEntityTitle: '2. Billing & Fiscal Information',
    legalNameLabel: 'Company / Organization Legal Name',
    taxIdLabel: 'Tax ID / EIN / VAT / RUC',
    billingAddressLabel: 'Registered Address',
    billingEmailLabel: 'Invoicing Email',
    saveBtn: 'Save Billing Details',
    savingBtn: 'Saving...',
    ordersTitle: '3. Order History & Bank Transfer Receipts',
    noOrders: 'No orders or invoices registered for this account.',
  },
};
