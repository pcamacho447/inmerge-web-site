import { Link } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFound() {
  const { isEn, content } = useLanguage();

  useDocumentHead({
    title: isEn ? 'Page not found — Inmerge' : 'Página no encontrada — Inmerge',
    description: isEn
      ? 'The page you are looking for does not exist or has been moved.'
      : 'La página que buscas no existe o cambió de dirección.',
    path: isEn ? '/en/404' : '/404',
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
            {isEn ? (
              <>
                This page <span style={{ color: 'var(--terracotta)' }}>does not exist.</span>
              </>
            ) : (
              <>
                Esta página <span style={{ color: 'var(--terracotta)' }}>no existe.</span>
              </>
            )}
          </div>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40 }}>
            {isEn
              ? 'The link may be broken or the page was moved. You can return to the homepage or reach out directly if you are looking for specific technical assistance.'
              : 'El enlace puede estar roto o la página cambió de dirección. Puedes volver al inicio o escribirnos directamente si buscabas algo puntual.'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={isEn ? '/en' : '/'}
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
              {isEn ? 'Return to homepage' : 'Volver al inicio'}
            </Link>
            <a
              href={content.waLink(
                isEn
                  ? 'Hello Inmerge team, I reached a page that could not be found on your site and would like to contact you directly.'
                  : 'Hola, llegué a una página que no encontré en el sitio de Inmerge y quería escribirles directo.',
              )}
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
              {isEn ? 'Message on WhatsApp' : 'Escríbenos por WhatsApp'}
            </a>
          </div>
        </div>
      </div>

      <Footer borderTop />
    </>
  );
}
