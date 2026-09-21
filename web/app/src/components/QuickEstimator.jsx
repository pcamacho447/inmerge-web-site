import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { waLink } from '../data/content';

export const SOLUTIONS_CATALOG = {
  web_pages: {
    id: 'web_pages',
    code: '01',
    name: {
      es: 'Páginas Web',
      en: 'Web Development',
    },
    solutions: [
      {
        id: 'landing_alto_impacto',
        catNumber: 'INM-CAT-2026.01',
        title: {
          es: 'Landing Page de Alto Impacto',
          en: 'High-Impact Landing Page',
        },
        description: {
          es: 'Página única de conversión y lanzamiento, enfocada en captación de leads calificados, velocidad extrema (LCP < 1.0s) y arquitectura visual de vanguardia.',
          en: 'Single-page conversion & launch platform focused on qualified lead capture, extreme load speed (LCP < 1.0s), and bespoke visual design.',
        },
        timeline: {
          es: '~1 a 2 semanas',
          en: '~1 to 2 weeks',
        },
        penBase: 2400,
        usdBase: 650,
        prototype: {
          src: '/projects/b2b-portal.jpg',
          alt: {
            es: 'Prototipo visual de Landing Page de Alto Impacto',
            en: 'High-Impact Landing Page visual prototype',
          },
          caption: {
            es: 'Prototipo de Interfaz: Landing de Conversión de Alta Velocidad (LCP < 1.0s)',
            en: 'Interface Prototype: High-Speed Conversion Landing (LCP < 1.0s)',
          },
        },
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
            'Entregable: Código fuente completo en Git',
            'Despliegue configurado en Vercel / Cloudflare',
            'Soporte post-despliegue por 30 días',
          ],
          en: [
            'Deliverable: Complete source code in Git',
            'Automated production deployment on Vercel/Cloudflare',
            '30 days post-launch technical warranty',
          ],
        },
      },
      {
        id: 'web_corporativo',
        catNumber: 'INM-CAT-2026.02',
        title: {
          es: 'Sitio Web Corporativo Editorial',
          en: 'Bespoke Editorial Corporate Platform',
        },
        description: {
          es: 'Presencia institucional multi-página bilingüe de alto estándar, con diseño inspirado en la geometría Mochica-Chimú contemporánea y máxima accesibilidad WCAG 2.1 AA.',
          en: 'High-standard bilingual corporate multi-page platform featuring contemporary Mochica-Chimú geometric design and WCAG 2.1 AA accessibility.',
        },
        timeline: {
          es: '~2 a 4 semanas',
          en: '~2 to 4 weeks',
        },
        penBase: 4500,
        usdBase: 1200,
        prototype: {
          src: '/projects/b2b-portal.jpg',
          alt: {
            es: 'Prototipo visual de Sitio Web Corporativo Editorial',
            en: 'Editorial Corporate Platform visual prototype',
          },
          caption: {
            es: 'Prototipo de Interfaz: Plataforma Corporativa Bilingüe sobre Lienzo Continuo',
            en: 'Interface Prototype: Bilingual Corporate Platform on Continuous Canvas',
          },
        },
        specs: {
          es: [
            'Arquitectura bilingüe espejo (ES / EN) nativa',
            'Navegación fluida con View Transitions API',
            'Accesibilidad universal WCAG 2.1 AA',
            'Páginas internas en lienzo continuo sin fatiga visual',
          ],
          en: [
            'Native zero-bloat bilingual mirror routing (ES / EN)',
            'Smooth View Transitions API navigation',
            'Universal WCAG 2.1 AA accessibility compliance',
            'Continuous canvas internal pages with zero visual clutter',
          ],
        },
        conditions: {
          es: [
            'Entregable: Repositorio documentado + Manual técnico',
            'Configuración DNS, CDN global y SSL',
            'Soporte y acompañamiento por 45 días',
          ],
          en: [
            'Deliverable: Documented repository + Technical manual',
            'DNS, global CDN, and SSL configuration',
            '45 days technical support & SLA',
          ],
        },
      },
      {
        id: 'portal_interactivo',
        catNumber: 'INM-CAT-2026.03',
        title: {
          es: 'Portal Web Interactivo a Medida',
          en: 'Interactive Bespoke Web Portal',
        },
        description: {
          es: 'Plataforma web con componentes interactivos complejos: cotizadores dinámicos, catálogos filtrables en tiempo real, portales de cliente autenticados o CMS headless.',
          en: 'Advanced web platform with interactive components: dynamic quote engines, real-time filtered catalogs, client portals, or headless CMS.',
        },
        timeline: {
          es: '~4 a 6 semanas',
          en: '~4 to 6 weeks',
        },
        penBase: 7200,
        usdBase: 1950,
        prototype: {
          src: '/projects/b2b-portal.jpg',
          alt: {
            es: 'Prototipo visual de Portal Web Interactivo a Medida',
            en: 'Interactive Bespoke Web Portal visual prototype',
          },
          caption: {
            es: 'Prototipo de Interfaz: Portal B2B con Catálogo Dinámico y Portal de Clientes',
            en: 'Interface Prototype: B2B Portal with Dynamic Catalog and Client Portal',
          },
        },
        specs: {
          es: [
            'Componentes interactivos de alta densidad técnica',
            'Autenticación y roles de usuario (Supabase Auth / JWT)',
            'Almacenamiento y descarga de archivos firmados',
            'Integración con webhooks y APIs externas',
          ],
          en: [
            'High-density interactive front-end components',
            'Secure authentication & RBAC (Supabase Auth / JWT)',
            'Encrypted storage with signed deliverable downloads',
            'Webhook and external API integrations',
          ],
        },
        conditions: {
          es: [
            'Entregables por hitos quincenales auditables',
            'Ambientes Staging y Producción aislados',
            'Garantía técnica de 60 días post-lanzamiento',
          ],
          en: [
            'Auditable bi-weekly milestone deliverables',
            'Isolated Staging and Production cloud environments',
            '60-day post-launch technical warranty',
          ],
        },
      },
    ],
  },
  software_engineering: {
    id: 'software_engineering',
    code: '02',
    name: {
      es: 'Ingeniería de Software',
      en: 'Software Engineering',
    },
    solutions: [
      {
        id: 'cloud_microservicios',
        catNumber: 'INM-CAT-2026.04',
        title: {
          es: 'Arquitectura Cloud & Microservicios',
          en: 'Cloud Architecture & Microservices',
        },
        description: {
          es: 'Diseño e implementación de servicios backend escalables en AWS/GCP, APIs REST/GraphQL de baja latencia, colas asíncronas y bases de datos relacionales robustas.',
          en: 'Design and deployment of scalable AWS/GCP backend services, low-latency REST/GraphQL APIs, asynchronous queues, and resilient databases.',
        },
        timeline: {
          es: '~3 a 5 semanas',
          en: '~3 to 5 weeks',
        },
        penBase: 6500,
        usdBase: 1750,
        prototype: {
          src: '/projects/aws-cloud.jpg',
          alt: {
            es: 'Prototipo visual de Arquitectura Cloud y Microservicios',
            en: 'Cloud Architecture & Microservices visual prototype',
          },
          caption: {
            es: 'Topología de Infraestructura: AWS ECS Fargate, Lambda y PostgreSQL RDS',
            en: 'Infrastructure Topology: AWS ECS Fargate, Lambda, and PostgreSQL RDS',
          },
        },
        specs: {
          es: [
            'Arquitectura serverless / contenedores (AWS ECS Fargate / Lambda)',
            'Diseño de base de datos relacional (PostgreSQL / RDS)',
            'Pipeline CI/CD automatizado con pruebas unitarias > 85%',
            'Monitoreo y telemetría de observabilidad',
          ],
          en: [
            'Serverless / containerized architecture (AWS ECS / Lambda)',
            'Relational database schema modeling (PostgreSQL / RDS)',
            'Automated CI/CD pipeline with unit test coverage > 85%',
            'Full observability telemetry & monitoring',
          ],
        },
        conditions: {
          es: [
            'Infraestructura como código (IaC) documentada',
            'Despliegue en cuenta cloud del cliente',
            'Soporte técnico directo de 45 días',
          ],
          en: [
            'Documented Infrastructure as Code (IaC)',
            'Deployed directly into client cloud account',
            '45-day direct senior engineering support',
          ],
        },
      },
      {
        id: 'software_empresarial',
        catNumber: 'INM-CAT-2026.05',
        title: {
          es: 'Aplicación Web Empresarial a Medida',
          en: 'Custom Enterprise Web Application',
        },
        description: {
          es: 'Sistemas de software para la gestión de operaciones internas, plataformas B2B, automatización de flujos administrativos y portales de proveedores.',
          en: 'Core internal operations software, B2B platforms, administrative workflow automation, and vendor portals.',
        },
        timeline: {
          es: '~4 a 8 semanas',
          en: '~4 to 8 weeks',
        },
        penBase: 9800,
        usdBase: 2650,
        prototype: {
          src: '/projects/logistics-microservices.jpg',
          alt: {
            es: 'Prototipo visual de Aplicación Web Empresarial a Medida',
            en: 'Custom Enterprise Web Application visual prototype',
          },
          caption: {
            es: 'Prototipo Operativo: Sistema Web B2B con Gestión de Permisos RBAC',
            en: 'Operational Prototype: B2B Web System with Granular RBAC Permissions',
          },
        },
        specs: {
          es: [
            'Control de acceso granular basado en roles (RBAC)',
            'Auditoría y trazabilidad completa de cambios (Audit Logs)',
            'Integración con ERPs, pasarelas bancarias y facturación',
            'Rendimiento optimizado para alta concurrencia',
          ],
          en: [
            'Granular Role-Based Access Control (RBAC)',
            'Full event audit trail and forensic data logging',
            'ERP, banking wire, and accounting integrations',
            'Optimized performance under high concurrent usage',
          ],
        },
        conditions: {
          es: [
            'Entregas iterativas en sprints de 2 semanas',
            'Capacitación técnica a usuarios administradores',
            'Garantía técnica de 60 días post-entrega',
          ],
          en: [
            'Iterative deliverables in 2-week sprints',
            'Admin and operator staff training sessions',
            '60-day post-delivery technical SLA warranty',
          ],
        },
      },
      {
        id: 'modernizacion_legados',
        catNumber: 'INM-CAT-2026.06',
        title: {
          es: 'Modernización & Refactorización de Legados',
          en: 'Legacy Modernization & Code Refactoring',
        },
        description: {
          es: 'Migración a la nube y saneamiento de monolitos heredados, erradicando deuda técnica, optimizando costos cloud y asegurando cero tiempo de inactividad.',
          en: 'Cloud migration and refactoring of legacy monoliths, eliminating technical debt, cutting cloud bills, and ensuring zero downtime.',
        },
        timeline: {
          es: '~3 a 6 semanas',
          en: '~3 to 6 weeks',
        },
        penBase: 5800,
        usdBase: 1550,
        prototype: {
          src: '/projects/aws-cloud.jpg',
          alt: {
            es: 'Prototipo visual de Modernización y Refactorización de Legados',
            en: 'Legacy Modernization and Refactoring visual prototype',
          },
          caption: {
            es: 'Esquema de Modernización: Patrón Strangler Fig para Migración Continua a la Nube',
            en: 'Modernization Blueprint: Strangler Fig Pattern for Continuous Cloud Migration',
          },
        },
        specs: {
          es: [
            'Diagnóstico forense de deuda técnica y cuellos de botella',
            'Estrategia de migración Strangler Fig sin parar la operación',
            'Refactorización limpia y suite de pruebas de no-regresión',
            'Reducción comprobada de costos de infraestructura',
          ],
          en: [
            'Forensic technical debt & bottleneck diagnostic',
            'Strangler Fig migration pattern with zero business stoppage',
            'Clean refactoring with regression test suite',
            'Proven cloud infrastructure cost reduction',
          ],
        },
        conditions: {
          es: [
            'Informe de arquitectura antes/después',
            'Certificación de integridad de datos migrados',
            'Soporte técnico prioritario por 45 días',
          ],
          en: [
            'Before/after architectural comparison report',
            'Migrated data integrity certification',
            '45 days priority senior engineering support',
          ],
        },
      },
    ],
  },
  business_intelligence: {
    id: 'business_intelligence',
    code: '03',
    name: {
      es: 'Inteligencia de Negocios',
      en: 'Business Intelligence',
    },
    solutions: [
      {
        id: 'auditoria_saneamiento',
        catNumber: 'INM-CAT-2026.07',
        title: {
          es: 'Auditoría Técnica & Saneamiento de Datos',
          en: 'Technical Audit & Data Sanitization',
        },
        description: {
          es: 'Análisis forense de bases de datos, detección de duplicados e inconsistencias, verificación de integridad relacional y validación de fuentes sin cajas negras.',
          en: 'Forensic database analysis, duplicate and discrepancy detection, relational integrity verification, and transparent source validation.',
        },
        timeline: {
          es: '~2 a 3 semanas',
          en: '~2 to 3 weeks',
        },
        penBase: 3900,
        usdBase: 1050,
        prototype: {
          src: '/projects/fintech-audit.jpg',
          alt: {
            es: 'Prototipo visual de Auditoría Técnica y Saneamiento de Datos',
            en: 'Technical Audit & Data Sanitization visual prototype',
          },
          caption: {
            es: 'Informe Forense de Integridad: Detección de Inconsistencias y Certificación de Fuentes',
            en: 'Forensic Integrity Report: Discrepancy Detection & Data Certification',
          },
        },
        specs: {
          es: [
            'Diagnóstico forense integral de tablas y esquemas',
            'Scripts de deduplicación y saneamiento automatizado',
            'Reglas de integridad referencial y validación continua',
            'Informe técnico formal auditable para Directorio',
          ],
          en: [
            'Comprehensive schema and table diagnostic',
            'Automated deduplication and cleansing scripts',
            'Referential integrity rules & continuous validation',
            'Formal auditable board-ready technical report',
          ],
        },
        conditions: {
          es: [
            'Acuerdo de confidencialidad estricto (NDA previo)',
            'Certificación de integridad y no pérdida de datos',
            'Soporte de 30 días para consultas técnicas',
          ],
          en: ['Strict mutual NDA signed prior to data access', 'Zero-data-loss validation certificate', '30 days direct advisory support'],
        },
      },
      {
        id: 'dashboard_ejecutivo',
        catNumber: 'INM-CAT-2026.08',
        title: {
          es: 'Dashboard Ejecutivo en Tiempo Real',
          en: 'Executive Real-Time Dashboard',
        },
        description: {
          es: 'Cuadros de mando directivos con telemetría operativa en vivo, visualizaciones interactivas de KPIs y trazabilidad donde cada métrica cita su método de cálculo.',
          en: 'Executive live dashboards with real-time operational telemetry, interactive KPI charts, and auditable calculation methodology for every metric.',
        },
        timeline: {
          es: '~2 a 4 semanas',
          en: '~2 to 4 weeks',
        },
        penBase: 5200,
        usdBase: 1400,
        prototype: {
          src: '/projects/demand-forecasting.jpg',
          alt: {
            es: 'Prototipo visual de Dashboard Ejecutivo en Tiempo Real',
            en: 'Executive Real-Time Dashboard visual prototype',
          },
          caption: {
            es: 'Cuadro de Mando Directivo: Telemetría Operativa en Tiempo Real con Cita de Fuentes',
            en: 'Executive Dashboard: Live Operational Telemetry with Auditable Formula Citations',
          },
        },
        specs: {
          es: [
            'Telemetría en tiempo real y visualizaciones directivas',
            'Pipeline automatizado de ingesta ETL/ELT',
            'Diccionario de datos con fórmulas y fuentes citadas',
            'Diseño optimizado para pantallas ejecutivas y móviles',
          ],
          en: [
            'Real-time telemetry and executive visualizations',
            'Automated ETL/ELT data ingestion pipeline',
            'Data dictionary citing formulas and original sources',
            'Responsive design for executive monitors and mobile',
          ],
        },
        conditions: {
          es: [
            'Despliegue en infraestructura segura propia del cliente',
            'Manual de mantenimiento y gobierno de datos',
            'Soporte técnico de 45 días',
          ],
          en: [
            'Deployed directly into client-owned cloud environment',
            'Data governance and pipeline maintenance manual',
            '45 days technical support',
          ],
        },
      },
      {
        id: 'modelos_predictivos',
        catNumber: 'INM-CAT-2026.09',
        title: {
          es: 'Modelos Predictivos & Analítica Avanzada',
          en: 'Predictive Models & Applied AI',
        },
        description: {
          es: 'Modelos de Machine Learning e IA aplicada orientados al impacto financiero real: forecasting de demanda, prevención de fugas de clientes y modelos de optimización.',
          en: 'Machine learning and applied AI models designed for tangible business ROI: demand forecasting, customer churn prevention, and operational optimization.',
        },
        timeline: {
          es: '~4 a 7 semanas',
          en: '~4 to 7 weeks',
        },
        penBase: 8400,
        usdBase: 2250,
        prototype: {
          src: '/projects/ai-rag.jpg',
          alt: {
            es: 'Prototipo visual de Modelos Predictivos y Analítica Avanzada',
            en: 'Predictive Models and Applied AI visual prototype',
          },
          caption: {
            es: 'Modelo de Inferencia Predictiva: Explicabilidad SHAP y Endpoint de Producción',
            en: 'Predictive Inference Model: SHAP Explainability & Production Ingestion Endpoint',
          },
        },
        specs: {
          es: [
            'Modelos de forecasting / clasificación calibrados',
            'Capa de explicabilidad sin cajas negras (SHAP/Feature Importance)',
            'Endpoint de inferencia en producción (REST API)',
            'Pipeline de reentrenamiento continuo con nuevos datos',
          ],
          en: [
            'Calibrated forecasting / classification ML models',
            'Explainability layer with zero black-box obscurity (SHAP)',
            'Production REST API inference endpoint',
            'Continuous automated retraining pipeline',
          ],
        },
        conditions: {
          es: [
            'Informe de validación cruzada y métricas de precisión',
            'Transferencia de conocimiento y código reproducible',
            'Soporte técnico y monitoreo por 60 días',
          ],
          en: [
            'Cross-validation report and model accuracy benchmarks',
            'Complete knowledge transfer & reproducible notebooks',
            '60 days monitoring and senior tuning support',
          ],
        },
      },
    ],
  },
};

export default function QuickEstimator({ initialPillar = 'web_pages', onOpenLLMAssistant }) {
  const { lang, isEn } = useLanguage();

  // Map legacy pillar props if passed
  const resolvePillarKey = (val) => {
    if (val === 'desarrollo') return 'software_engineering';
    if (val === 'auditoria' || val === 'datos') return 'business_intelligence';
    if (SOLUTIONS_CATALOG[val]) return val;
    return 'web_pages';
  };

  const [selectedPillarKey, setSelectedPillarKey] = useState(resolvePillarKey(initialPillar));
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);
  const [currency, setCurrency] = useState('PEN'); // 'PEN' | 'USD'
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activePillar = SOLUTIONS_CATALOG[selectedPillarKey] || SOLUTIONS_CATALOG.web_pages;
  const activeSolution = activePillar.solutions[selectedSolutionIndex] || activePillar.solutions[0];

  const handleSelectPillar = (key) => {
    setSelectedPillarKey(key);
    setSelectedSolutionIndex(0);
  };

  // Keyboard navigation for gallery: ArrowLeft / ArrowRight & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not intercept if focus is inside an interactive text field
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
        return;
      }

      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        return;
      }

      if (e.key === 'ArrowRight') {
        setSelectedSolutionIndex((prev) => (prev + 1) % activePillar.solutions.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedSolutionIndex((prev) => (prev - 1 + activePillar.solutions.length) % activePillar.solutions.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activePillar.solutions.length]);

  const pillarKeys = Object.keys(SOLUTIONS_CATALOG);
  const pillarIndex = Math.max(0, pillarKeys.indexOf(selectedPillarKey));
  const globalSpecimenNumber = pillarIndex * 3 + selectedSolutionIndex + 1;
  const specimenIndexFormatted = String(globalSpecimenNumber).padStart(2, '0');

  const formattedPrice =
    currency === 'PEN'
      ? `S/ ${activeSolution.penBase.toLocaleString('es-PE')} PEN`
      : `$${activeSolution.usdBase.toLocaleString('en-US')} USD`;

  const lineTitle = activePillar.name[lang] || activePillar.name.es;
  const solutionTitle = activeSolution.title[lang] || activeSolution.title.es;
  const prototypeAlt = activeSolution.prototype.alt[lang] || activeSolution.prototype.alt.es;
  const prototypeCaption = activeSolution.prototype.caption[lang] || activeSolution.prototype.caption.es;

  const whatsAppMsg = isEn
    ? `Hello Inmerge, I was reviewing your catalog and would like to quote the solution: [${lineTitle} — ${solutionTitle}] (Baseline: ${formattedPrice}). Can we coordinate with a senior engineer?`
    : `Hola Inmerge, estuve revisando su catálogo en la web y me interesa cotizar la solución: [${lineTitle} — ${solutionTitle}] (referencia ${formattedPrice}). ¿Podemos coordinar con un consultor?`;

  return (
    <section
      className="curatorial-placard-section"
      aria-label={isEn ? 'Editorial Estimator & Service Placard' : 'Cotizador Editorial y Cédula de Servicios'}
    >
      <div className="curatorial-container">
        {/* Monograph Gallery Header */}
        <div className="monograph-top-bar">
          <div className="monograph-identity">
            <span className="monograph-label">{isEn ? 'ENGINEERING MONOGRAPH' : 'MONOGRAFÍA DE INGENIERÍA'}</span>
            <span className="monograph-dot" aria-hidden="true" />
            <span className="monograph-coords" aria-hidden="true">
              LIMA · 08°06′S 79°01′W
            </span>
          </div>
          <h1 className="monograph-h1">{lineTitle}</h1>
        </div>

        {/* 1. Disciplines Gallery Bar (Hairline Typographic Index) */}
        <div className="gallery-disciplines-bar" role="tablist" aria-label={isEn ? 'Disciplines' : 'Disciplinas'}>
          {Object.entries(SOLUTIONS_CATALOG).map(([key, item]) => {
            const isSelected = selectedPillarKey === key;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                id={`tab-${key}`}
                aria-label={`${item.code} / ${item.name[lang] || item.name.es}`}
                aria-selected={isSelected}
                aria-controls={`panel-${key}`}
                className={`gallery-discipline-btn ${isSelected ? 'is-active' : ''}`}
                onClick={() => handleSelectPillar(key)}
              >
                <span className="discipline-num">[{item.code}]</span>
                <span className="discipline-label">{item.name[lang] || item.name.es}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Specimens Gallery Index (Quiet Typographic Row — No Pills) */}
        <div className="gallery-specimens-index" aria-label={isEn ? 'Works in room' : 'Obras en sala'}>
          {activePillar.solutions.map((sol, idx) => {
            const isSelected = selectedSolutionIndex === idx;
            const itemNum = String(pillarIndex * 3 + idx + 1).padStart(2, '0');
            return (
              <button
                key={sol.id}
                type="button"
                className={`gallery-specimen-item ${isSelected ? 'is-active' : ''}`}
                onClick={() => setSelectedSolutionIndex(idx)}
              >
                <span className="item-marker">{itemNum}</span>
                <span className="item-title">{sol.title[lang] || sol.title.es}</span>
              </button>
            );
          })}
        </div>

        {/* 3. The Monumental Prototype Window (Horizontal Top Exhibition Tier) */}
        <div className="curatorial-monumental-viewport" role="figure" aria-label={prototypeCaption}>
          <div className="monumental-badge-overlay">
            <span className="monumental-dot" aria-hidden="true" />
            <span className="monumental-badge-text">
              {isEn
                ? `SPECIMEN ${specimenIndexFormatted} / 09 — 1:1 PROTOTYPE VIEW`
                : `ESPECÍMEN ${specimenIndexFormatted} / 09 — VISTA DE PROTOTIPO 1:1`}
            </span>
          </div>

          <div className="monumental-coords-overlay" aria-hidden="true">
            <span className="coords-cross">+</span>
            <span>08°06′S · 79°01′W — SALA 0{pillarIndex + 1}</span>
          </div>

          <div
            className="monumental-image-container"
            role="button"
            tabIndex={0}
            aria-label={isEn ? `Inspect ${prototypeAlt} at full scale` : `Inspeccionar ${prototypeAlt} a escala completa`}
            aria-haspopup="dialog"
            onClick={() => setIsLightboxOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsLightboxOpen(true);
              }
            }}
          >
            <img
              key={activeSolution.id}
              src={activeSolution.prototype.src}
              alt={prototypeAlt}
              className="monumental-prototype-img"
              loading="lazy"
            />
            <div className="monumental-zoom-hint" aria-hidden="true">
              <span className="hint-cross">⤢</span>
              <span>{isEn ? 'INSPECT 1:1' : 'INSPECCIONAR 1:1'}</span>
            </div>
          </div>

          <div className="monumental-caption-bar">
            <span className="caption-diamond" aria-hidden="true">
              ◆
            </span>
            <span className="caption-text">{prototypeCaption}</span>
            <span className="caption-coords-inline" aria-hidden="true">
              [ INMERGE · SALA 0{pillarIndex + 1} · {activeSolution.catNumber} ]
            </span>
          </div>
        </div>

        {/* 4. The Museum Wall Placard (Horizontal Grand Curatorial Bench) */}
        <div className="curatorial-placard-grid curatorial-bench-grid" role="region" aria-label={solutionTitle}>
          {/* Column 1: Registry, Index & Currency */}
          <div className="bench-col bench-col-registry">
            <div className="bench-item">
              <span className="placard-label">{isEn ? 'CATALOGUE ID' : 'CÓDIGO DE CATÁLOGO'}</span>
              <span className="placard-cat-number">{activeSolution.catNumber}</span>
            </div>
            <div className="bench-item">
              <span className="placard-label">{isEn ? 'DISCIPLINE' : 'DISCIPLINA'}</span>
              <span className="placard-discipline-text">{lineTitle}</span>
            </div>
            <div className="bench-item">
              <span className="placard-label">{isEn ? 'EXHIBITION SPECIMEN' : 'ESPÉCIMEN EN SALA'}</span>
              <span className="bench-specimen-id">{specimenIndexFormatted} / 09</span>
            </div>
            <div className="bench-item bench-currency-item">
              <span className="placard-label">{isEn ? 'CURRENCY' : 'MONEDA'}</span>
              <div className="curatorial-currency-switch" role="group" aria-label={isEn ? 'Currency Selector' : 'Selector de Moneda'}>
                <button
                  type="button"
                  className={`currency-btn ${currency === 'PEN' ? 'active' : ''}`}
                  aria-pressed={currency === 'PEN'}
                  onClick={() => setCurrency('PEN')}
                >
                  PEN
                </button>
                <span className="currency-divider">|</span>
                <button
                  type="button"
                  className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                  aria-pressed={currency === 'USD'}
                  onClick={() => setCurrency('USD')}
                >
                  USD
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Scope & Technical Abstract */}
          <div className="bench-col bench-col-scope">
            <span className="placard-label">{isEn ? 'SOLUTION SCOPE & MEMOIR' : 'ALCANCE & MEMORIA TÉCNICA'}</span>
            <h3 className="placard-solution-title">{solutionTitle}</h3>
            <p className="placard-solution-desc">{activeSolution.description[lang] || activeSolution.description.es}</p>
          </div>

          {/* Column 3: Engineering Deliverables & Conditions */}
          <div className="bench-col bench-col-specs">
            <div className="bench-specs-group">
              <h4 className="detail-section-title">
                <span className="detail-diamond" aria-hidden="true">
                  ◆
                </span>
                {isEn ? 'TECHNICAL SPECIFICATIONS' : 'ESPECIFICACIONES TÉCNICAS'}
              </h4>
              <ul className="curatorial-specs-list">
                {(activeSolution.specs[lang] || activeSolution.specs.es).map((spec, i) => (
                  <li key={i}>
                    <span className="list-marker">—</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bench-specs-group bench-sla-group">
              <h4 className="detail-section-title">
                <span className="detail-diamond" aria-hidden="true">
                  ◆
                </span>
                {isEn ? 'DELIVERY & SLA CONDITIONS' : 'CONDICIONES DE ENTREGA & SLA'}
              </h4>
              <ul className="curatorial-specs-list">
                <li className="highlight-condition">
                  <span className="list-marker">—</span>
                  <span>
                    <strong>{isEn ? 'Estimated Timeline:' : 'Plazo Estimado:'}</strong>{' '}
                    {activeSolution.timeline[lang] || activeSolution.timeline.es}
                  </span>
                </li>
                {(activeSolution.conditions[lang] || activeSolution.conditions.es).map((cond, i) => (
                  <li key={i}>
                    <span className="list-marker">—</span>
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: Baseline Investment & Immediate Action */}
          <div className="bench-col bench-col-actions">
            <div className="bench-investment-container">
              <span className="investment-label">{isEn ? 'BASELINE INVESTMENT:' : 'INVERSIÓN REFERENCIAL:'}</span>
              <div className="investment-main">{formattedPrice}</div>
              <span className="investment-note">
                {isEn ? 'Scope calibrated to milestone deliverables' : 'Alcance calibrado a entregables auditables'}
              </span>
            </div>

            <div className="bench-actions-buttons">
              <a href={waLink(whatsAppMsg)} target="_blank" rel="noopener noreferrer" className="btn-accent curatorial-cta-btn">
                {isEn ? 'Quote this Solution via WhatsApp ↗' : 'Cotizar esta Solución vía WhatsApp ↗'}
              </a>

              {onOpenLLMAssistant && (
                <button
                  type="button"
                  className="btn-outline curatorial-llm-btn"
                  onClick={() =>
                    onOpenLLMAssistant({
                      pillar: selectedPillarKey,
                      pillarName: lineTitle,
                      solutionId: activeSolution.id,
                      solutionTitle,
                      solutionEstimate: {
                        timeline: activeSolution.timeline[lang] || activeSolution.timeline.es,
                        formattedPrice,
                      },
                    })
                  }
                >
                  {isEn ? 'Consult with Alaec (AI) →' : 'Consultar con Alaec (IA) →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Full-Scale Gallery Lightbox (Modal de Inspección 1:1) */}
      {isLightboxOpen && (
        <div
          className="curatorial-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={prototypeCaption}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLightboxOpen(false);
          }}
        >
          <div className="curatorial-lightbox-dialog">
            <button
              type="button"
              className="curatorial-lightbox-close"
              onClick={() => setIsLightboxOpen(false)}
              aria-label={isEn ? 'Close full-scale viewer' : 'Cerrar visor a escala completa'}
            >
              <span aria-hidden="true">✕</span>
              <span className="close-kbd-hint">[ ESC ]</span>
            </button>

            <div className="curatorial-lightbox-viewport">
              <img src={activeSolution.prototype.src} alt={prototypeAlt} className="curatorial-lightbox-img" />
            </div>

            <div className="curatorial-lightbox-caption-bar">
              <span className="caption-diamond" aria-hidden="true">
                ◆
              </span>
              <span className="caption-title">
                {lineTitle} — {solutionTitle}
              </span>
              <span className="caption-separator">·</span>
              <span className="caption-specimen-desc">{prototypeCaption}</span>
              <span className="caption-cat-number" aria-hidden="true">
                [{activeSolution.catNumber}]
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
