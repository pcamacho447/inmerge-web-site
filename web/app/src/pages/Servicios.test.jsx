import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Servicios from './Servicios.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';
import * as esContent from '../data/content.js';
import * as enContent from '../data/content.en.js';

describe('Servicios.jsx Page — Accordion & Pillar Filtering', () => {
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

  it('renders catalog header and all services by default in Spanish', () => {
    renderComponent('/servicios');

    expect(screen.getByText(/CATÁLOGO DE SERVICIOS/i)).toBeInTheDocument();
    expect(screen.getByText(/Tres pilares, máxima exigencia técnica/i)).toBeInTheDocument();

    const allFilterBtn = screen.getByRole('button', { name: new RegExp(`Todos los servicios \\(${esContent.SERVICES.length}\\)`, 'i') });
    expect(allFilterBtn).toBeInTheDocument();

    // Verifies all service details are present in the DOM for searchability
    const detailsElements = document.querySelectorAll('details[name="inmerge-services"]');
    expect(detailsElements.length).toBe(esContent.SERVICES.length);
  });

  it('filters services when selecting a specific pillar tab', () => {
    renderComponent('/servicios');

    const pilar1Btn = screen.getByRole('button', { name: /Pilar 01: Auditoría Técnica y de Datos/i });
    fireEvent.click(pilar1Btn);

    const pilar1Services = esContent.SERVICES.filter((s) => s.pillarId === 'auditoria');
    const renderedDetails = document.querySelectorAll('details[name="inmerge-services"]');
    expect(renderedDetails.length).toBe(pilar1Services.length);

    // Verify a service from pillar 01 is present
    expect(screen.getByText(pilar1Services[0].name)).toBeInTheDocument();
  });

  it('renders in English when accessed from /en/services with localized headers and services', () => {
    renderComponent('/en/services');

    expect(screen.getByText(/SERVICES CATALOG/i)).toBeInTheDocument();
    expect(screen.getByText(/Three strategic pillars, zero technical compromise/i)).toBeInTheDocument();

    const allFilterBtn = screen.getByRole('button', { name: new RegExp(`All services \\(${enContent.SERVICES.length}\\)`, 'i') });
    expect(allFilterBtn).toBeInTheDocument();

    const firstEnService = enContent.SERVICES[0];
    expect(screen.getByText(firstEnService.name)).toBeInTheDocument();
    const deliverablesHeadings = screen.getAllByText(/TANGIBLE DELIVERABLES/i);
    expect(deliverablesHeadings.length).toBe(enContent.SERVICES.length);
  });

  it('contains accessible summary triggers and action CTAs', () => {
    renderComponent('/servicios');

    const firstDetails = document.querySelector('details[name="inmerge-services"]');
    expect(firstDetails).toBeInTheDocument();
    expect(firstDetails).toHaveAttribute('name', 'inmerge-services');

    const summary = firstDetails.querySelector('summary');
    expect(summary).toBeInTheDocument();

    const tdrLinks = screen.getAllByText(/Solicitar TDR/i);
    expect(tdrLinks.length).toBeGreaterThan(0);
    expect(tdrLinks[0].closest('a')).toHaveAttribute('href', expect.stringContaining('/contacto?servicio='));
  });
});
