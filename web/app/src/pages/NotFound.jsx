import { Link } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { waLink } from '../data/content.js';

export default function NotFound() {
  useDocumentHead({
    title: 'Página no encontrada — Inmerge',
    description: 'La página que buscas no existe o cambió de dirección.',
    path: '/404',
    noIndex: true,
  });

  return (
    <>
      <div
        style={{
          position: 'relative',
          padding: '140px clamp(20px,5vw,40px) 100px',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>ERROR 404</div>
          <div
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(40px,8vw,96px)',
              lineHeight: 1,
              letterSpacing: -1,
              marginBottom: 28,
            }}
          >
            Esta página <span style={{ color: 'var(--terracotta)' }}>no existe.</span>
          </div>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40 }}>
            El enlace puede estar roto o la página cambió de dirección. Puedes volver al inicio o escribirnos directamente si buscabas algo
            puntual.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/"
              className="btn-hover"
              style={{
                background: 'var(--terracotta)',
                color: 'var(--bg)',
                borderRadius: 2,
                padding: '16px 32px',
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Volver al inicio
            </Link>
            <a
              href={waLink('Hola, llegué a una página que no encontré en el sitio de Inmerge y quería escribirles directo.')}
              target="_blank"
              rel="noreferrer"
              className="btn-outline-hover"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                borderRadius: 2,
                padding: '16px 32px',
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Footer borderTop />
    </>
  );
}
