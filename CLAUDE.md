# Protocolo de Desarrollo para Claude Code — Inmerge

Este documento sirve como puente operativo para Claude Code. La **fuente única de verdad** para las directrices de arquitectura, diseño, rutas, pagos y calidad técnica es [AGENTS.md](file:///c:/papx/inmerge-website/inmerge/AGENTS.md).

---

## 1. División Metodológica de Trabajo

1. **BMAD (Gestión de Producto & Arquitectura):**
   - Ideación y requerimientos: `bmad-product-brief`, `bmad-prd`, `bmad-forge-idea`.
   - Arquitectura y especificación UX: `bmad-architecture`, `bmad-ux`.
   - Desglose y backlog: `bmad-create-epics-and-stories`, `bmad-sprint-planning`.

2. **Superpowers (Ingeniería, Ejecución & Calidad):**
   - Planificación técnica granular: `superpowers:writing-plans`.
   - Entornos aislados: `superpowers:using-git-worktrees`.
   - Construcción con TDD estricto: `superpowers:test-driven-development`.
   - Verificación de no regresión: `superpowers:verification-before-completion`.
   - Revisión de código: `superpowers:requesting-code-review`, `superpowers:receiving-code-review`.

---

## 2. Protocolo Obligatorio de Ejecución

1. **Alineación:** Tomar la historia desde el backlog o spec de producto (BMAD).
2. **Revisión de Estándares:** Consultar `modern-web-guidance` para accesibilidad (WCAG 2.1 AA) y maquetación CSS/Grid moderna.
3. **Plan Técnico:** Generar el plan bite-sized con `superpowers:writing-plans`.
4. **Desarrollo TDD:** Escribir la prueba unitaria en Vitest (fase roja) antes de implementar el código (fase verde).
5. **Verificación Innegociable:**
   ```powershell
   npm test       # En web/app -> 100% aprobados (0 fallos)
   npm run build  # En web/app -> Compilación limpia (0 errores/warnings)
   npm run lint   # En web/app -> Conformidad con reglas ESLint
   ```
6. **Bitácora:** Registrar decisiones técnicas en `docs/decisions-log.md`.
