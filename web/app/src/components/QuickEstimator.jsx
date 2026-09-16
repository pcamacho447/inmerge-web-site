import { useState, useId } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { waLink } from '../data/content';

export default function QuickEstimator({ initialPillar = 'auditoria', initialProject = null, onOpenLLMAssistant }) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [pillar, setPillar] = useState(initialProject ? initialProject.pillarId : initialPillar);
  const [scope, setScope] = useState('estandar');
  const [volume, setVolume] = useState('corporativo');

  const pilarIdSelect = useId();
  const scopeIdSelect = useId();
  const volumeIdSelect = useId();

  // Calculation Matrix based on Inmerge's rapid boutique model
  const calculateEstimate = () => {
    let daysMin = 5;
    let daysMax = 10;
    let penMin = 3500;
    let penMax = 6500;
    let usdMin = 950;
    let usdMax = 1750;
    let deliverables = [];

    if (pillar === 'auditoria') {
      if (scope === 'rapido') {
        daysMin = 3;
        daysMax = 5;
        penMin = 2800;
        penMax = 4500;
        usdMin = 750;
        usdMax = 1200;
        deliverables = isEn
          ? ['Forensic integrity diagnostic', 'Executive gap report', 'Immediate remediation script']
          : ['Diagnóstico forense de integridad', 'Informe ejecutivo de vulnerabilidades', 'Script de remediación inmediata'];
      } else if (scope === 'estandar') {
        daysMin = 7;
        daysMax = 12;
        penMin = 4800;
        penMax = 8500;
        usdMin = 1300;
        usdMax = 2300;
        deliverables = isEn
          ? ['Full database & schema sanitization', 'AWS/GCP security & IAM audit', 'Zero-data-loss validation test suite', 'Architecture sign-off report']
          : ['Saneamiento integral de esquema y datos', 'Auditoría de seguridad e IAM en AWS/GCP', 'Suite de pruebas de no-regresión', 'Dictamen técnico formal firmado'];
      } else {
        daysMin = 14;
        daysMax = 21;
        penMin = 9000;
        penMax = 16000;
        usdMin = 2400;
        usdMax = 4300;
        deliverables = isEn
          ? ['Multi-system end-to-end audit', 'Compliance certification (ISO/SBS/GDPR)', 'Automated continuous data quality pipeline', 'Executive board presentation']
          : ['Auditoría E2E multisistema', 'Certificación de cumplimiento normativo', 'Pipeline automatizado de calidad continua', 'Presentación ejecutiva a Directorio'];
      }
    } else if (pillar === 'desarrollo') {
      if (scope === 'rapido') {
        daysMin = 5;
        daysMax = 8;
        penMin = 3800;
        penMax = 6000;
        usdMin = 1000;
        usdMax = 1600;
        deliverables = isEn
          ? ['REST API or targeted microservice', 'Docker container & CI/CD pipeline', 'Unit test coverage > 90%']
          : ['API REST o microservicio puntual', 'Contenedor Docker y pipeline CI/CD', 'Cobertura de pruebas unitarias > 90%'];
      } else if (scope === 'estandar') {
        daysMin = 10;
        daysMax = 15;
        penMin = 7500;
        penMax = 13000;
        usdMin = 2000;
        usdMax = 3500;
        deliverables = isEn
          ? ['Full bespoke web application / portal', 'AWS ECS Fargate architecture', 'Database schema & migration scripts', 'Role-based access control (RBAC)']
          : ['Aplicación web / portal a medida', 'Arquitectura AWS ECS Fargate', 'Esquema de BD y scripts de migración', 'Control de acceso por roles (RBAC)'];
      } else {
        daysMin = 18;
        daysMax = 28;
        penMin = 14000;
        penMax = 24000;
        usdMin = 3800;
        usdMax = 6500;
        deliverables = isEn
          ? ['Enterprise multi-tenant platform', 'Distributed microservices architecture', 'Automated billing & ERP integrations', '30-day post-rollout technical warranty']
          : ['Plataforma multi-tenant empresarial', 'Arquitectura distribuida de microservicios', 'Integración con ERPs y facturación', 'Garantía técnica de 30 días post-despliegue'];
      }
    } else {
      // datos
      if (scope === 'rapido') {
        daysMin = 4;
        daysMax = 7;
        penMin = 3200;
        penMax = 5500;
        usdMin = 850;
        usdMax = 1500;
        deliverables = isEn
          ? ['Interactive Executive Realtime Dashboard', 'Automated ETL data ingestion pipeline', 'KPI metric documentation']
          : ['Dashboard Ejecutivo en Tiempo Real', 'Pipeline automatizado de ingesta ETL', 'Documentación de métricas y KPIs'];
      } else if (scope === 'estandar') {
        daysMin = 8;
        daysMax = 14;
        penMin = 6500;
        penMax = 11500;
        usdMin = 1750;
        usdMax = 3100;
        deliverables = isEn
          ? ['Specialized RAG Agent or ML Model', 'Vector database setup (pgvector)', 'Auditable citation & zero-hallucination layer', 'Production REST endpoint']
          : ['Agente RAG especializado o Modelo ML', 'Configuración de base vectorial (pgvector)', 'Capa de citas auditables sin alucinaciones', 'Endpoint REST para producción'];
      } else {
        daysMin = 15;
        daysMax = 25;
        penMin = 12500;
        penMax = 22000;
        usdMin = 3400;
        usdMax = 5900;
        deliverables = isEn
          ? ['End-to-End Enterprise ML/AI Platform', 'Predictive demand / churn engine', 'Automated model retraining pipeline', 'Comprehensive stakeholder training']
          : ['Plataforma integral de IA / ML Empresarial', 'Motor predictivo de demanda / scoring', 'Pipeline de reentrenamiento continuo', 'Capacitación técnica y operativa'];
      }
    }

    // Volume adjustments
    if (volume === 'enterprise') {
      penMin = Math.round(penMin * 1.25);
      penMax = Math.round(penMax * 1.25);
      usdMin = Math.round(usdMin * 1.25);
      usdMax = Math.round(usdMax * 1.25);
    } else if (volume === 'pyme') {
      penMin = Math.round(penMin * 0.85);
      penMax = Math.round(penMax * 0.85);
      usdMin = Math.round(usdMin * 0.85);
      usdMax = Math.round(usdMax * 0.85);
    }

    return { daysMin, daysMax, penMin, penMax, usdMin, usdMax, deliverables };
  };

  const estimate = calculateEstimate();

  const getPillarName = () => {
    if (pillar === 'auditoria') return isEn ? 'Audit & Data Quality' : 'Auditoría Técnica y de Datos';
    if (pillar === 'desarrollo') return isEn ? 'Cloud Architecture & Dev' : 'Desarrollo Tecnológico & Cloud';
    return isEn ? 'Data Science & AI' : 'Ciencia de Datos & IA';
  };

  const formattedWhatsAppMsg = isEn
    ? `Hello Inmerge, I used your online project estimator for "${getPillarName()}" (Scope: ${scope}, Target: ${volume}). Estimated timeline: ${estimate.daysMin}-${estimate.daysMax} days. I would like to confirm technical feasibility.`
    : `Hola Inmerge, utilicé su cotizador en línea para "${getPillarName()}" (Alcance: ${scope}, Volumen: ${volume}). Estimación calculada: ${estimate.daysMin}-${estimate.daysMax} días hábiles (S/ ${estimate.penMin.toLocaleString()} - S/ ${estimate.penMax.toLocaleString()}). Deseo coordinar la revisión técnica.`;

  return (
    <section className="quick-estimator-section" aria-label={isEn ? 'Fast Project Estimator' : 'Cotizador Ágil de Proyectos'}>
      <div className="estimator-card">
        <div className="estimator-header">
          <span className="estimator-badge">
            {isEn ? 'TRANSPARENT & FAST PRICING' : 'PRECIOS Y TIEMPOS TRANSPARENTES'}
          </span>
          <h2 className="estimator-title">
            {isEn ? 'Estimate Your Project in 30 Seconds' : 'Estima tu Proyecto en 30 Segundos'}
          </h2>
          <p className="estimator-subtitle">
            {isEn
              ? 'Calculate realistic sprints, deliverable milestones, and cost-effective investment ranges for Inmerge senior engineering.'
              : 'Proyecta tiempos reales en sprints de 1 a 2 semanas, entregables auditables y costos competitivos sin sobrecostos de agencias tradicionales.'}
          </p>
        </div>

        <div className="estimator-layout-grid">
          {/* Controls Column */}
          <div className="estimator-controls-col">
            {/* Pillar Selector */}
            <div className="control-group">
              <label htmlFor={pilarIdSelect} className="control-label">
                1. {isEn ? 'Strategic Pillar:' : 'Pilar Estratégico:'}
              </label>
              <select
                id={pilarIdSelect}
                className="estimator-select"
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
              >
                <option value="auditoria">
                  {isEn ? 'Pillar 01 — Technical & Data Audit' : 'Pilar 01 — Auditoría Técnica y de Datos'}
                </option>
                <option value="desarrollo">
                  {isEn ? 'Pillar 02 — Cloud Architecture & Software Dev' : 'Pilar 02 — Desarrollo Tecnológico & Cloud'}
                </option>
                <option value="datos">
                  {isEn ? 'Pillar 03 — Data Science & Enterprise AI' : 'Pilar 03 — Ciencia de Datos & IA'}
                </option>
              </select>
            </div>

            {/* Scope / Complexity Selector */}
            <div className="control-group">
              <label htmlFor={scopeIdSelect} className="control-label">
                2. {isEn ? 'Project Scope & Depth:' : 'Alcance y Complejidad:'}
              </label>
              <select
                id={scopeIdSelect}
                className="estimator-select"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="rapido">
                  {isEn ? 'Quickstart / Diagnostic (1 Rapid Sprint)' : 'Quickstart / Diagnóstico Rápido (1 Sprint)'}
                </option>
                <option value="estandar">
                  {isEn ? 'Standard Enterprise Solution (2 Sprints)' : 'Solución Estándar Completa (2 Sprints)'}
                </option>
                <option value="integral">
                  {isEn ? 'Comprehensive Multi-System Overhaul (3-4 Sprints)' : 'Transformación Integral Multisistema (3-4 Sprints)'}
                </option>
              </select>
            </div>

            {/* Target Volume */}
            <div className="control-group">
              <label htmlFor={volumeIdSelect} className="control-label">
                3. {isEn ? 'Data Volume / Infrastructure Size:' : 'Volumen de Datos o Infraestructura:'}
              </label>
              <select
                id={volumeIdSelect}
                className="estimator-select"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              >
                <option value="pyme">
                  {isEn ? 'Standard (< 1M records / Single Service)' : 'Estándar (< 1M registros / Servicio Único)'}
                </option>
                <option value="corporativo">
                  {isEn ? 'Corporate (1M - 20M records / Multi-Services)' : 'Corporativo (1M - 20M registros / Microservicios)'}
                </option>
                <option value="enterprise">
                  {isEn ? 'High-Scale Enterprise (> 20M records / Cloud Multi-Account)' : 'Alta Escala (> 20M registros / Multi-Cuenta Cloud)'}
                </option>
              </select>
            </div>
          </div>

          {/* Results Column */}
          <div className="estimator-results-col" aria-live="polite">
            <div className="results-summary-card">
              <div className="results-badge-row">
                <span className="res-badge-pillar">{getPillarName()}</span>
                <span className="res-badge-model">{isEn ? 'Direct Senior Engineering' : 'Trato Directo con Ingenieros'}</span>
              </div>

              {/* Time and Price Metrics */}
              <div className="results-key-metrics">
                <div className="res-metric-item">
                  <span className="res-metric-label">{isEn ? 'Estimated Timeline' : 'Tiempo Estimado de Entrega'}</span>
                  <span className="res-metric-val">
                    {estimate.daysMin} – {estimate.daysMax} {isEn ? 'business days' : 'días hábiles'}
                  </span>
                </div>

                <div className="res-metric-item">
                  <span className="res-metric-label">{isEn ? 'Estimated Investment (PEN)' : 'Rango Estimado (PEN)'}</span>
                  <span className="res-metric-val highlight-val">
                    S/ {estimate.penMin.toLocaleString()} – S/ {estimate.penMax.toLocaleString()}
                  </span>
                </div>

                <div className="res-metric-item">
                  <span className="res-metric-label">{isEn ? 'Global Clients (USD)' : 'Clientes Internacionales (USD)'}</span>
                  <span className="res-metric-val">
                    ${estimate.usdMin.toLocaleString()} – ${estimate.usdMax.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div className="results-deliverables">
                <span className="deliverables-title">
                  {isEn ? 'Included Auditable Deliverables:' : 'Entregables Auditables Incluidos:'}
                </span>
                <ul className="deliverables-list">
                  {estimate.deliverables.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="results-actions">
                <a
                  href={waLink(formattedWhatsAppMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-estimator-wa"
                >
                  {isEn ? 'Confirm via WhatsApp →' : 'Confirmar Factibilidad por WhatsApp →'}
                </a>

                {onOpenLLMAssistant && (
                  <button
                    type="button"
                    className="btn-estimator-llm"
                    onClick={() =>
                      onOpenLLMAssistant({
                        pillar,
                        pillarName: getPillarName(),
                        scope,
                        volume,
                        estimate,
                      })
                    }
                  >
                    {isEn ? 'Consult with LLM Assistant 💬' : 'Consultar con Asistente LLM 💬'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
