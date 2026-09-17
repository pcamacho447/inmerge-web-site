import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCarousel from './ProjectCarousel.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';

describe('ProjectCarousel Component', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'es');
    // Polyfill scrollTo for jsdom
    Element.prototype.scrollTo = vi.fn();
  });

  const renderWithLang = (ui, initialPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <LanguageProvider>
          {ui}
        </LanguageProvider>
      </MemoryRouter>
    );
  };

  it('renders clean editorial carousel header without redundant counter or arrow clutter', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    expect(screen.getByText('CASOS DE ÉXITO & PROYECTOS REALES')).toBeInTheDocument();
    expect(screen.getByText('Resultados de Ingeniería en Días, No en Meses')).toBeInTheDocument();
    expect(screen.getAllByText('Saneamiento y Auditoría Forense de Base de Datos de 18M Registros').length).toBeGreaterThanOrEqual(1);

    // Verify removed clutter
    expect(screen.queryByText(/01 \/ 06/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver proyecto siguiente/i })).not.toBeInTheDocument();
  });

  it('filters projects by pillar and updates active slide items', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    // Click on Pillar 03: Data & AI
    const dataTab = screen.getByRole('tab', { name: /pilar 03: datos & ia/i });
    fireEvent.click(dataTab);

    expect(screen.getAllByText('Asistente RAG & Búsqueda Semántica sobre 50,000 Documentos').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Saneamiento y Auditoría Forense de Base de Datos de 18M Registros')).not.toBeInTheDocument();
  });

  it('jumps directly to card when pagination dot is clicked', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const dots = screen.getAllByRole('button', { name: /ir a tarjeta/i });
    expect(dots.length).toBe(6);

    fireEvent.click(dots[2]); // 3rd card
    expect(dots[2]).toHaveAttribute('aria-current', 'true');
  });

  it('toggles autoplay state on button click', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const autoplayBtn = screen.getByTitle(/pausar auto-slide/i);
    expect(autoplayBtn).toBeInTheDocument();

    fireEvent.click(autoplayBtn);
    expect(screen.getByTitle(/activar auto-slide/i)).toBeInTheDocument();
  });

  it('handles mouse dragging gesture to navigate infinitely', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const track = screen.getByRole('region', { name: /casos de éxito/i }).querySelector('.carousel-track');
    expect(track).toBeInTheDocument();

    // Drag left (> 40px) to advance
    fireEvent.mouseDown(track, { clientX: 200, pageX: 200 });
    fireEvent.mouseMove(track, { clientX: 100, pageX: 100 });
    fireEvent.mouseUp(track, { clientX: 100, pageX: 100 });

    const dots = screen.getAllByRole('button', { name: /ir a tarjeta/i });
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
  });

  it('triggers onQuoteProject callback with project data when CTA is clicked', () => {
    const onQuoteProject = vi.fn();
    renderWithLang(<ProjectCarousel onQuoteProject={onQuoteProject} />);

    const quoteBtns = screen.getAllByRole('button', { name: /cotizar proyecto similar/i });
    fireEvent.click(quoteBtns[0]);

    expect(onQuoteProject).toHaveBeenCalledTimes(1);
    expect(onQuoteProject).toHaveBeenCalledWith(expect.objectContaining({ id: 'audit-fintech-db' }));
  });
});
