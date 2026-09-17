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

  it('renders carousel header and initial case studies in Spanish with deck counter', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    expect(screen.getByText('CASOS DE ÉXITO & PROYECTOS REALES')).toBeInTheDocument();
    expect(screen.getByText('Resultados de Ingeniería en Días, No en Meses')).toBeInTheDocument();
    expect(screen.getByText('Saneamiento y Auditoría Forense de Base de Datos de 18M Registros')).toBeInTheDocument();
    expect(screen.getByText(/01 \/ 06/)).toBeInTheDocument();
  });

  it('filters projects by pillar and updates deck counter', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    // Click on Pillar 03: Data & AI
    const dataTab = screen.getByRole('tab', { name: /pilar 03: datos & ia/i });
    fireEvent.click(dataTab);

    expect(screen.getByText('Asistente RAG & Búsqueda Semántica sobre 50,000 Documentos')).toBeInTheDocument();
    expect(screen.queryByText('Saneamiento y Auditoría Forense de Base de Datos de 18M Registros')).not.toBeInTheDocument();
    expect(screen.getByText(/01 \/ 02/)).toBeInTheDocument();
  });

  it('navigates next and prev slides using arrows and updates active slide counter', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const nextBtn = screen.getByRole('button', { name: /ver proyecto siguiente/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/02 \/ 06/)).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /ver proyecto anterior/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText(/01 \/ 06/)).toBeInTheDocument();
  });

  it('jumps directly to card when pagination dot is clicked', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const dots = screen.getAllByRole('button', { name: /ir a tarjeta/i });
    expect(dots.length).toBe(6);

    fireEvent.click(dots[2]); // 3rd card
    expect(screen.getByText(/03 \/ 06/)).toBeInTheDocument();
  });

  it('toggles autoplay state on button click', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const autoplayBtn = screen.getByTitle(/pausar auto-slide/i);
    expect(autoplayBtn).toBeInTheDocument();

    fireEvent.click(autoplayBtn);
    expect(screen.getByTitle(/activar auto-slide/i)).toBeInTheDocument();
  });

  it('handles mouse dragging gesture to advance slides', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    const track = screen.getByRole('region', { name: /casos de éxito/i }).querySelector('.carousel-track');
    expect(track).toBeInTheDocument();

    // Drag left (> 50px) to go next
    fireEvent.mouseDown(track, { clientX: 200, pageX: 200 });
    fireEvent.mouseMove(track, { clientX: 100, pageX: 100 });
    fireEvent.mouseUp(track, { clientX: 100, pageX: 100 });

    expect(screen.getByText(/02 \/ 06/)).toBeInTheDocument();
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
