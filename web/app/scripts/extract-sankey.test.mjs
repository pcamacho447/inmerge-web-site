import { describe, expect, it } from 'vitest';
import { extractPlotlyPayload } from './extract-sankey.mjs';

const HTML = `
<html><body><div id="abc"></div>
<script>
  window.PLOTLYENV = {};
  Plotly.newPlot(                        "abc-123",                        [{"type":"sankey","node":{"label":["A","B"]}}],                        {"title":{"text":"Flujo"},"width":1450,"height":900},                        {"responsive": true}                    )
</script></body></html>`;

// Envuelve un bloque de datos crudo (ya serializado) en el mismo molde de HTML
// que produce Plotly, para probar readBalanced() contra los casos adversos que
// justifican su existencia: una expresión regular no distingue un `[` o un `"`
// que forman parte de un valor de cadena de uno que abre o cierra la estructura.
function wrap(dataJson) {
  return `
<html><body><div id="abc"></div>
<script>
  window.PLOTLYENV = {};
  Plotly.newPlot(                        "abc-123",                        ${dataJson},                        {"title":{"text":"Flujo"},"width":1450,"height":900},                        {"responsive": true}                    )
</script></body></html>`;
}

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

  it('no confunde corchetes ni llaves que son parte del texto de una etiqueta con la estructura del JSON', () => {
    // Nombres reales de partidas presupuestales peruanas usan corchetes y
    // llaves como puntuación. Si el contador de profundidad no respetara las
    // cadenas, "Gasto [no proyectizado]" cerraría el arreglo de datos antes de
    // tiempo y "Transferencias {ley}" cerraría el layout antes de tiempo.
    const html = wrap('[{"type":"sankey","node":{"label":["Gasto [no proyectizado]","Transferencias {ley}"]}}]');
    const { data, layout } = extractPlotlyPayload(html);
    expect(data[0].node.label).toEqual(['Gasto [no proyectizado]', 'Transferencias {ley}']);
    expect(layout.title.text).toBe('Flujo');
  });

  it('no confunde una comilla escapada dentro de una cadena con el cierre de esa cadena', () => {
    // Instituciones como el "Banco de la Nación" a veces vienen citadas entre
    // comillas dentro del propio texto. Si `inStr` se apagara con esa comilla
    // escapada, el resto del bloque se leería como fuera de la cadena.
    const html = wrap(`[{"type":"sankey","node":{"label":["Banco \\"Nación\\""]}}]`);
    const { data } = extractPlotlyPayload(html);
    expect(data[0].node.label).toEqual(['Banco "Nación"']);
  });

  it('reconoce una barra invertida escapada justo antes de la comilla de cierre', () => {
    // El caso trampa: `\\"` al final de una cadena. Si el manejo de escapes
    // fuera ingenuo, leería la penúltima barra como el inicio de un escape
    // para la comilla final, se tragaría la comilla y seguiría de largo
    // buscando un cierre que ya pasó.
    const html = wrap('[{"type":"sankey","node":{"label":["ruta\\\\\\\\"]}}]');
    const { data } = extractPlotlyPayload(html);
    expect(data[0].node.label).toEqual(['ruta\\\\']);
  });

  it('falla en vez de devolver algo plausible cuando el JSON viene truncado', () => {
    const html = `
<html><body>
<script>
  Plotly.newPlot(                        "abc-123",                        [{"type":"sankey","node":{"label":["A","B"
</script></body></html>`;
    expect(() => extractPlotlyPayload(html)).toThrow(/no se cerr/i);
  });
});
