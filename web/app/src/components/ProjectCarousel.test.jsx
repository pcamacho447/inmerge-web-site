import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCarousel from './ProjectCarousel.jsx';
import AnimatedNumber, { parseMetric } from './AnimatedNumber.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';

describe('ProjectCarousel / ProjectShowcase Component', () => {
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

  it('renders high-engineering editorial header on continuous canvas without card containers', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    expect(screen.getByText('CASOS DE ESTUDIO · ARQUITECTURA FORENSE')).toBeInTheDocument();
    expect(screen.getByText('Ingeniería en Producción: Evidencia técnica y resultados auditables.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Casos representativos de auditoría de datos, modernización cloud en AWS e inteligencia predictiva implementados en producción.',
      ),
    ).toBeInTheDocument();

    // Verify initial active project exists in the canvas
    expect(screen.getAllByText('Saneamiento y Auditoría Forense de Base de Datos de 18M Registros').length).toBeGreaterThanOrEqual(1);
  });

  it('renders master index tablist with all 6 engineering cases and KPI highlights', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const tablist = screen.getByRole('tablist', { name: /índice de casos de estudio técnicos/i });
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(6);

    // Verify first tab is selected by default
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

    // Verify presence of other cases in the index
    expect(screen.getByText('Auditoría de Seguridad, IAM y Optimización de Costos en AWS Cloud')).toBeInTheDocument();
    expect(screen.getByText('Modernización de Plataforma de Microservicios & API Gateway')).toBeInTheDocument();
    expect(screen.getByText('Asistente RAG & Búsqueda Semántica sobre 50,000 Documentos')).toBeInTheDocument();
  });

  it('renders technical architecture blueprints, challenge/solution, and deliverables in detail canvas', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    expect(screen.getByText('ARQUITECTURA DE SISTEMA')).toBeInTheDocument();
    expect(screen.getByText('Zero-Loss Forensic Pipeline')).toBeInTheDocument();
    expect(screen.getByText('El Desafío Técnico')).toBeInTheDocument();
    expect(screen.getByText('Solución & Arquitectura Inmerge')).toBeInTheDocument();
    expect(screen.getByText('ENTREGABLES AUDITABLES GENERADOS:')).toBeInTheDocument();
    expect(screen.getByText('Scripts SQL de saneamiento reproducibles')).toBeInTheDocument();
  });

  it('switches active case study when an index tab is clicked', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // Click on the 2nd tab (AWS audit)
    fireEvent.click(tabs[1]);

    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    // Verify updated detail canvas content
    expect(screen.getByText('AWS Well-Architected Security')).toBeInTheDocument();
    expect(screen.getByText('Matriz de permisos IAM auditada')).toBeInTheDocument();
  });

  it('navigates through tabs via keyboard arrow keys (WCAG 2.1 AA)', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const tablist = screen.getByRole('tablist', { name: /índice de casos de estudio técnicos/i });
    const tabs = screen.getAllByRole('tab');

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // ArrowDown advances to next
    fireEvent.keyDown(tablist, { key: 'ArrowDown' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    // ArrowUp returns to previous
    fireEvent.keyDown(tablist, { key: 'ArrowUp' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // End key jumps to last
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(tabs[5]).toHaveAttribute('aria-selected', 'true');

    // Home key jumps to first
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to next and previous case using sequential stepper buttons', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const nextBtn = screen.getByRole('button', { name: /siguiente caso de estudio/i });
    const prevBtn = screen.getByRole('button', { name: /caso de estudio anterior/i });
    const tabs = screen.getAllByRole('tab');

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(nextBtn);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(prevBtn);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('triggers onQuoteProject callback with active project data when CTA is clicked', () => {
    const onQuoteProject = vi.fn();
    renderWithLang(<ProjectCarousel onQuoteProject={onQuoteProject} />);

    const quoteBtn = screen.getByRole('button', { name: /cotizar proyecto similar en sprints/i });
    fireEvent.click(quoteBtn);

    expect(onQuoteProject).toHaveBeenCalledTimes(1);
    expect(onQuoteProject).toHaveBeenCalledWith(expect.objectContaining({ id: 'audit-fintech-db' }));
  });

  it('supports document.startViewTransition when available in modern browsers', () => {
    const originalStartViewTransition = document.startViewTransition;
    const mockTransition = vi.fn().mockImplementation(({ update }) => {
      update();
    });
    document.startViewTransition = mockTransition;

    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]);

    expect(mockTransition).toHaveBeenCalledTimes(1);
    expect(mockTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        types: ['forward'],
      }),
    );

    document.startViewTransition = originalStartViewTransition;
  });

  it('gracefully degrades without animation when prefers-reduced-motion is active', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const mockTransition = vi.fn();
    document.startViewTransition = mockTransition;

    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);

    // When reduced motion is preferred, state updates directly without invoking transition
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(mockTransition).not.toHaveBeenCalled();

    window.matchMedia = originalMatchMedia;
    delete document.startViewTransition;
  });
});

describe('AnimatedNumber Component & Metric Parser', () => {
  it('correctly parses complex metric strings into parts', () => {
    expect(parseMetric('+40%')).toEqual({ prefix: '+', number: 40, suffix: '%', decimals: 0 });
    expect(parseMetric('18M')).toEqual({ prefix: '', number: 18, suffix: 'M', decimals: 0 });
    expect(parseMetric('99.98%')).toEqual({ prefix: '', number: 99.98, suffix: '%', decimals: 2 });
    expect(parseMetric('$1.2M')).toEqual({ prefix: '$', number: 1.2, suffix: 'M', decimals: 1 });
    expect(parseMetric('-84%')).toEqual({ prefix: '-', number: 84, suffix: '%', decimals: 0 });
  });

  it('renders final metric value immediately when prefers-reduced-motion is on', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<AnimatedNumber value="99.98%" trigger={true} />);
    expect(screen.getByText('99.98%')).toBeInTheDocument();

    window.matchMedia = originalMatchMedia;
  });
});
