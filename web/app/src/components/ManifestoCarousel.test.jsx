import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ManifestoCarousel from './ManifestoCarousel.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';

function renderWithLang(ui, initialRoute = '/nosotros') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <LanguageProvider>{ui}</LanguageProvider>
    </MemoryRouter>,
  );
}

describe('ManifestoCarousel Component', () => {
  it('renders with Mochica geometric motifs and initial active slide', () => {
    renderWithLang(<ManifestoCarousel />, '/nosotros');

    const region = screen.getByRole('region', { name: /Manifiesto de Ingeniería Inmerge/i });
    expect(region).toBeInTheDocument();

    // First slide content
    expect(screen.getByText(/Código Probado, Infraestructura Infalible/i)).toBeInTheDocument();
    expect(screen.getByText(/01 — CI\/CD & SEGURIDAD/i)).toBeInTheDocument();
  });

  it('allows navigating across slides via next/prev buttons', async () => {
    const user = userEvent.setup();
    renderWithLang(<ManifestoCarousel />, '/nosotros');

    const nextBtn = screen.getByRole('button', { name: /Siguiente diapositiva/i });
    await user.click(nextBtn);

    // Second slide content
    expect(screen.getByText(/Cada Dato Rastreable, Sin Ataduras/i)).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /Diapositiva anterior/i });
    await user.click(prevBtn);

    expect(screen.getByText(/Código Probado, Infraestructura Infalible/i)).toBeInTheDocument();
  });

  it('navigates slides using keyboard ArrowRight and ArrowLeft', async () => {
    const user = userEvent.setup();
    renderWithLang(<ManifestoCarousel />, '/nosotros');

    const region = screen.getByRole('region', { name: /Manifiesto de Ingeniería Inmerge/i });
    region.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText(/Cada Dato Rastreable, Sin Ataduras/i)).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText(/El Ingeniero & Auditor Estratégico/i)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText(/Cada Dato Rastreable, Sin Ataduras/i)).toBeInTheDocument();
  });

  it('renders in English when accessed from English route', () => {
    renderWithLang(<ManifestoCarousel />, '/en/about');

    const region = screen.getByRole('region', { name: /Inmerge Engineering Manifesto/i });
    expect(region).toBeInTheDocument();

    expect(screen.getByText(/Tested Code, Resilient Infrastructure/i)).toBeInTheDocument();
  });
});
