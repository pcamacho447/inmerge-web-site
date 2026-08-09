import { useEffect, useRef, useState } from 'react';

// Visor de los anexos Sankey. Carga /sankey/<slug>.json (~10 KB, generado por
// scripts/extract-sankey.mjs) y lo dibuja con Plotly.
//
// Plotly se importa de forma diferida, DENTRO del efecto: es una librería
// grande y solo la necesitan las páginas de reporte que tienen anexo. Cargarla
// arriba la metería en el bundle principal, que pagarían también las páginas
// que no la usan.
//
// El lienzo es responsivo a propósito: los HTML originales venían con 1450x900
// fijos, o sea inservibles en un teléfono, que es donde va a estar la mayoría
// del tráfico. extract-sankey.mjs borra width/height del layout y acá manda el
// contenedor.
//
// Esto NO exige cuenta, a diferencia del PDF. El diagrama demuestra capacidad
// sin entregar el razonamiento escrito, así que la cuenta sigue siendo un
// intercambio real por el informe.

export default function SankeyChart({ slug, title }) {
  const holder = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    let plotly = null;
    const node = holder.current;

    async function draw() {
      try {
        const [{ default: Plotly }, res] = await Promise.all([import('plotly.js-dist-min'), fetch(`/sankey/${slug}.json`)]);
        if (!alive) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data, layout } = await res.json();
        if (!alive || !node) return;
        plotly = Plotly;
        await Plotly.newPlot(
          node,
          data,
          {
            ...layout,
            margin: { l: 8, r: 8, t: 8, b: 8 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { family: "'IBM Plex Sans', sans-serif", size: 11, color: '#241A12' },
          },
          { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] },
        );
      } catch {
        if (alive) setFailed(true);
      }
    }
    draw();

    return () => {
      alive = false;
      // Sin purge, Plotly deja detectores de resize colgados del nodo y cambiar
      // de reporte va acumulando uno por visita.
      if (plotly && node) plotly.purge(node);
    };
  }, [slug]);

  if (failed) {
    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: 24, fontSize: 14, color: 'var(--muted)' }}>
        No se pudo cargar el diagrama interactivo. El análisis completo está en el PDF.
      </div>
    );
  }

  return (
    <div
      ref={holder}
      role="img"
      aria-label={title}
      style={{
        width: '100%',
        minHeight: 'clamp(320px, 60vh, 620px)',
        border: '1px solid var(--border)',
        borderRadius: 3,
        background: 'var(--cream2)',
      }}
    />
  );
}
