import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Nosotros from './Nosotros.jsx';

describe('Nosotros Page (Redesigned — Cinematic Hero + ManifestoCarousel + DirectorsCarousel)', () => {
  it('renders the cinematic hero header and core manifest', () => {
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Somos una firma boutique especializada en ingeniería de software/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /^Propósito$/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Misión$/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Visión$/i, level: 3 })).toBeInTheDocument();
  });

  it('renders the 4 methodology stages via the unified Bento Grid', () => {
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    expect(screen.getByText(/4 Etapas de Rigor Metodológico/i)).toBeInTheDocument();
    expect(screen.getByText('Auditoría & Diagnóstico Inicial')).toBeInTheDocument();
    expect(screen.getByText('Arquitectura & Diseño de Solución')).toBeInTheDocument();
    expect(screen.getByText('Ingeniería, Desarrollo & Modelado')).toBeInTheDocument();
    expect(screen.getByText('Validación, Certificación & Despliegue')).toBeInTheDocument();
  });

  it('renders the curated technology stack matrix directly', () => {
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Ecosistema Tecnológico & Estándares Abiertos/i)).toBeInTheDocument();
    expect(screen.getByText('Amazon Web Services (AWS)')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('renders the 4 practice directors via DirectorsCarousel', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    // Directors Carousel region
    const directorsCarousel = screen.getByRole('region', {
      name: /Directorio de Especialistas Senior y Directores/i,
    });
    expect(directorsCarousel).toBeInTheDocument();

    // Initial active director profile heading
    expect(screen.getByRole('heading', { name: /Director de Auditoría Técnica & Calidad de Datos/i })).toBeInTheDocument();
    expect(screen.getByText(/La integridad de la información no es un supuesto de fe/i)).toBeInTheDocument();

    // Switch to Cloud Director via pill button
    const cloudPill = screen.getByRole('tab', {
      name: /Director de Arquitectura Cloud & DevOps/i,
    });
    await user.click(cloudPill);

    expect(screen.getByRole('heading', { name: /Director de Arquitectura Cloud & DevOps/i })).toBeInTheDocument();
    expect(screen.getByText(/Una plataforma empresarial resiliente no depende de la suerte/i)).toBeInTheDocument();
  });
});
