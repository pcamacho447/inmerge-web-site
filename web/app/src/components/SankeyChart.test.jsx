import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SankeyChart from './SankeyChart.jsx';

const newPlot = vi.fn(() => Promise.resolve());
vi.mock('plotly.js-dist-min', () => ({ default: { newPlot: (...a) => newPlot(...a), Plots: { resize: vi.fn() }, purge: vi.fn() } }));

afterEach(() => {
  vi.restoreAllMocks();
  newPlot.mockClear();
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
});
