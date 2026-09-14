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
  - `/login`, `/registro`, `/cuenta` (Portal de Clientes): Seguimiento exclusivo de proyectos propios, cronogramas e informes técnicos.
  - `/equipo` (Panel de Colaboradores & Consultores): Gestión técnica de leads TDR, creación de proyectos y publicación de entregables (requiere rol `admin`, `auditor` o `engineer`).
- **Restricción de Negocio:** No reintroducir catálogos de reportes fiscales ni descargas cerradas de PDFs.

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
1. **Testing:** Ejecutar `npm test` en `web/app` antes de cada commit. Las 12 suites de pruebas (59+ tests) deben pasar al 100%.
2. **Build de Producción:** Verificar que `npm run build` compile limpiamente sin errores de bundling.
3. **Formato y Linter:** Mantener conformidad con `npm run lint` y `npm run format`.
