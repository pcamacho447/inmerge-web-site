import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ToastNotification from './ToastNotification.jsx';

describe('ToastNotification', () => {
  it('renders nothing when toast is null', () => {
    const { container } = render(<ToastNotification toast={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders lead toast notification with correct badges and title', () => {
    const mockToast = {
      type: 'lead',
      title: 'Nuevo Lead TDR Recibido',
      message: 'Antamina ha enviado una solicitud (auditoria).',
    };

    render(<ToastNotification toast={mockToast} onDismiss={vi.fn()} />);

    expect(screen.getByText('LEAD TDR')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Lead TDR Recibido')).toBeInTheDocument();
    expect(screen.getByText('Antamina ha enviado una solicitud (auditoria).')).toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    const mockToast = {
      type: 'deliverable',
      title: 'Entregable Publicado',
      message: 'Informe de Auditoria.pdf',
    };

    render(<ToastNotification toast={mockToast} onDismiss={onDismiss} />);

    const closeBtn = screen.getByRole('button', { name: /cerrar notificación/i });
    fireEvent.click(closeBtn);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const mockToast = {
      type: 'info',
      title: 'Auditoría',
      message: 'Descarga forense registrada',
    };

    render(<ToastNotification toast={mockToast} onDismiss={onDismiss} duration={3000} />);

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
