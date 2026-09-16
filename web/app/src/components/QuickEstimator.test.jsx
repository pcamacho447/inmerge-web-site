import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuickEstimator from './QuickEstimator.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';

describe('QuickEstimator Component', () => {
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

  it('renders title and default calculations correctly', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    expect(screen.getByText('Estima tu Proyecto en 30 Segundos')).toBeInTheDocument();
    expect(screen.getByText('Auditoría Técnica y de Datos')).toBeInTheDocument();
    expect(screen.getByText(/días hábiles/i)).toBeInTheDocument();
  });

  it('updates calculation metrics when pillar or scope changes', () => {
    renderWithLang(<QuickEstimator onOpenLLMAssistant={vi.fn()} />);

    const pillarSelect = screen.getByLabelText(/1. Pilar Estratégico:/i);
    fireEvent.change(pillarSelect, { target: { value: 'desarrollo' } });

    expect(screen.getByText('Desarrollo Tecnológico & Cloud')).toBeInTheDocument();
  });

  it('calls onOpenLLMAssistant callback with estimated parameters', () => {
    const onOpenLLMAssistant = vi.fn();
    renderWithLang(<QuickEstimator onOpenLLMAssistant={onOpenLLMAssistant} />);

    const llmBtn = screen.getByRole('button', { name: /consultar con asistente llm/i });
    fireEvent.click(llmBtn);

    expect(onOpenLLMAssistant).toHaveBeenCalledTimes(1);
    expect(onOpenLLMAssistant).toHaveBeenCalledWith(
      expect.objectContaining({
        pillar: 'auditoria',
        scope: 'estandar',
        volume: 'corporativo',
      })
    );
  });
});
