import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Metodologia from './Metodologia.jsx';

describe('Metodologia Page', () => {
  it('renders the header and the 4 methodology stages', () => {
    render(
      <MemoryRouter>
        <Metodologia />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Ingeniería rigurosa, auditoría estricta y datos reproducibles/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Auditoría & Diagnóstico Inicial')).toBeInTheDocument();
    expect(screen.getByText('Validación, Certificación & Despliegue')).toBeInTheDocument();
  });

  it('renders the technology stack matrix directly in the unified view', () => {
    render(
      <MemoryRouter>
        <Metodologia />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Ecosistema Tecnológico & Estándares Abiertos/i)).toBeInTheDocument();
    expect(screen.getByText('Amazon Web Services (AWS)')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('renders the ManifestoCarousel with engineering assurance content', () => {
    render(
      <MemoryRouter>
        <Metodologia />
      </MemoryRouter>,
    );

    // ManifestoCarousel renders as carousel region
    const carousel = screen.getByRole('region', { name: /Manifiesto de Ingeniería Inmerge/i });
    expect(carousel).toBeInTheDocument();
  });
});
