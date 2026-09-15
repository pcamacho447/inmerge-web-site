# Directrices del Proyecto Inmerge

Inmerge es una firma boutique de consultoría en ingeniería de software, auditoría de sistemas y ciencia de datos (Lima, Perú).

Consulte las especificaciones técnicas del entorno en:
- [Guía de Arquitectura, Diseño & Testing](file:///c:/papx/inmerge-website/inmerge/.agents/rules/inmerge-brand-architecture.md)

---

## 1. Los Tres Pilares Estratégicos
1. **Pilar 01 — Auditoría Técnica y de Datos:** Calidad e integridad de bases de datos, detección de duplicados/inconsistencias, auditoría de sistemas cloud (AWS/GCP), seguridad y cumplimiento normativo.
2. **Pilar 02 — Desarrollo Tecnológico & Cloud:** Arquitectura cloud en AWS (ECS, Lambda, RDS, S3), microservicios, software empresarial a medida, APIs y modernización de sistemas.
3. **Pilar 03 — Ciencia de Datos & Inteligencia Artificial:** Machine Learning, modelos predictivos, forecasting, integración de IA generativa/agentes y dashboards ejecutivos en tiempo real.

---

## 2. Reglas de Navegación y Rutas
- **Rutas Públicas:**
  - `/` (Inicio): Hero de alto impacto, pilares interactivos, diagrama de arquitectura y valores.
  - `/servicios` (Servicios): Catálogo filtrable por pilar, acordeones de diagnóstico/entregables y cotización directa.
  - `/metodologia` (Stack & Metodología): Las 4 fases del Método Inmerge, diagrama de flujo y explorador de tecnologías.
  - `/nosotros` (Nosotros): Manifiesto de ingeniería, compromisos técnicos y perfiles senior.
  - `/contacto` (Contacto & TDR): Formulario estructurado con selector de pilares y enlace con mensaje pre-rellenado a WhatsApp.
- **Rutas de Autenticación & Clientes:**
  - `/login`, `/registro`, `/cuenta` (Portal de Clientes): Seguimiento exclusivo de proyectos propios, cronogramas e informes técnicos para usuarios `client` y `admin`. Los ingenieros y auditores (`engineer`, `auditor`) son redirigidos obligatoriamente a `/equipo`.
  - `/equipo` (Panel de Colaboradores & Consultores): Panel interno de trabajo. Solo `admin` puede modificar estados de proyectos/hitos/leads, crear proyectos y designar ingenieros/auditores. Los roles `engineer` y `auditor` operan en modo lectura/imputación sin permisos de modificación estructural.
- **Restricciones de Negocio & Pagos:**
  - No reintroducir catálogos de reportes fiscales ni descargas cerradas de PDFs.
  - **Medio de Pago Exclusivo:** Se aceptan única y exclusivamente **Transferencias Bancarias Directas** a cuentas institucionales de Inmerge (BCP, Interbank, BBVA en PEN). Toda orden se gestiona con código correlativo (`INM-ORD-...`) y validación de RUC (11 dígitos).

---

## 3. Sistema de Diseño (Editorial Tech Premium)
- **Paleta de Identidad:**
  - Arena: `--bg` (`#F3EADA`) — Superficie principal.
  - Tinta: `--ink` (`#241A12`) — Tipografía y fondos oscuros.
  - Terracota: `--terracotta` (`#A8472B`) — Acento de marca y botones primarios.
  - Oro: `--gold` (`#D8A84E`) — Destacados e indicadores de calidad.
  - Ocre: `--ochre` (`#C68A3D`) — Elementos secundarios.
  - Crema: `--cream2` (`#EBDFC9`) — Fondos de tarjetas y paneles alternos.
- **Tipografía:**
  - `Spectral` (Serif): Titulares, logotipo e identidad editorial.
  - `IBM Plex Sans`: Cuerpo de texto, interfaz de usuario y formularios.
  - `IBM Plex Mono`: Cifras tabulares, métricas, badges técnicos y código.
- **Micro-interacciones:** Usar clases estándar (`.btn-accent`, `.btn-outline`, `.pillar-card-interactive`, `.card-hover`, `.stack-tool-card`).

---

## 4. Estándares de Código y Calidad
1. **Testing:** Ejecutar `npm test` en `web/app` antes de cada commit. Las 20 suites de pruebas (104+ tests) deben pasar al 100%.
2. **Build de Producción:** Verificar que `npm run build` compile limpiamente sin errores de bundling.
3. **Formato y Linter:** Mantener conformidad con `npm run lint` y `npm run format`.
