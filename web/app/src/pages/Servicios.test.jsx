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

  it('renders services & estimation header in Spanish', () => {
    renderComponent('/servicios');

    expect(screen.getByText(/SERVICIOS & ESTIMACIÓN ÁGIL/i)).toBeInTheDocument();
    expect(screen.getByText(/Tres pilares, máxima exigencia técnica/i)).toBeInTheDocument();

    // Verifies QuickEstimator is present
    expect(screen.getByText(/PRECIOS Y TIEMPOS TRANSPARENTES/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/1. Pilar Estratégico:/i)).toBeInTheDocument();
  });

  it('allows interacting with pillar selector in the estimator', () => {
    renderComponent('/servicios');

    const pillarSelect = screen.getByLabelText(/1. Pilar Estratégico:/i);
    fireEvent.change(pillarSelect, { target: { value: 'desarrollo' } });

    expect(screen.getByText('Desarrollo Tecnológico & Cloud')).toBeInTheDocument();
  });

  it('renders in English when accessed from /en/services with localized headers', () => {
    renderComponent('/en/services');

    expect(screen.getByText(/SERVICES & ESTIMATION/i)).toBeInTheDocument();
    expect(screen.getByText(/Three strategic pillars, zero technical compromise/i)).toBeInTheDocument();
    expect(screen.getByText(/TRANSPARENT & FAST PRICING/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/1. Strategic Pillar:/i)).toBeInTheDocument();
  });

  it('contains bottom CTA banner and TDR links', () => {
    renderComponent('/servicios');

    expect(screen.getByText(/¿Necesitas una combinación de servicios\?/i)).toBeInTheDocument();
    const tdrBtn = screen.getByText(/Completar Formulario de TDR/i);
    expect(tdrBtn).toBeInTheDocument();
    expect(tdrBtn.closest('a')).toHaveAttribute('href', '/contacto');
  });
});
