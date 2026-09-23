import React, { useEffect } from 'react';
import { getSignedDeliverableUrl } from '../../lib/projects.js';

/**
 * DocumentPreviewDrawer — Visor en Vivo & Drawer de Inspección Documental
 * Permite previsualizar Markdown, especificaciones técnicas y PDFs sin salir de la consola.
 */
export default function DocumentPreviewDrawer({ isOpen, onClose, document: doc, showToast }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !doc) return null;

  const handleSignedDownload = async () => {
    if (!doc.filePath) {
      if (doc.url) {
        window.open(doc.url, '_blank', 'noopener,noreferrer');
      } else {
        showToast?.({ type: 'warning', title: 'Sin archivo', message: 'No hay archivo adjunto para descargar.' });
      }
      return;
    }

    try {
      const signedUrl = await getSignedDeliverableUrl(doc.filePath, doc.deliverableId || 'preview');
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
        showToast?.({
          type: 'info',
          title: 'Descarga Autorizada',
          message: `Descarga segura de "${doc.title}" generada (validez 15 min).`,
        });
      } else {
        showToast?.({ type: 'error', title: 'Error de descarga', message: 'No se pudo generar la URL firmada.' });
      }
    } catch (err) {
      showToast?.({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(36, 26, 18, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9998,
          transition: 'opacity 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-drawer-title"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(100vw, 680px)',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 24px rgba(36, 26, 18, 0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--cream2)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'var(--bg)',
                  color: 'var(--terracotta)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                }}
              >
                {doc.fileType || 'DOC'}
              </span>
              {doc.version && (
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: 'var(--muted)',
                  }}
                >
                  {doc.version}
                </span>
              )}
            </div>
            <h3 id="preview-drawer-title" style={{ margin: 0, fontSize: 18, fontFamily: "'Spectral', serif", color: 'var(--ink)' }}>
              {doc.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--ink)',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
            title="Cerrar visor (Esc)"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {doc.notes && (
            <div
              style={{
                background: 'rgba(216, 168, 78, 0.12)',
                border: '1px solid var(--gold)',
                borderRadius: 4,
                padding: '10px 14px',
                fontSize: 12,
                color: 'var(--ink)',
              }}
            >
              <strong>Notas de la versión:</strong> {doc.notes}
            </div>
          )}

          {/* Renderizado de Texto / Markdown / Código */}
          {doc.content ? (
            <div
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 6,
                border: '1px solid var(--border)',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--ink)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {doc.content}
            </div>
          ) : doc.url ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 400 }}>
              <iframe
                src={doc.url}
                title={doc.title}
                sandbox="allow-scripts allow-same-origin"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 450,
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: '#fff',
                }}
              />
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Este documento no cuenta con previsualización de texto directa. Puedes descargarlo en tu equipo.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--cream2)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--muted)',
          }}
        >
          <div>Autor: {doc.author || 'Inmerge Staff'}</div>
          {(doc.filePath || doc.url) && (
            <button
              type="button"
              onClick={handleSignedDownload}
              style={{
                background: 'var(--terracotta)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              ⬇ Descargar Documento
            </button>
          )}
        </div>
      </div>
    </>
  );
}
