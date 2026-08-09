import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SankeyChart from './SankeyChart.jsx';

const newPlot = vi.fn(() => Promise.resolve());
const purge = vi.fn();
vi.mock('plotly.js-dist-min', () => ({
  default: { newPlot: (...a) => newPlot(...a), Plots: { resize: vi.fn() }, purge: (...a) => purge(...a) },
}));

afterEach(() => {
  vi.restoreAllMocks();
  newPlot.mockClear();
  purge.mockClear();
});

describe('SankeyChart', () => {
  it('dibuja con los datos que trae del JSON', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ type: 'sankey' }], layout: {} }) }));
    render(<SankeyChart slug="x" title="Flujo del gasto" />);
    await waitFor(() => expect(newPlot).toHaveBeenCalled());
  });

  it('dice que no se pudo cargar en vez de quedarse en blanco', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
    render(<SankeyChart slug="x" title="Flujo del gasto" />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });

  it('no revienta si la red falla del todo', async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error('offline')));
    render(<SankeyChart slug="x" title="Flujo del gasto" />);
    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });

  it('anuncia el diagrama con un título accesible', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ type: 'sankey' }], layout: {} }) }));
    render(<SankeyChart slug="x" title="Flujo del gasto" />);
    expect(await screen.findByRole('img', { name: /flujo del gasto/i })).toBeInTheDocument();
  });

  it('purga el nodo al desmontar después de haber dibujado', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [{ type: 'sankey' }], layout: {} }) }));
    const { unmount } = render(<SankeyChart slug="x" title="Flujo del gasto" />);
    await waitFor(() => expect(newPlot).toHaveBeenCalled());
    const node = newPlot.mock.calls[0][0];
    unmount();
    expect(purge).toHaveBeenCalledWith(node);
  });

  it('no purga si se desmonta antes de que la carga termine', async () => {
    // El fetch queda pendiente a propósito: el desmonte debe ocurrir mientras
    // el efecto todavía está esperando, así que nunca llega a dibujar y no
    // hay nodo que purgar. Purgar acá sería el bug espejo: limpiar algo que
    // nunca se creó.
    let resolveFetch;
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    globalThis.fetch = vi.fn(() => pending);
    const { unmount } = render(<SankeyChart slug="x" title="Flujo del gasto" />);
    unmount();
    resolveFetch({ ok: true, json: () => Promise.resolve({ data: [{ type: 'sankey' }], layout: {} }) });
    // Deja correr los microtasks para que, si hubiera un bug, newPlot/purge
    // alcancen a dispararse antes de la aserción.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(newPlot).not.toHaveBeenCalled();
    expect(purge).not.toHaveBeenCalled();
  });
});
