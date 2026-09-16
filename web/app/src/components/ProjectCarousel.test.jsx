import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCarousel from './ProjectCarousel.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';

describe('ProjectCarousel Component', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'es');
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

  it('renders carousel header and initial case studies in Spanish', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    expect(screen.getByText('CASOS DE ÉXITO & PROYECTOS REALES')).toBeInTheDocument();
    expect(screen.getByText('Resultados de Ingeniería en Días, No en Meses')).toBeInTheDocument();
    expect(screen.getByText('Saneamiento y Auditoría Forense de Base de Datos de 18M Registros')).toBeInTheDocument();
  });

  it('filters projects by pillar when filter tabs are clicked', () => {
    renderWithLang(<ProjectCarousel onQuoteProject={vi.fn()} />);

    // Click on Pillar 03: Data & AI
    const dataTab = screen.getByRole('tab', { name: /pilar 03: datos & ia/i });
    fireEvent.click(dataTab);

    expect(screen.getByText('Asistente RAG & Búsqueda Semántica sobre 50,000 Documentos')).toBeInTheDocument();
    expect(screen.queryByText('Saneamiento y Auditoría Forense de Base de Datos de 18M Registros')).not.toBeInTheDocument();
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
