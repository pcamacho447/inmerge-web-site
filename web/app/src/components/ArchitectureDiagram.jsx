import { useLanguage } from '../context/LanguageContext.jsx';

export default function ArchitectureDiagram() {
  const { isEn } = useLanguage();

  return (
    <div
      style={{
        background: 'var(--ink)',
        color: '#F3EADA',
        padding: 'clamp(28px, 4vw, 48px)',
        border: '1px solid rgba(243, 234, 218, 0.15)',
        margin: '32px 0',
      }}
    >
      <div style={{ marginBottom: 28, borderBottom: '1px solid rgba(243, 234, 218, 0.15)', paddingBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)', letterSpacing: 2, marginBottom: 6 }}>
          {isEn ? 'FLOW ARCHITECTURE & AUDIT' : 'ARQUITECTURA DE FLUJO & AUDITORÍA'}
        </div>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 26px)', margin: 0, fontWeight: 700 }}>
          {isEn ? 'Engineering, Data Lifecycle & Technical Quality Assurance' : 'Ciclo de Ingeniería, Datos y Aseguramiento Técnico'}
        </h4>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          position: 'relative',
        }}
      >
        {/* Node 1: Fuentes & Auditoría */}
        <div
          style={{
            background: 'rgba(243, 234, 218, 0.05)',
            border: '1px solid rgba(216, 168, 78, 0.4)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', marginBottom: 8 }}>
            {isEn ? '01 / INGESTION & AUDITING' : '01 / INGESTIÓN & AUDITORÍA'}
          </span>
          <strong style={{ fontSize: 16, marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
            {isEn ? 'Sources & Profiling' : 'Fuentes & Perfilado'}
          </strong>
          <p style={{ fontSize: 13, color: 'rgba(243, 234, 218, 0.75)', margin: 0, lineHeight: 1.5 }}>
            {isEn
              ? 'Relational databases, external APIs, massive data lakes, and event logs. Pre-emptive auditing for integrity, duplicates, and business rules.'
              : 'Bases de datos relacionales, APIs, archivos masivos y logs. Auditoría previa de integridad, duplicados y reglas de negocio.'}
          </p>
        </div>

        {/* Node 2: Pipelines & Cloud */}
        <div
          style={{
            background: 'rgba(243, 234, 218, 0.05)',
            border: '1px solid rgba(168, 71, 43, 0.5)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--terracotta)', marginBottom: 8 }}>
            {isEn ? '02 / PIPELINES & CLOUD' : '02 / PIPELINES & CLOUD'}
          </span>
          <strong style={{ fontSize: 16, marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
            {isEn ? 'AWS & Processing' : 'AWS & Procesamiento'}
          </strong>
          <p style={{ fontSize: 13, color: 'rgba(243, 234, 218, 0.75)', margin: 0, lineHeight: 1.5 }}>
            {isEn
              ? 'Automated ETL/ELT pipelines (Airflow/Glue), high-throughput transformations with Python/Polars, and resilient storage in PostgreSQL/S3.'
              : 'Pipelines ETL/ELT automatizados (Airflow/Glue), transformación con Python/Polars y almacenamiento en PostgreSQL/S3.'}
          </p>
        </div>

        {/* Node 3: Modelado & IA */}
        <div
          style={{
            background: 'rgba(243, 234, 218, 0.05)',
            border: '1px solid rgba(198, 138, 61, 0.5)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ochre)', marginBottom: 8 }}>
            {isEn ? '03 / MACHINE LEARNING & AI' : '03 / MACHINE LEARNING & IA'}
          </span>
          <strong style={{ fontSize: 16, marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
            {isEn ? 'Models & Inference' : 'Modelos & Inferencia'}
          </strong>
          <p style={{ fontSize: 13, color: 'rgba(243, 234, 218, 0.75)', margin: 0, lineHeight: 1.5 }}>
            {isEn
              ? 'Predictive models, classification engines, anomaly detection, and AI agents grounded strictly in audited enterprise knowledge.'
              : 'Algoritmos predictivos, clasificación, detección de anomalías y agentes IA conectados a fuentes auditadas.'}
          </p>
        </div>

        {/* Node 4: Consumo & Decisión */}
        <div
          style={{
            background: 'rgba(243, 234, 218, 0.05)',
            border: '1px solid rgba(243, 234, 218, 0.3)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#F3EADA', marginBottom: 8 }}>
            {isEn ? '04 / LIVE APPLICATIONS' : '04 / APLICACIONES VIVAS'}
          </span>
          <strong style={{ fontSize: 16, marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
            {isEn ? 'Dashboards & Software' : 'Dashboards & Software'}
          </strong>
          <p style={{ fontSize: 13, color: 'rgba(243, 234, 218, 0.75)', margin: 0, lineHeight: 1.5 }}>
            {isEn
              ? 'High-performance React web applications, live executive telemetry interfaces, and secure microservices with 24/7 observability.'
              : 'Aplicaciones React de alto rendimiento, interfaces analíticas interactivas y APIs seguras con monitoreo continuo.'}
          </p>
        </div>
      </div>
    </div>
  );
}
