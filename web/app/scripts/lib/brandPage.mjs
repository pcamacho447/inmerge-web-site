// El sistema de marca para todo lo que se genera fuera del navegador: los PDFs
// convertidos (build-report-pdfs.mjs) y las portadas (build-covers.mjs).
//
// El layout NO se inventa acá: reproduce el de los tres PDFs que ya existen en
// reportes/, maquetados a mano. Encabezado corrido en versalitas, rombo
// terracota junto al logotipo, kicker en versalitas terracota, título en
// Spectral, cuerpo justificado en IBM Plex, pie "El dato, a la vista.".
// Si cambias algo acá, compáralo contra esos PDFs antes de dar por bueno el
// resultado — son la referencia, no este archivo.

export const PALETTE = {
  bg: '#F3EADA',
  ink: '#241A12',
  ochre: '#C68A3D',
  terracotta: '#A8472B',
  gold: '#D8A84E',
  muted: '#7A6B58',
  tanText: '#C9B79C',
  border: '#DDCBAE',
  cream2: '#EBDFC9',
};

const FONTS =
  'https://fonts.googleapis.com/css2?family=Spectral:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// El rombo del logo, como SVG inline: no depende de ningún archivo en disco,
// así que el HTML generado es autocontenido y Playwright no necesita servirlo.
function diamond(size = 14, color = PALETTE.terracotta) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 10 10" aria-hidden="true"><rect x="1.5" y="1.5" width="7" height="7" transform="rotate(45 5 5)" fill="${color}"/></svg>`;
}

export function brandPage({ title, kicker, runningHead, bodyHtml }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<!-- El encabezado corrido lo dibuja Playwright con headerTemplate, no este
     documento: en una impresión, el header se repite por página y eso solo
     lo puede hacer el motor de impresión. Se declara acá igual para que el
     HTML sea autodescriptivo y quien lo abra suelto sepa de qué informe es. -->
<meta name="inmerge-running-head" content="${esc(runningHead)}">
<link rel="stylesheet" href="${FONTS}">
<style>
  @page { size: A4; margin: 22mm 18mm 20mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'IBM Plex Sans', sans-serif; font-size: 10.5pt; line-height: 1.65; color: ${PALETTE.ink}; text-align: justify; }
  .masthead { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 26pt; }
  .wordmark { display: flex; align-items: center; gap: 7pt; font-family: 'IBM Plex Sans', sans-serif; font-weight: 600; font-size: 13pt; letter-spacing: 1.6pt; }
  .whereabouts { text-align: right; font-size: 8pt; color: ${PALETTE.muted}; line-height: 1.5; }
  .kicker { text-align: center; font-size: 7.5pt; font-weight: 600; letter-spacing: 1.6pt; color: ${PALETTE.terracotta}; margin-bottom: 10pt; }
  h1 { font-family: 'Spectral', serif; font-weight: 700; font-size: 26pt; text-align: center; margin: 0 0 22pt; line-height: 1.2; }
  h2 { font-family: 'Spectral', serif; font-weight: 600; font-size: 14pt; color: ${PALETTE.terracotta}; margin: 22pt 0 8pt; padding-bottom: 5pt; border-bottom: 0.6pt solid ${PALETTE.border}; text-align: left; }
  h3 { font-family: 'Spectral', serif; font-weight: 600; font-size: 11.5pt; margin: 16pt 0 6pt; text-align: left; }
  p { margin: 0 0 9pt; }
  strong { font-weight: 600; }
  img { max-width: 100%; height: auto; display: block; margin: 12pt auto; }
  figcaption, .caption { font-size: 8pt; font-style: italic; color: ${PALETTE.muted}; text-align: center; margin-top: -6pt; margin-bottom: 12pt; }
  blockquote { margin: 12pt 0; padding-left: 12pt; border-left: 2pt solid ${PALETTE.gold}; color: ${PALETTE.muted}; font-style: italic; text-align: left; }
  table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 8.5pt; text-align: left; }
  th { background: ${PALETTE.cream2}; font-weight: 600; }
  th, td { border: 0.5pt solid ${PALETTE.border}; padding: 5pt 7pt; }
  code { font-family: 'IBM Plex Mono', monospace; font-size: 9pt; }
  hr { border: none; border-top: 0.6pt solid ${PALETTE.border}; margin: 18pt 0; }
  h1, h2, h3 { break-after: avoid; }
  img, table, figure { break-inside: avoid; }
</style>
</head>
<body>
  <div class="masthead">
    <div class="wordmark">${diamond()}<span>INMERGE</span></div>
    <div class="whereabouts">Consultoría en datos y estrategia<br>Lima, Perú</div>
  </div>
  <div class="kicker">${esc(kicker)}</div>
  <h1>${esc(title)}</h1>
  ${bodyHtml}
</body>
</html>
`;
}

export function coverPage({ title, subtitle, keyFigure }) {
  // 1200x630 es la proporción que exigen WhatsApp, Facebook y X para la imagen
  // social. La misma pieza sirve de portada en el catálogo, así que se genera
  // una sola vez y se usa en los dos lugares.
  const figureBlock = keyFigure ? `<div class="figure">${esc(keyFigure)}</div>` : '';
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${FONTS}">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; width: 1200px; height: 630px; background: ${PALETTE.bg}; color: ${PALETTE.ink}; font-family: 'IBM Plex Sans', sans-serif; display: flex; flex-direction: column; justify-content: space-between; padding: 64px 72px; overflow: hidden; }
  .top { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 20px; letter-spacing: 2.4px; }
  h1 { font-family: 'Spectral', serif; font-weight: 700; font-size: 64px; line-height: 1.12; margin: 0 0 18px; max-width: 15ch; }
  .subtitle { font-size: 21px; color: ${PALETTE.muted}; line-height: 1.5; max-width: 44ch; }
  .figure { font-family: 'Spectral', serif; font-weight: 700; font-size: 96px; color: ${PALETTE.terracotta}; line-height: 1; }
  .bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; }
  .rule { height: 4px; background: ${PALETTE.gold}; width: 96px; margin-bottom: 26px; }
</style>
</head>
<body>
  <div class="top">${diamond(22)}<span>INMERGE</span></div>
  <div>
    <div class="rule"></div>
    <h1>${esc(title)}</h1>
    <div class="subtitle">${esc(subtitle)}</div>
  </div>
  <div class="bottom">
    <div style="font-size:18px;color:${PALETTE.muted}">inmerge.pe · El dato, a la vista.</div>
    ${figureBlock}
  </div>
</body>
</html>
`;
}
