import { useLanguage } from '../context/LanguageContext';

export default function ProjectSocialProof() {
  const { isEn } = useLanguage();

  const metrics = [
    {
      value: '99.99%',
      label: isEn ? 'OPERATIONAL SLA UPTIME' : 'DISPONIBILIDAD OPERATIVA SLA',
      detail: isEn ? 'Guaranteed Cloud Systems Architecture' : 'Arquitectura Cloud Certificada en AWS/GCP',
    },
    {
      value: '< 0.8s',
      label: isEn ? 'CORE WEB VITALS (LCP)' : 'TIEMPO DE CARGA CORE WEB VITALS',
      detail: isEn ? 'Zero-bloat React 18 / Vite Engine' : 'Motor React 18 / Vite con 0 kB Deuda Técnica',
    },
    {
      value: '100%',
      label: isEn ? 'AUDITABLE SOURCE CODE' : 'CÓDIGO FUENTE AUDITABLE',
      detail: isEn ? 'Strict Git Repository & Documented Specs' : 'Repositorios Git + Documentación de Arquitectura',
    },
    {
      value: '0 dB',
      label: isEn ? 'ZERO VISUAL BLOAT' : 'DISEÑO EDITORIAL LIMPIO',
      detail: isEn ? 'WCAG 2.1 AA Compliant Interface' : 'Accesibilidad Universal y Lienzo Continuo Arena',
    },
  ];

  return (
    <section
      className="project-social-proof-section"
      aria-label={isEn ? 'Social Proof & Engineering Guarantees' : 'Prueba Social y Garantías de Ingeniería'}
    >
      <div className="social-proof-header">
        <span className="social-proof-tag">[ INMERGE · SLA & QUALITY COMMITMENTS ]</span>
        <h3 className="social-proof-headline">
          {isEn ? 'Engineering Precision Grounded in Measurable Metrics' : 'Ingeniería de Software Fundamentada en Métricas Auditables'}
        </h3>
      </div>

      <div className="social-proof-metrics-grid">
        {metrics.map((m, idx) => (
          <div key={idx} className="social-metric-card">
            <span className="metric-big-num">{m.value}</span>
            <span className="metric-title-label">{m.label}</span>
            <p className="metric-detail-desc">{m.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
