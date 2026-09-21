import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Servicios from './Servicios.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';

describe('Servicios.jsx Page — Interactive Estimator & Technical Scope', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'es';
  });

  const renderComponent = (initialRoute = '/servicios') =>
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <LanguageProvider>
          <Servicios />
        </LanguageProvider>
      </MemoryRouter>,
    );

  it('renders purified curatorial gallery page in Spanish without redundant banners', () => {
    renderComponent('/servicios');

    // Verifies Monograph Gallery Header is present as primary hero
    expect(screen.getByText(/MONOGRAFÍA DE INGENIERÍA/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Páginas Web' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /01 \/ Páginas Web/i })).toBeInTheDocument();

    // Verifies Monumental Prototype Viewport is rendered
    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByText(/ESPECÍMEN \d\d \/ 09 — VISTA DE PROTOTIPO 1:1/i)).toBeInTheDocument();

    // Verifies noisy and redundant banners/labels have been eliminated
    expect(screen.queryByText(/CATÁLOGO & ESTIMACIÓN CURATORIAL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cédula Curatorial de Ingeniería/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ALCANCE & TIPO DE SOLUCIÓN/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tres pilares, máxima exigencia técnica/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/¿Necesitas una combinación de servicios\?/i)).not.toBeInTheDocument();
  });

  it('allows interacting with pillar tabs in the estimator', () => {
    renderComponent('/servicios');

    const softwareTab = screen.getByRole('tab', { name: /02 \/ Ingeniería de Software/i });
    fireEvent.click(softwareTab);

    expect(screen.getByRole('heading', { level: 3, name: 'Arquitectura Cloud & Microservicios' })).toBeInTheDocument();
  });

  it('renders in English when accessed from /en/services with localized curatorial placard', () => {
    renderComponent('/en/services');

    expect(screen.getByText(/ENGINEERING MONOGRAPH/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Web Development' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /01 \/ Web Development/i })).toBeInTheDocument();
    expect(screen.getByText(/SPECIMEN \d\d \/ 09 — 1:1 PROTOTYPE VIEW/i)).toBeInTheDocument();

    expect(screen.queryByText(/Three strategic pillars, zero technical compromise/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Need a tailored combination of services\?/i)).not.toBeInTheDocument();
  });

  it('renders floating Alaec AI trigger button and opens assistant', () => {
    renderComponent('/servicios');

    const assistantBtn = screen.getByRole('button', { name: /Abrir Asistente IA Alaec/i });
    expect(assistantBtn).toBeInTheDocument();
    fireEvent.click(assistantBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
