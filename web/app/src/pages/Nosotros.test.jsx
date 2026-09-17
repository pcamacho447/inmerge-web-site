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
        name: /Ingeniería rigurosa, auditoría estricta y datos reproducibles/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('LA FIRMA // INMERGE')).toBeInTheDocument();
    expect(screen.getByText(/Garantía de Verdad Operativa/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingeniería sin Cajas Negras/i)).toBeInTheDocument();
    expect(screen.getByText(/Referencia Técnica Regional/i)).toBeInTheDocument();
  });

  it('renders the ManifestoCarousel with engineering assurance content', () => {
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    // ManifestoCarousel renders as region with carousel role
    const carousel = screen.getByRole('region', { name: /Manifiesto de Ingeniería Inmerge/i });
    expect(carousel).toBeInTheDocument();

    // First slide content should be visible
    expect(screen.getByText(/Código Probado, Infraestructura Infalible/i)).toBeInTheDocument();
  });

  it('renders the 4 methodology stages via the Método tab', () => {
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    // The method tab should be active by default
    expect(screen.getByRole('tab', { name: /El Método \(4 Etapas\)/i })).toBeInTheDocument();
    expect(screen.getByText('Auditoría & Diagnóstico Inicial')).toBeInTheDocument();
    expect(screen.getByText('Validación, Certificación & Despliegue')).toBeInTheDocument();
  });

  it('switches to Stack tab and shows technology content', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    // Switch to Stack tab
    const stackTab = screen.getByRole('tab', { name: /Stack Tecnológico/i });
    await user.click(stackTab);

    // StackTabs component should render
    expect(screen.getByText('Amazon Web Services (AWS)')).toBeInTheDocument();
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

  it('expands a commitment accordion item on click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    // Click on "Rigor y Trazabilidad" to expand
    const rigorItem = screen.getByText('Rigor y Trazabilidad').closest('[role="button"]');
    await user.click(rigorItem);

    expect(rigorItem).toHaveAttribute('aria-expanded', 'true');
  });
});
