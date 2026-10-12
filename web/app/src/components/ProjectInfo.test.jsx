import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectInfo from './ProjectInfo.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';
import { PROJECTS_DATA } from '../data/projectsData.js';

describe('ProjectInfo Component', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'es');
  });

  const renderComponent = (props = {}) => {
    const sampleProject = PROJECTS_DATA[0];
    return render(
      <MemoryRouter>
        <LanguageProvider>
          <ProjectInfo project={sampleProject} {...props} />
        </LanguageProvider>
      </MemoryRouter>,
    );
  };

  it('renders project number, client, industry and short description correctly', () => {
    renderComponent();

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText(/Grupo Financiero & Servicios Corporativos/i)).toBeInTheDocument();
    expect(screen.getByText(/Saneamiento y Auditoría Forense de Base de Datos de 18M Registros/i)).toBeInTheDocument();
    expect(screen.getAllByText(/LCP 0.8s/i).length).toBeGreaterThan(0);
  });

  it('starts with accordion closed and expands when trigger button is clicked', () => {
    renderComponent();

    const triggerBtn = screen.getByRole('button', { name: /ver detalles técnicos/i });
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/STACK TECNOLÓGICO/i)).not.toBeInTheDocument();

    // Click trigger to expand
    fireEvent.click(triggerBtn);

    expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/ESPECIFICACIONES TÉCNICAS/i)).toBeInTheDocument();
    expect(screen.getByText(/CONDICIONES DE ENTREGA & SLA/i)).toBeInTheDocument();
    expect(screen.getByText(/STACK TECNOLÓGICO/i)).toBeInTheDocument();
    expect(screen.getAllByText(/React 18/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/RESULTADOS AUDITABLES/i)).toBeInTheDocument();
  });

  it('toggles accordion with Enter and Space keyboard navigation', () => {
    renderComponent();

    const triggerBtn = screen.getByRole('button', { name: /ver detalles técnicos/i });

    // Press Space
    fireEvent.keyDown(triggerBtn, { key: ' ' });
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');

    // Press Enter
    fireEvent.keyDown(triggerBtn, { key: 'Enter' });
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
  });
});
