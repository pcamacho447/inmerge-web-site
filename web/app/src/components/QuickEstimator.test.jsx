import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuickEstimator from './QuickEstimator.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';

describe('QuickEstimator Component (Cédula Curatorial)', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'es');
  });

  const renderWithLang = (ui, initialPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <LanguageProvider>{ui}</LanguageProvider>
      </MemoryRouter>,
    );
  };

  it('renders title, the 3 canonical service lines and initial solution placard in Spanish', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    // Header & Section
    expect(screen.getByRole('region', { name: /cotizador editorial y cédula de servicios/i })).toBeInTheDocument();
    expect(screen.getByText('MONOGRAFÍA DE INGENIERÍA')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Páginas Web' })).toBeInTheDocument();

    // The 3 canonical lines in the line selector
    expect(screen.getByRole('tab', { name: /01 \/ Páginas Web/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /02 \/ Ingeniería de Software/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /03 \/ Inteligencia de Negocios/i })).toBeInTheDocument();

    // Default line is web_pages, default solution is Landing de Alto Impacto
    expect(screen.getByText('INM-CAT-2026.01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Landing Page de Alto Impacto' })).toBeInTheDocument();
    expect(screen.getByText(/~1 a 2 semanas/i)).toBeInTheDocument();
    expect(screen.getByText(/S\/ 2,400 PEN/i)).toBeInTheDocument();
  });

  it('switches service line and renders corresponding solutions', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    // Switch to Software Engineering (tab 02)
    const softwareTab = screen.getByRole('tab', { name: /02 \/ Ingeniería de Software/i });
    fireEvent.click(softwareTab);

    // Verify solutions for Software Engineering appear
    expect(screen.getByText('INM-CAT-2026.04')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Arquitectura Cloud & Microservicios' })).toBeInTheDocument();
    expect(screen.getByText(/S\/ 6,500 PEN/i)).toBeInTheDocument();

    // Switch to Business Intelligence (tab 03)
    const biTab = screen.getByRole('tab', { name: /03 \/ Inteligencia de Negocios/i });
    fireEvent.click(biTab);

    expect(screen.getByText('INM-CAT-2026.07')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Auditoría Técnica & Saneamiento de Datos' })).toBeInTheDocument();
    expect(screen.getByText(/S\/ 3,900 PEN/i)).toBeInTheDocument();
  });

  it('switches currency between PEN and USD', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    // Initially in PEN
    expect(screen.getByText(/S\/ 2,400 PEN/i)).toBeInTheDocument();

    // Toggle currency to USD
    const usdBtn = screen.getByRole('button', { name: /usd/i });
    fireEvent.click(usdBtn);

    expect(screen.getByText(/\$650 USD/i)).toBeInTheDocument();
  });

  it('switches solution within the same line', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    // Click on solution 2 of web_pages: Sitio Web Corporativo Editorial
    const corporateBtn = screen.getByRole('button', { name: /sitio web corporativo editorial/i });
    fireEvent.click(corporateBtn);

    expect(screen.getByText('INM-CAT-2026.02')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Sitio Web Corporativo Editorial' })).toBeInTheDocument();
    expect(screen.getByText(/~2 a 4 semanas/i)).toBeInTheDocument();
    expect(screen.getByText(/S\/ 4,500 PEN/i)).toBeInTheDocument();
  });

  it('renders properly in English when on /en path', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />, '/en');

    expect(screen.getByText('ENGINEERING MONOGRAPH')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Web Development' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /01 \/ Web Development/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /02 \/ Software Engineering/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /03 \/ Business Intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'High-Impact Landing Page' })).toBeInTheDocument();
    expect(screen.getByText(/~1 to 2 weeks/i)).toBeInTheDocument();
  });

  it('calls onOpenLLMAssistant callback with the selected solution', () => {
    const onOpenLLMAssistant = vi.fn();
    renderWithLang(<QuickEstimator onOpenLLMAssistant={onOpenLLMAssistant} />);

    const llmBtn = screen.getByRole('button', { name: /consultar con alaec/i });
    fireEvent.click(llmBtn);

    expect(onOpenLLMAssistant).toHaveBeenCalledTimes(1);
    expect(onOpenLLMAssistant).toHaveBeenCalledWith(
      expect.objectContaining({
        pillar: 'web_pages',
        pillarName: 'Páginas Web',
        solutionId: 'landing_alto_impacto',
      }),
    );
  });

  it('renders monumental prototype window with specimen image and updates on selection', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    // Check figure and specimen badge
    const figure = screen.getByRole('figure');
    expect(figure).toBeInTheDocument();
    expect(screen.getByText(/ESPECÍMEN \d\d \/ 09 — VISTA DE PROTOTIPO 1:1/i)).toBeInTheDocument();

    // Default image for web_pages -> landing_alto_impacto is b2b-portal.jpg
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/projects/b2b-portal.jpg');
    expect(img).toHaveAttribute('alt', 'Prototipo visual de Landing Page de Alto Impacto');

    // Switch to Software Engineering (tab 02)
    const softwareTab = screen.getByRole('tab', { name: /02 \/ Ingeniería de Software/i });
    fireEvent.click(softwareTab);

    // Image updates to aws-cloud.jpg
    expect(screen.getByRole('img')).toHaveAttribute('src', '/projects/aws-cloud.jpg');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Prototipo visual de Arquitectura Cloud y Microservicios');
  });

  it('opens full-scale Lightbox modal on image container click and closes on close button', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    // Lightbox should not be in the DOM initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Find and click the inspection button
    const inspectButton = screen.getByRole('button', { name: /inspeccionar/i });
    fireEvent.click(inspectButton);

    // Dialog opens
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/\[ ESC \]/i)).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /cerrar visor/i });
    fireEvent.click(closeBtn);

    // Dialog closes
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes Lightbox modal on Escape key press and on backdrop click', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    // Open lightbox
    const inspectButton = screen.getByRole('button', { name: /inspeccionar/i });
    fireEvent.click(inspectButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Reopen and close by clicking the backdrop
    fireEvent.click(inspectButton);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cycles solutions using ArrowRight and ArrowLeft keyboard shortcuts', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    // Initially solution 1: Landing Page de Alto Impacto
    expect(screen.getByRole('heading', { level: 3, name: 'Landing Page de Alto Impacto' })).toBeInTheDocument();

    // Press ArrowRight -> moves to solution 2: Sitio Web Corporativo Editorial
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { level: 3, name: 'Sitio Web Corporativo Editorial' })).toBeInTheDocument();

    // Press ArrowRight -> moves to solution 3: Portal Web Interactivo a Medida
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { level: 3, name: 'Portal Web Interactivo a Medida' })).toBeInTheDocument();

    // Press ArrowRight again -> wraps around to solution 1
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { level: 3, name: 'Landing Page de Alto Impacto' })).toBeInTheDocument();

    // Press ArrowLeft -> wraps to solution 3
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByRole('heading', { level: 3, name: 'Portal Web Interactivo a Medida' })).toBeInTheDocument();
  });
});
