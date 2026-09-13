# Inmerge — Sitio Web Corporativo & Portafolio de Reportes

Sitio web corporativo y plataforma de portafolio de investigación para **Inmerge** (Consultoría estratégica de datos y finanzas públicas, Lima, Perú).

La plataforma combina la presentación de servicios de consultoría estratégica con un catálogo de informes y reportes técnicos basados en datos fiscales y presupuestales peruanos, permitiendo la descarga libre de documentos en PDF previa autenticación de usuarios.

---

## 🏛️ Propósito y Modelo de Negocio

- **Consultoría Estratégica**: Servicios de diagnóstico de datos, arquitectura en la nube (AWS), analítica avanzada y visualización estratégica. La captación de clientes opera a través de puntos de contacto directos (WhatsApp y formulario TDR).
- **Portafolio de Reportes (Lead Magnet)**: Todo el catálogo de reportes analíticos es de acceso público para lectura y visualización interactiva. La descarga del informe completo maquetado en PDF se desbloquea al crear una cuenta gratuita, construyendo una base de usuarios calificados.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, Vite 5, React Router DOM v6 |
| **Visualización** | Plotly.js (`plotly.js-dist-min` cargado bajo demanda para diagramas Sankey) |
| **Estilos & Diseño** | Vanilla CSS + inline styles semánticos con variables CSS (Design System Inmerge) |
| **Backend & Auth** | Supabase (PostgreSQL, Row Level Security, Supabase Auth, Storage, Edge Functions) |
| **Pipeline & Build** | Node.js, Playwright (generación de portadas PNG y compilación de PDFs), Marked |
| **Testing & Calidad** | Vitest, React Testing Library, ESLint 9, Prettier |

---

## 🎨 Sistema de Diseño (Brand Identity)

El diseño está construido sobre una paleta identitaria de tonos tierra y acabados editoriales:

| Token | Variable | Hex | Uso |
|---|---|---|---|
| **Arena** | `--bg` | `#F3EADA` | Fondo principal |
| **Tinta** | `--ink` | `#241A12` | Texto principal y superficies oscuras |
| **Ocre** | `--ochre` | `#C68A3D` | Elementos decorativos |
| **Terracota** | `--terracotta` | `#A8472B` | Acentos de marca y botones principales |
| **Oro** | `--gold` | `#D8A84E` | Destacados y cifras clave |
| **Crema** | `--cream2` | `#EBDFC9` | Fondos de secciones alternas |

- **Tipografía**:
  - **Spectral** (Serif): Titulares, logotipo e identidad editorial.
  - **IBM Plex Sans**: Cuerpo de texto, interfaz de usuario y formularios.
  - **IBM Plex Mono**: Cifras tabulares, métricas y datos numéricos.

---

## 📁 Estructura del Proyecto

```text
inmerge/
├── web/
│   └── app/                  # Aplicación React + Vite
│       ├── src/
│       │   ├── components/   # Componentes modulares (Nav, Footer, SankeyChart, etc.)
│       │   ├── pages/        # Vistas principales (Inicio, Servicios, Reportes, Reporte, Cuenta, Contacto)
│       │   ├── hooks/        # Hooks personalizados (useReports, useReportDownload, useDocumentHead)
│       │   ├── lib/          # Integración con Supabase, autenticación y utilidades
│       │   ├── data/         # Textos, constantes y enlaces del sitio
│       │   └── styles/       # Estilos globales y utilidades de interacción
│       ├── scripts/          # Scripts de soporte y generación de assets
│       │   ├── build-covers.mjs      # Genera portadas PNG optimizadas (1200x630)
│       │   ├── build-report-pdfs.mjs # Renderiza y compila PDFs a partir de Markdown
│       │   └── extract-sankey.mjs    # Extrae payloads JSON optimizados para Plotly
│       ├── public/           # Favicon, portadas (covers/), datos sankey/ y estáticos
│       └── supabase/         # Migraciones SQL y Edge Functions
├── reportes/                 # Informes técnicos, anexos interactivos y documentos fuente
├── design-system/            # Brand guidelines, arquitectura de marca y templates
└── docs/                     # Documentación técnica, especificaciones y planes de producto
```

---

## 🚀 Guía de Inicio Rápido

### 1. Requisitos Previos
- Node.js 18+ y npm
- Cuenta de Supabase configurada

### 2. Instalación de Dependencias

Navega a la carpeta de la aplicación web:

```bash
cd web/app
npm install
```

### 3. Configuración de Variables de Entorno

Copia el archivo de ejemplo y configura las credenciales de Supabase:

```bash
cp .env.example .env.local
```

Edita `.env.local`:
```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

### 4. Ejecución en Desarrollo

```bash
npm run dev
```

El servidor local se iniciará en `http://localhost:5173`.

---

## 📜 Scripts Disponibles

Dentro de `web/app/`:

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo local con Vite |
| `npm run build` | Compila el bundle de producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run test` | Ejecuta la suite de pruebas unitarias con Vitest |
| `npm run test:watch` | Ejecuta pruebas en modo observador interactivo |
| `npm run lint` | Ejecuta la verificación estática de código con ESLint |
| `npm run format` | Aplica formato consistente de código con Prettier |
| `npm run build:covers` | Genera las portadas en `public/covers/*.png` y `og-default.png` con Playwright |
| `npm run build:pdfs` | Compila informes técnicos en Markdown a formato PDF |
| `npm run build:sankey` | Extrae y optimiza los datos para los gráficos de flujo Sankey |

---

## 📊 Catálogo de Reportes

El portafolio incluye investigaciones técnicas especializadas en el análisis del gasto e ingresos públicos:

1. **Un Estado, Tres Oficios** — Radiografía de las funciones del Estado Peruano por niveles de gobierno.
2. **¿De Dónde Viene la Plata?** — Composición y estructura de la recaudación fiscal y recursos ordinarios.
3. **¿En Qué Gasta el Estado Central?** — Distribución sectorial y presupuestal del Gobierno Nacional.
4. **¿En Qué Gasta la Lima Municipal?** — Estructura del gasto e inversión pública en las municipalidades de Lima.
5. **Tres Limas Fiscales** — Brechas de recaudación propia y dependencia fiscal distrital en Lima Metropolitana.

---

## 🔒 Seguridad y Arquitectura de Datos

- **Row Level Security (RLS)**: Activado en PostgreSQL para proteger la integridad de los datos.
- **Acceso Granular por Columnas**: Restricciones a nivel de base de datos para prevenir exposición de rutas de almacenamiento en storage.
- **Descargas Seguras**: URLs firmadas con expiración temporal generadas a través de Supabase Edge Functions (`get-report-download-url`).

---

## 🌐 Despliegue

La aplicación está optimizada para ser servida como Single Page Application (SPA) sobre **AWS S3 + CloudFront**:

- Configuración de distribución CloudFront con soporte para fallback de rutas a `index.html` (para errores 403/404 generados por navegación directa a subrutas como `/reportes/:slug`).
- Certificados SSL y encabezados de seguridad HTTP configurados en la distribución.

---

## 📄 Licencia y Contacto

- **Inmerge** — Servicios de Consultoría en Datos y Finanzas Públicas.
- **Web**: [inmerge.pe](https://inmerge.pe)
- **Contacto**: contacto@inmerge.pe | [+51 957 251 279](https://wa.me/51957251279)
