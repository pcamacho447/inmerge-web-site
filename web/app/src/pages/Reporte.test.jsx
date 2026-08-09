import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Reporte from './Reporte.jsx';

vi.mock('../components/SankeyChart.jsx', () => ({ default: () => <div data-testid="sankey" /> }));
vi.mock('../hooks/useReportDownload.js', () => ({
  default: () => ({ downloadingId: null, downloadError: { id: null, message: '' }, handleDownload: vi.fn() }),
}));

const REPORT = {
  id: 'r1',
  slug: 'de-donde-viene-la-plata',
  title: 'De dónde viene la plata',
  summary: 'La recaudación propia del Estado peruano.',
  key_figure: '34.9%',
  key_figure_label: 'de los recursos propios del Estado son deuda.',
  sources: [{ nombre: 'SIAF-SP, MEF', url: 'https://www.mef.gob.pe/' }],
};

let mockState = { report: REPORT, loading: false, notFound: false, error: '' };
let mockUser = null;
vi.mock('../hooks/useReport.js', () => ({ default: () => mockState }));
vi.mock('../lib/auth.jsx', () => ({ useAuth: () => ({ user: mockUser }) }));

function show() {
  return render(
    <MemoryRouter initialEntries={['/reportes/de-donde-viene-la-plata']}>
      <Routes>
        <Route path="/reportes/:slug" element={<Reporte />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Reporte', () => {
  // Sin esto, cada test hereda el mockUser del anterior: el caso "sin sesion"
  // pasaria solo por venir despues de otro que tampoco tenia sesion, y el dia
  // que alguien reordene los tests, empiezan a fallar sin que nada cambie.
  beforeEach(() => {
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    mockUser = null;
  });

  it('muestra la cifra clave y su explicación', () => {
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByText('34.9%')).toBeInTheDocument();
    expect(screen.getByText(/son deuda/i)).toBeInTheDocument();
  });

  it('muestra las fuentes con su enlace', () => {
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByRole('link', { name: /SIAF-SP, MEF/i })).toHaveAttribute('href', 'https://www.mef.gob.pe/');
  });

  it('sin sesión invita a crear cuenta, no a comprar', () => {
    mockUser = null;
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
    expect(screen.queryByText(/comprar|precio|S\/ ?\d/i)).not.toBeInTheDocument();
  });

  it('con sesión ofrece descargar', () => {
    mockUser = { id: 'u1', email: 'a@b.pe' };
    mockState = { report: REPORT, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByRole('button', { name: /descargar/i })).toBeInTheDocument();
  });

  it('un reporte sin cifra clave no rompe la página', () => {
    mockState = { report: { ...REPORT, key_figure: null, key_figure_label: null }, loading: false, notFound: false, error: '' };
    show();
    expect(screen.getByText('De dónde viene la plata')).toBeInTheDocument();
    expect(screen.queryByText('34.9%')).not.toBeInTheDocument();
  });

  it('un slug inexistente dice que no existe, no se queda cargando', () => {
    mockState = { report: null, loading: false, notFound: true, error: '' };
    show();
    expect(screen.getByText(/no encontramos/i)).toBeInTheDocument();
  });
});
