import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Servicios from './Servicios.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';

describe('Servicios.jsx Page — Continuous Project Gallery & Technical Scope', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'es';
    window.IntersectionObserver = vi.fn().mockImplementation(function () {
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    });
  });

  const renderComponent = (initialRoute = '/servicios') =>
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <LanguageProvider>
          <Servicios />
        </LanguageProvider>
      </MemoryRouter>,
    );

  it('renders continuous project feed gallery in Spanish as primary exhibition', () => {
    renderComponent('/servicios');

    // Verifies ProjectFeed header is present
    expect(screen.getByRole('region', { name: /Portafolio de Proyectos e Ingeniería/i })).toBeInTheDocument();
    expect(screen.getByText(/Sistemas Empresariales & Plataformas Web Destacadas/i)).toBeInTheDocument();

    // Verifies project numbers are rendered
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();

    // Verifies noisy and redundant estimator banners are eliminated
    expect(screen.queryByText(/CATÁLOGO & ESTIMACIÓN CURATORIAL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cédula Curatorial de Ingeniería/i)).not.toBeInTheDocument();
  });

  it('renders in English when accessed from /en/services with localized project feed', () => {
    renderComponent('/en/services');

    expect(screen.getByRole('region', { name: /Engineering Projects & Case Studies/i })).toBeInTheDocument();
    expect(screen.getByText(/Featured Client Systems & Web Platforms/i)).toBeInTheDocument();
  });

  it('renders floating Alaec AI trigger button and opens assistant', () => {
    renderComponent('/servicios');

    const assistantBtn = screen.getByRole('button', { name: /Abrir Asistente IA Alaec/i });
    expect(assistantBtn).toBeInTheDocument();
    fireEvent.click(assistantBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
