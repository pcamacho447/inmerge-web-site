import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LLMAssistantModal from './LLMAssistantModal.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';

describe('LLMAssistantModal Component', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'es');
  });

  const renderWithLang = (ui, initialPath = '/') => {
    return render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[initialPath]}>
        <LanguageProvider>{ui}</LanguageProvider>
      </MemoryRouter>,
    );
  };

  it('renders nothing when isOpen is false', () => {
    renderWithLang(<LLMAssistantModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal with greeting and suggestion chips when isOpen is true', () => {
    renderWithLang(<LLMAssistantModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Alaec/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/escribe una pregunta/i)).toBeInTheDocument();
    expect(screen.getByText('Hablar por WhatsApp →')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithLang(<LLMAssistantModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: /cerrar asistente/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('answers contact queries with official channels', async () => {
    vi.useFakeTimers();
    renderWithLang(<LLMAssistantModal isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(/escribe una pregunta/i);
    const sendBtn = screen.getByRole('button', { name: /enviar mensaje/i });

    fireEvent.change(input, { target: { value: '¿Cuál es su teléfono y correo de contacto?' } });
    fireEvent.click(sendBtn);

    expect(screen.getByText('¿Cuál es su teléfono y correo de contacto?')).toBeInTheDocument();

    // Fast-forward streaming interval to completion
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/contacto@inmerge.pe/i)).toBeInTheDocument();
    expect(screen.getByText(/\+51 957 251 279/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
