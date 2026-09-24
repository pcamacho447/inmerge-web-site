import { useState, useEffect } from 'react';

/**
 * ConnectionTelemetryBanner — Banner de Telemetría y Estado de Conectividad de Red
 * Alerta accesible (WCAG 2.1 AA) de pérdida de conexión local y reconexión de WebSocket.
 */
export default function ConnectionTelemetryBanner({
  isOnline: propIsOnline,
  isRealtimeActive = true,
  connectionStatus = 'SUBSCRIBED',
  onRetry = null,
  showWhenConnected = false,
}) {
  const [internalOnline, setInternalOnline] = useState(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    // Si isOnline se controla explícitamente por prop, no escuchar eventos nativos
    if (propIsOnline !== undefined) return;

    const handleOnline = () => setInternalOnline(true);
    const handleOffline = () => setInternalOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [propIsOnline]);

  const effectiveOnline = propIsOnline !== undefined ? propIsOnline : internalOnline;

  // 1. Estado Offline (Pérdida de conectividad de red local)
  if (!effectiveOnline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="connection-telemetry-banner offline"
        style={{
          width: '100%',
          background: 'rgba(168, 71, 43, 0.12)',
          borderBottom: '1px solid var(--terracotta)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          color: 'var(--terracotta)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden="true" style={{ fontSize: '1rem' }}>
            ⚠️
          </span>
          <span>
            <strong>SIN CONEXIÓN DE RED</strong> — Operando en modo local resiliente.
          </span>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Reintentar conexión"
            style={{
              background: 'var(--terracotta)',
              color: '#fff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '2px',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            Reintentar conexión
          </button>
        )}
      </div>
    );
  }

  // 2. Estado de reconexión Realtime / Error de canal
  const isReconnecting = !isRealtimeActive || connectionStatus === 'CONNECTING';
  const hasChannelError = connectionStatus === 'CHANNEL_ERROR';

  if (isReconnecting || hasChannelError) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="connection-telemetry-banner reconnecting"
        style={{
          width: '100%',
          background: 'rgba(216, 168, 78, 0.15)',
          borderBottom: '1px solid var(--gold)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          color: 'var(--ink)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--gold)',
              boxShadow: '0 0 6px var(--gold)',
            }}
          />
          <span>
            {hasChannelError ? 'Reintentando sincronización de telemetría en tiempo real...' : 'Reconectando telemetría en tiempo real...'}
          </span>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Reintentar conexión"
            style={{
              background: 'transparent',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              padding: '2px 8px',
              borderRadius: '2px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  // 3. Estado en línea saludable (opcionalmente visible con showWhenConnected)
  if (showWhenConnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="connection-telemetry-banner connected"
        style={{
          width: '100%',
          background: 'rgba(34, 197, 94, 0.1)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#15803d',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#22c55e',
          }}
        />
        <span>En línea — Telemetría activa</span>
      </div>
    );
  }

  return null;
}
