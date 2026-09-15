import React, { useEffect } from 'react';

/**
 * Componente ToastNotification con estética Editorial Tech Premium de Inmerge.
 * Permite mostrar notificaciones en vivo no invasivas ante eventos de Supabase Realtime.
 */
export default function ToastNotification({
  toast,
  onDismiss,
  duration = 5000,
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onDismiss]);

  if (!toast) return null;

  const typeConfig = {
    lead: {
      accent: 'var(--terracotta)',
      badge: 'LEAD TDR',
      icon: '🔔',
    },
    deliverable: {
      accent: 'var(--gold)',
      badge: 'ENTREGABLE',
      icon: '📦',
    },
    milestone: {
      accent: 'var(--ochre)',
      badge: 'HITO PROYECTO',
      icon: '✨',
    },
    project: {
      accent: 'var(--terracotta)',
      badge: 'PROYECTO',
      icon: '📂',
    },
    info: {
      accent: 'var(--ink)',
      badge: 'EN VIVO',
      icon: '⚡',
    },
  };

  const currentType = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: 380,
        background: 'var(--ink)',
        color: 'var(--bg)',
        borderRadius: 4,
        boxShadow: '0 12px 32px rgba(36, 26, 18, 0.35)',
        borderLeft: `4px solid ${toast.accent || currentType.accent}`,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        animation: 'inmergeToastSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <style>{`
        @keyframes inmergeToastSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>
        {toast.icon || currentType.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1,
              color: toast.accent || currentType.accent,
              textTransform: 'uppercase',
            }}
          >
            {toast.badge || currentType.badge}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(243, 234, 218, 0.5)' }}>• Ahora</span>
        </div>

        {toast.title && (
          <div
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--bg)',
              marginBottom: 4,
              lineHeight: 1.3,
            }}
          >
            {toast.title}
          </div>
        )}

        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 13,
            color: 'rgba(243, 234, 218, 0.85)',
            lineHeight: 1.5,
          }}
        >
          {toast.message}
        </div>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(243, 234, 218, 0.6)',
          cursor: 'pointer',
          padding: 4,
          fontSize: 16,
          lineHeight: 1,
          alignSelf: 'flex-start',
        }}
      >
        ✕
      </button>
    </div>
  );
}
