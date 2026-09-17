import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DirectorsCarousel from './DirectorsCarousel.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';

function renderWithLang(ui, initialRoute = '/nosotros') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <LanguageProvider>{ui}</LanguageProvider>
    </MemoryRouter>,
  );
}

describe('DirectorsCarousel Component', () => {
  it('renders all 4 director selector pills and initial active director in Spanish', () => {
    renderWithLang(<DirectorsCarousel />, '/nosotros');

    const region = screen.getByRole('region', { name: /Directorio de Especialistas Senior y Directores/i });
    expect(region).toBeInTheDocument();

    // Check 4 tabs
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);

    // Initial director heading
    expect(screen.getByRole('heading', { name: /Director de Auditoría Técnica & Calidad de Datos/i })).toBeInTheDocument();
    expect(screen.getByText(/INTEGRIDAD FORENSE & GOBERNANZA/i)).toBeInTheDocument();
  });

  it('allows switching active director via pill tabs and next/prev arrows', async () => {
    const user = userEvent.setup();
    renderWithLang(<DirectorsCarousel />, '/nosotros');

    // Click next button
    const nextBtn = screen.getByRole('button', { name: /Siguiente perfil de director/i });
    await user.click(nextBtn);

    expect(screen.getByRole('heading', { name: /Director de Arquitectura Cloud & DevOps/i })).toBeInTheDocument();

    // Click previous button
    const prevBtn = screen.getByRole('button', { name: /Perfil de director anterior/i });
    await user.click(prevBtn);

    expect(screen.getByRole('heading', { name: /Director de Auditoría Técnica & Calidad de Datos/i })).toBeInTheDocument();
  });

  it('supports keyboard navigation with ArrowRight and ArrowLeft', async () => {
    const user = userEvent.setup();
    renderWithLang(<DirectorsCarousel />, '/nosotros');

    const region = screen.getByRole('region', { name: /Directorio de Especialistas Senior y Directores/i });
    region.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { name: /Director de Arquitectura Cloud & DevOps/i })).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { name: /Director de Ciencia de Datos & Agentes IA/i })).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('heading', { name: /Director de Arquitectura Cloud & DevOps/i })).toBeInTheDocument();
  });

  it('renders correctly in English when route is /en/about', () => {
    renderWithLang(<DirectorsCarousel />, '/en/about');

    const region = screen.getByRole('region', { name: /Senior Directors Directory/i });
    expect(region).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Lead Technical Auditor & Data Strategist/i })).toBeInTheDocument();
  });
});
