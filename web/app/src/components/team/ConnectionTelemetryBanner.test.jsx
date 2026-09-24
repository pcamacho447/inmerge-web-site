import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectionTelemetryBanner from './ConnectionTelemetryBanner.jsx';

describe('ConnectionTelemetryBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Offline State Rendering', () => {
    it('renderiza banner de alerta cuando isOnline es false', () => {
      render(<ConnectionTelemetryBanner isOnline={false} />);

      const alertBanner = screen.getByRole('alert');
      expect(alertBanner).toBeInTheDocument();
      expect(alertBanner).toHaveTextContent(/SIN CONEXIÓN DE RED/i);
    });

    it('incluye atributos ARIA para accesibilidad en estado offline', () => {
      render(<ConnectionTelemetryBanner isOnline={false} />);

      const banner = screen.getByRole('alert');
      expect(banner).toHaveAttribute('aria-live', 'assertive');
    });

    it('permite reintentar si se proporciona callback onRetry en estado offline', async () => {
      const user = userEvent.setup();
      const handleRetry = vi.fn();

      render(<ConnectionTelemetryBanner isOnline={false} onRetry={handleRetry} />);

      const retryBtn = screen.getByRole('button', { name: /Reintentar conexión/i });
      expect(retryBtn).toBeInTheDocument();

      await user.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reconnecting Realtime State Rendering', () => {
    it('renderiza mensaje de reconexión cuando la red está activa pero la telemetría se está restableciendo', () => {
      render(<ConnectionTelemetryBanner isOnline={true} isRealtimeActive={false} connectionStatus="CONNECTING" />);

      const statusBanner = screen.getByRole('status');
      expect(statusBanner).toBeInTheDocument();
      expect(statusBanner).toHaveTextContent(/Reconectando telemetría en tiempo real/i);
    });

    it('renderiza aviso cuando el estado de canal es CHANNEL_ERROR', () => {
      render(<ConnectionTelemetryBanner isOnline={true} isRealtimeActive={false} connectionStatus="CHANNEL_ERROR" />);

      const statusBanner = screen.getByRole('status');
      expect(statusBanner).toBeInTheDocument();
      expect(statusBanner).toHaveTextContent(/Reintentando sincronización de telemetría/i);
    });
  });

  describe('Healthy Online State Rendering', () => {
    it('no renderiza nada por defecto cuando la conexión es saludable', () => {
      const { container } = render(<ConnectionTelemetryBanner isOnline={true} isRealtimeActive={true} />);

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renderiza indicador sutil cuando showWhenConnected es true', () => {
      render(<ConnectionTelemetryBanner isOnline={true} isRealtimeActive={true} showWhenConnected={true} />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent(/En línea — Telemetría activa/i);
    });
  });

  describe('Window Online / Offline Event Listeners', () => {
    it('detecta cambios de conectividad emitidos por la ventana del navegador', () => {
      render(<ConnectionTelemetryBanner />);

      // Simular pérdida de conexión nativa
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(screen.getByRole('alert')).toHaveTextContent(/SIN CONEXIÓN DE RED/i);

      // Simular recuperación de conexión
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
