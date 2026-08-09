import { describe, expect, it } from 'vitest';
import { extractPlotlyPayload } from './extract-sankey.mjs';

const HTML = `
<html><body><div id="abc"></div>
<script>
  window.PLOTLYENV = {};
  Plotly.newPlot(                        "abc-123",                        [{"type":"sankey","node":{"label":["A","B"]}}],                        {"title":{"text":"Flujo"},"width":1450,"height":900},                        {"responsive": true}                    )
</script></body></html>`;

describe('extractPlotlyPayload', () => {
  it('saca data y layout de la llamada a newPlot', () => {
    const { data, layout } = extractPlotlyPayload(HTML);
    expect(data[0].type).toBe('sankey');
    expect(data[0].node.label).toEqual(['A', 'B']);
    expect(layout.title.text).toBe('Flujo');
  });

  it('quita el ancho y el alto fijos, que es lo que impide que sea responsivo', () => {
    const { layout } = extractPlotlyPayload(HTML);
    expect(layout.width).toBeUndefined();
    expect(layout.height).toBeUndefined();
  });

  it('falla ruidosamente si el HTML no tiene newPlot, en vez de devolver vacío', () => {
    expect(() => extractPlotlyPayload('<html><body>nada</body></html>')).toThrow(/newPlot/i);
  });
});
