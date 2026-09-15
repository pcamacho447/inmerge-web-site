# Inmerge — Plataforma Web Corporativa & Portal de Consultoría

Plataforma oficial de **Inmerge**, firma boutique de consultoría en ingeniería de software, auditoría de sistemas y ciencia de datos (Lima, Perú).

La plataforma integra la presentación institucional de servicios técnicos de alto nivel con un **Portal de Clientes** para seguimiento de proyectos y entregables técnicos, y un **Panel de Consultores & Equipo** en tiempo real para la gestión operativa de requerimientos TDR, cronogramas y auditorías.

---

## 🏛️ Propósito y Pilares Estratégicos

Inmerge provee soluciones de ingeniería para organizaciones que requieren rigor técnico, decisiones fundamentadas y arquitectura de software escalable.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INMERGE CONSULTING                            │
├────────────────────┬────────────────────────────┬───────────────────────┤
│  01. AUDITORÍA     │  02. DESARROLLO CLOUD      │  03. CIENCIA DE DATOS │
│  TÉCNICA & DATOS   │  & ARQUITECTURA AWS        │  & INTELIGENCIA ART.  │
├────────────────────┼────────────────────────────┼───────────────────────┤
│ • Calidad de Datos │ • Arquitectura Serverless  │ • Machine Learning    │
│ • Detección Duplic.│ • Microservicios en ECS    │ • Modelos Predictivos │
│ • Cloud Compliance │ • APIs & Backend a Medida  │ • Agentes & GenAI     │
│ • Seguridad AWS/GCP│ • Bases PostgreSQL/RDS     │ • Dashboards BI Real  │
└────────────────────┴────────────────────────────┴───────────────────────┘
```

### 1. Pilar 01 — Auditoría Técnica y de Datos
- **Integridad & Calidad de Datos:** Análisis forense y validación de bases de datos, detección de inconsistencias, duplicados y normalización de pipelines.
- **Auditoría Cloud & Seguridad:** Evaluación de postura de seguridad, permisos IAM, configuraciones de red y cumplimiento normativo en AWS y GCP.
- **Revisión de Código & Rendimiento:** Diagnóstico de cuellos de botella, optimización de consultas SQL complejas y aseguramiento de mejores prácticas de software.

### 2. Pilar 02 — Desarrollo Tecnológico & Cloud
- **Arquitectura Cloud en AWS:** Diseño e implementación de infraestructura moderna basada en AWS ECS (Fargate), AWS Lambda, Amazon RDS (PostgreSQL/Aurora), Amazon S3 y CloudFront.
- **Software Empresarial & Microservicios:** Desarrollo de aplicaciones web y plataformas transaccionales a medida con alta disponibilidad y tolerancia a fallos.
- **APIs & Modernización de Sistemas:** Creación de APIs REST seguras, desacoplamiento de monolitos legados y automatización de procesos operativos.

### 3. Pilar 03 — Ciencia de Datos & Inteligencia Artificial
- **Machine Learning & Modelos Predictivos:** Modelado estadístico avanzado, forecasting de demanda, scoring de riesgos y algoritmos de optimización.
- **Integración de IA Generativa & Agentes:** Implementación de asistentes inteligentes, flujos RAG y automatización cognitiva sobre datos corporativos privados.
- **Dashboards Ejecutivos en Tiempo Real:** Paneles interactivos de control gerencial para visualización continua de KPIs y métricas críticas de negocio.

---

## 🔄 El Método Inmerge (Metodología en 4 Fases)

1. **Fase 01 — Diagnóstico & Auditoría Inicial:** Levantamiento de infraestructura existente, evaluación de calidad de datos, identificación de vulnerabilidades y elaboración del dictamen técnico inicial.
2. **Fase 02 — Arquitectura & Diseño Técnico:** Especificación de requerimientos, diagramas de topología cloud, modelado de bases de datos y definición de contratos de interfaz (APIs/TDR).
3. **Fase 03 — Construcción & Despliegue Cloud:** Desarrollo modular con integración continua, aprovisionamiento declarativo de infraestructura y pruebas automatizadas de regresión.
4. **Fase 04 — Aseguramiento Continuo & Observabilidad:** Monitoreo en tiempo real, trazabilidad de eventos, métricas de rendimiento y entrega formal de documentación y código fuente.

---

## 🛠️ Stack Tecnológico

| Capa / Dominio | Tecnologías y Herramientas |
|---|---|
| **Frontend** | React 18, Vite 5, React Router DOM v6 |
| **Arquitectura UI** | Code-Splitting con `React.lazy()` y `<Suspense>`, Skeletons Shimmer, `ErrorBoundary` |
| **Estilos & UI Tokens** | Vanilla CSS modular, variables CSS nativas, Micro-interacciones Editorial Tech |
| **Backend & Base de Datos** | Supabase (PostgreSQL 15+, Row Level Security, Supabase Auth, Functions RPC) |
| **Tiempo Real (Realtime)** | Supabase Realtime WebSockets (`supabase_realtime` publication, Replica Identity Full) |
| **Almacenamiento** | Supabase Storage (Bucket privado `project-deliverables` con Presigned URLs) |
| **Cloud Hosting** | AWS S3 + Amazon CloudFront (Distribución SPA con fallback a `index.html` y HTTPS) |
| **Testing & Calidad** | Vitest, React Testing Library, ESLint 9, Prettier (17 suites, 90+ tests) |

---

## 🔒 Seguridad, Resiliencia y Gobierno de Datos

La plataforma implementa controles estrictos de seguridad tanto en la capa de frontend como en el motor de base de datos PostgreSQL:

1. **Honeypot Silencioso (Anti-Spam / Shadow Ban):**
   - El formulario de contacto y cotización TDR incluye un campo oculto fuera de pantalla (`website_url_hp`).
   - Los bots automatizados que completan este campo reciben una confirmación simulada (`{ success: true, isSpamFiltered: true }`), evitando la inserción en base de datos y suprimiendo ejecuciones de Edge Functions.
2. **Rate Limiting Transaccional en PostgreSQL:**
   - Un trigger `BEFORE INSERT` en `public.leads_tdr` restringe a un máximo de **3 envíos por correo electrónico por hora**, apoyado en el índice compuesto `idx_leads_tdr_email_created_at`.
   - Exceder el límite genera la excepción `RATE_LIMIT_EXCEEDED`, canalizando al usuario hacia WhatsApp y auditando el intento en `team_activity_logs`.
3. **Row Level Security (RLS) & Acceso de Menor Privilegio:**
   - Inserciones anónimas públicas sin encadenar `.select()` en PostgREST para prevenir infracciones RLS 403.
   - Acceso al bucket `project-deliverables` estrictamente restringido a clientes asignados y colaboradores autenticados (`profiles.role IN ('client', 'auditor', 'engineer', 'admin')`).
4. **Inmutabilidad de Auditoría:**
   - Revocación total de permisos de modificación y borrado (`REVOKE UPDATE, DELETE ON public.team_activity_logs`) para garantizar trazabilidad forense legalmente inalterable.

---

## 🎨 Sistema de Diseño (Editorial Tech Premium)

El diseño visual proyecta sofisticación técnica y precisión editorial:

### Paleta de Colores
| Token | Variable CSS | Hex | Uso en Plataforma |
|---|---|---|---|
| **Arena** | `--bg` | `#F3EADA` | Superficie de fondo principal |
| **Tinta** | `--ink` | `#241A12` | Tipografía principal y fondos oscuros |
| **Terracota** | `--terracotta` | `#A8472B` | Acento de marca, botones de acción primaria (`.btn-accent`) |
| **Oro** | `--gold` | `#D8A84E` | Indicadores de calidad y estados de hito |
| **Ocre** | `--ochre` | `#C68A3D` | Estados intermedios y acentos secundarios |
| **Crema** | `--cream2` | `#EBDFC9` | Tarjetas interactivas (`.card-hover`), paneles y tablas |

### Tipografía
- **`Spectral` (Serif):** Titulares principales, imagotipo e identidad editorial de prestigio.
- **`IBM Plex Sans` (Sans-serif):** Cuerpo de texto, interfaz de usuario, navegación y formularios.
- **`IBM Plex Mono` (Monospace):** Cifras tabulares, métricas de ingeniería, estados RAG y logs de auditoría.

---

## 🗺️ Mapa de Rutas de la Plataforma

### Rutas Públicas
- **`/` (Inicio):** Propuesta de valor, pilares interactivos, diagrama de arquitectura en 4 capas y principios de ingeniería.
- **`/servicios` (Servicios):** Catálogo de servicios filtrable por pilar, alcances técnicos, diagnósticos y cotización directa.
- **`/metodologia` (Stack & Metodología):** Las 4 fases del Método Inmerge y explorador de tecnologías categorizadas.
- **`/nosotros` (Nosotros):** Manifiesto de ingeniería, compromisos de calidad y perfiles técnicos senior.
- **`/contacto` (Contacto & TDR):** Formulario estructurado para requerimientos técnicos y enlace directo a WhatsApp.

### Rutas Autenticadas (Portal & Gestión)
- **`/login` / `/registro`:** Autenticación segura gestionada por Supabase Auth.
- **`/cuenta` (Portal de Clientes):** Vista exclusiva del cliente para consultar el estado de salud de sus proyectos, cronogramas Gantt y descarga segura de informes técnicos/entregables.
- **`/equipo` (Panel de Colaboradores & Consultores):** Gestión de prospectos TDR, cálculo de progreso ponderado, control de tareas, matriz de riesgos y bitácora de auditoría (requiere rol `admin`, `auditor` o `engineer`).

---

## 📁 Estructura del Repositorio

```text
inmerge/
├── .agents/                      # Reglas de desarrollo y arquitectura de marca
│   └── rules/inmerge-brand-architecture.md
├── supabase/                     # Migraciones maestras de base de datos
│   └── migrations/
│       ├── 0001_inmerge_initial_schema.sql
│       ├── 0002_inmerge_security_and_audit_hardening.sql
│       ├── 0003_inmerge_realtime_publication.sql
│       ├── 0004_inmerge_milestones_status_flexible.sql
│       ├── 0005_inmerge_pm_module.sql
│       ├── 0006_inmerge_leads_rate_limiting.sql
│       └── 20260915003802_remote_schema.sql
├── web/
│   └── app/                      # Aplicación React + Vite
│       ├── public/               # Favicon, robots.txt, sitemap.xml, assets estáticos
│       ├── src/
│       │   ├── components/       # Componentes reutilizables (Nav, Footer, Gantt, Diagramas)
│       │   │   └── team/         # Módulos desacoplados del panel de consultores
│       │   │       ├── LeadsInboxTable.jsx
│       │   │       ├── ProjectsManagementView.jsx
│       │   │       ├── NewProjectModal.jsx
│       │   │       ├── TeamActivityFeed.jsx
│       │   │       └── StaffManagementView.jsx
│       │   ├── data/             # Definiciones canónicas de contenido y stack tecnológico
│       │   ├── hooks/            # Hooks de estado, realtime y metadatos (useRealtimeTeam, etc.)
│       │   ├── lib/              # Clientes de API, Supabase, lógica PM y leads
│       │   ├── pages/            # Vistas principales de la aplicación
│       │   └── styles/           # Sistema de diseño CSS global y tokens
│       └── supabase/             # Paridad de migraciones y Edge Functions locales
└── AGENTS.md                     # Directrices operativas de pair-programming con IA
```

---

## 🚀 Guía de Inicio Rápido

### 1. Requisitos
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior
- Instancia o proyecto activo de **Supabase**

### 2. Instalación
```bash
cd web/app
npm install
```

### 3. Variables de Entorno
Configurar `.env.local` en `web/app/`:
```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

### 4. Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 📜 Scripts de Verificación y Compilación

Dentro de `web/app/`:

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR) |
| `npm run build` | Compila el bundle de producción optimizado con code-splitting en `dist/` |
| `npm run preview` | Ejecuta un servidor local para inspeccionar la compilación de producción |
| `npm test` | Ejecuta la suite completa de pruebas unitarias y de integración con Vitest |
| `npm run test:watch` | Ejecuta pruebas en modo observador interactivo durante desarrollo |
| `npm run lint` | Valida conformidad estática de código con ESLint 9 |
| `npm run format` | Aplica formateo consistente en todo el árbol de código con Prettier |

---

## 📞 Canales Oficiales y Contacto

- **Firma:** Inmerge Consulting — Soluciones de Ingeniería, Auditoría & Datos
- **Sitio Web:** [https://inmerge.pe](https://inmerge.pe)
- **Correo Institucional:** [inmerge3@gmail.com](mailto:inmerge3@gmail.com)
- **WhatsApp Directo:** [+51 957 251 279](https://wa.me/51957251279)
- **Ubicación:** Lima, Perú
