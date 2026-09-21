---
status: final
version: "1.0.0"
updated: "2026-09-15"
tokens:
  colors:
    bg: "#F3EADA"
    ink: "#241A12"
    inkLight: "#3D2E24"
    terracotta: "#A8472B"
    terracottaHover: "#8F3A22"
    gold: "#D8A84E"
    ochre: "#C68A3D"
    cream2: "#EBDFC9"
    cream3: "#E2D3B8"
    border: "rgba(36, 26, 18, 0.12)"
    borderStrong: "rgba(36, 26, 18, 0.25)"
    navDarkBg: "rgba(36, 26, 18, 0.92)"
    navLightBg: "rgba(243, 234, 218, 0.90)"
    navDarkBorder: "rgba(243, 234, 218, 0.15)"
    navLightBorder: "rgba(36, 26, 18, 0.12)"
    navDarkText: "#F3EADA"
    navLightText: "#241A12"
  typography:
    headlineFamily: "'Space Grotesk', sans-serif"
    bodyFamily: "'Space Grotesk', sans-serif"
    codeFamily: "'Space Mono', monospace"
    weights:
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
  rounded:
    none: "0px"
    sm: "4px"
    md: "8px"
    lg: "12px"
    pill: "9999px"
  spacing:
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
    xxl: "48px"
  components:
    langSwitcher:
      desktopHeight: "34px"
      padding: "3px 6px"
      pillRadius: "9999px"
      fontSize: "12px"
      activeBg: "var(--terracotta)"
      activeColor: "#F3EADA"
      inactiveColor: "var(--ink)"
      inactiveColorDarkNav: "rgba(243, 234, 218, 0.75)"
---

# Inmerge Bilingual Design Specification (DESIGN.md)

Visual identity and interface design specification for the bilingual expansion (Spanish / English) of the Inmerge platform, conforming to the Editorial Tech Premium design system.

---

## 1. Brand & Style

### 1.1 Identity Resonance

Inmerge embodies an **Editorial Tech Premium** aesthetic. Rooted in Lima, Peru, it projects the intellectual rigor and structural authority of a boutique software engineering, technical audit, and applied data science firm.

The international version in English must preserve this exact authority:

- **Never colloquial or generic SaaS-like**: Tone reflects senior technical partnership, not junior hype or startup buzzwords.
- **Typographic Gravity**: Classical serif headlines (`Spectral`) balanced with rationalist sans-serif body copy (`IBM Plex Sans`) and tabular engineering metrics (`IBM Plex Mono`).
- **Warm Mineral Substrate**: Built on warm arena (`#F3EADA`) and cream (`#EBDFC9`), rejecting cold clinical whites or generic dark modes.

---

## 2. Colors

### 2.1 Palette Definition & Semantic Mapping

| Token Name          | Hex / Value              | Semantic Role & Contrast                                                      |
| :------------------ | :----------------------- | :---------------------------------------------------------------------------- |
| `var(--bg)`         | `#F3EADA`                | Primary warm ground substrate for page canvases.                              |
| `var(--ink)`        | `#241A12`                | Deep mineral ink for body typography, primary headers, and dark navbars.      |
| `var(--terracotta)` | `#A8472B`                | Brand signature accent: primary CTAs, active language pill, diamond insignia. |
| `var(--gold)`       | `#D8A84E`                | Excellence badge indicators, hero highlights, active state in dark navbars.   |
| `var(--ochre)`      | `#C68A3D`                | Secondary technical markers and category badges.                              |
| `var(--cream2)`     | `#EBDFC9`                | Elevated card surfaces and panel containers.                                  |
| `var(--border)`     | `rgba(36, 26, 18, 0.12)` | Subtle hairline structural dividers.                                          |

### 2.2 Color Contrast & States in Navigation

The navigation header has two distinct optical states:

1. **Cinematic Hero State (`pathname === '/'` or `'/en'`, `scrollY <= 30`):**
   - Background: `transparent`.
   - Text color: `#F3EADA` (AAA on dark video overlay).
   - Inactive language option: `rgba(243, 234, 218, 0.70)`.
   - Active language option: `var(--terracotta)` with `#F3EADA` text.
2. **Scrolled / Internal State (`scrollY > 30` or internal routes):**
   - Background: `rgba(243, 234, 218, 0.90)` with `backdrop-filter: blur(8px)`.
   - Text color: `var(--ink)`.
   - Inactive language option: `rgba(36, 26, 18, 0.65)`.
   - Active language option: `var(--terracotta)` with `#F3EADA` text.

---

## 3. Typography

### 3.1 Font Stack Hierarchy

```css
--font-display: "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif;
--font-sans: "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: "Space Mono", monospace;
```

### 3.2 Typographic Hierarchy in Bilingual Layouts

- **Hero Title (`H1`):** `Space Grotesk` 700, `clamp(32px, 5vw, 56px)`, line-height 1.15, letter-spacing -0.02em.
  - _ES:_ "Ingeniería de software, auditoría de sistemas e inteligencia de datos."
  - _EN:_ "Software engineering, systems audit and data intelligence."
- **Section Headers (`H2`):** `Space Grotesk` 700, `clamp(26px, 3.5vw, 40px)`.
- **Navigation Links:** `Space Grotesk` 500, `14px`, tracking +0.02em.
- **Language Switcher Labels:** `Space Mono` 700, `11px`, uppercase, tracking +0.05em. Tabular layout prevents layout shift when toggling between `ES` and `EN`.

---

## 4. Layout & Spacing

### 4.1 Header Positioning & Geometry

The Language Switcher is positioned in the desktop navigation bar between the navigation links cluster and the authentication action button:

```
[ INMERGE ◇ ] -------- [ Inicio  Servicios  Nosotros  Contacto ] -------- [ ES | EN ] [ Iniciar sesión ]
```

- **Gap between Nav Links & Switcher:** `20px` to `28px`.
- **Gap between Switcher & Auth Button:** `16px`.
- **Mobile Menu Placement:** In the mobile drawer (`MobileMenu.jsx`), placed prominently at the top right of the drawer with clear touch targets (minimum `44px` touch zone).

---

## 5. Components

### 5.1 Language Switcher Pill (`LanguageSwitcher.jsx`)

#### Visual Specification

- **Container:**
  - Display: `inline-flex`.
  - Border radius: `var(--rounded-pill)` (`9999px`).
  - Border: `1px solid var(--border)` (dynamic according to nav state).
  - Background: `rgba(36, 26, 18, 0.05)` on light nav, `rgba(243, 234, 218, 0.12)` on transparent/dark nav.
  - Padding: `2px 3px`.
  - Height: `32px`.
  - Transitions: `all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`.
- **Segment Button (`button`):**
  - Font: `'IBM Plex Mono', monospace`.
  - Font size: `11px`.
  - Font weight: `600`.
  - Min width: `28px`.
  - Height: `26px`.
  - Border radius: `9999px`.
  - Border: `none`.
  - Background: `transparent` (inactive) vs `var(--terracotta)` (active).
  - Text color: dynamic with smooth transition.
  - Focus Ring: `2px solid var(--gold)`, offset `2px`.

### 5.2 Micro-Interactions

- **Hover State:** Inactive button text color shifts from `0.65` opacity to `1.0` with subtle background glow `rgba(168, 71, 43, 0.08)`.
- **Active Selection Transition:** Smooth sliding pill effect or background cross-fade (`0.2s ease`).

---

## 6. Do's and Don'ts

### Do:

- **DO** use clean typographic ISO codes: `ES` and `EN`.
- **DO** maintain the exact same typographic scale and vertical rhythm in both languages.
- **DO** provide high-contrast focus rings for keyboard navigation.
- **DO** translate technical terms into senior engineering parlance (_"Technical & Data Auditing"_, _"Systems Modernization"_, _"Predictive Machine Learning"_).

### Don't:

- **DON'T** use country flags (e.g., 🇪🇸, 🇺🇸, 🇬🇧, 🇵🇪). Flags represent states, not linguistic systems, and reduce perceived B2B maturity.
- **DON'T** use generic automated translation widgets (Google Translate dropdowns, floating modals).
- **DON'T** allow untranslated mixed content or orphaned Spanish badges on the `/en/*` routes.
- **DON'T** disrupt layout geometry when switching languages (use tabular font numerals and fixed-width containers where necessary).
