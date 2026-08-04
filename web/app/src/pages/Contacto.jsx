import { useState } from 'react';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import { waLink } from '../data/content.js';

export default function Contacto() {
  useReveal();
  useDocumentHead({
    title: 'Contacto — Inmerge',
    description:
      'Escríbenos por WhatsApp o revisa cómo postular a un proceso formal o TDR con Inmerge, consultoría en datos en Lima, Perú.',
    path: '/contacto',
  });
  const [formContact, setFormContact] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formName, setFormName] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  function submitForm() {
    if (!formContact.trim() || !formMessage.trim()) return;
    const subject = `Consulta formal / TDR${formName.trim() ? ` — ${formName.trim()}` : ''}`;
    const body = `Nombre y organización: ${formName || '(no indicado)'}\nContacto: ${formContact}\n\n${formMessage}`;
    window.location.href = `mailto:contacto@inmerge.pe?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormSubmitted(true);
  }

  return (
    <>
      <div style={{ padding: '100px clamp(20px,5vw,40px) 80px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>CONTACTO</div>
        <div
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,88px)',
            lineHeight: 1,
            letterSpacing: -1,
            maxWidth: 900,
          }}
        >
          Hablemos de tus datos.
        </div>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 560, lineHeight: 1.7, marginTop: 28 }}>
          Respondemos directo, sin intermediarios — el mismo consultor que diseña, ejecuta.
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '100px clamp(20px,5vw,40px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          gap: 64,
        }}
      >
        <div
          data-reveal=""
          className="card-hover"
          style={{
            background: 'var(--ink)',
            color: 'var(--bg)',
            borderRadius: 4,
            padding: 56,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 420,
          }}
        >
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: 'var(--gold)', fontWeight: 600, marginBottom: 20 }}>
              RESPUESTA MÁS RÁPIDA
            </div>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 32, lineHeight: 1.3, marginBottom: 16 }}>
              Escríbenos por WhatsApp.
            </div>
            <div style={{ fontSize: 14, color: 'var(--tan-text)', lineHeight: 1.7 }}>
              Sin formularios, sin esperar respuesta de un área comercial — hablas directo con quien va a resolver tu caso.
            </div>
          </div>
          <a
            href={waLink('Hola, vengo de la página de contacto de Inmerge y quiero conversar.')}
            target="_blank"
            rel="noreferrer"
            className="btn-hover"
            style={{
              background: 'var(--gold)',
              color: 'var(--ink)',
              borderRadius: 2,
              padding: '18px 32px',
              fontSize: 15,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              width: 'fit-content',
              marginTop: 32,
            }}
          >
            +51 957 251 279 →
          </a>
        </div>

        <div data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
          <div style={{ background: 'var(--bg)', padding: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>EMAIL</div>
            <a href="mailto:contacto@inmerge.pe" style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19 }}>
              contacto@inmerge.pe
            </a>
          </div>
          <div style={{ background: 'var(--bg)', padding: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>UBICACIÓN</div>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19 }}>Lima, Perú</div>
          </div>
          <div style={{ background: 'var(--bg)', padding: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>
              HORARIO DE RESPUESTA
            </div>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 19 }}>Lun–Vie, 9am–7pm (Perú)</div>
          </div>
        </div>
      </div>

      <Frieze
        bg="var(--cream2)"
        border="#241A12"
        upColor="#A8472B"
        downColor="#C68A3D"
        medallionBg="#241A12"
        medallionBorder="#D8A84E"
        flip
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px clamp(20px,5vw,40px)' }}>
        <div data-reveal="" style={{ fontSize: 12, letterSpacing: 2, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 12 }}>
          PARA LICITACIONES Y TDR
        </div>
        <div
          data-reveal=""
          style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 'clamp(26px,3.4vw,38px)', marginBottom: 16 }}
        >
          ¿Proceso formal o TDR publicado?
        </div>
        <p data-reveal="" style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40 }}>
          Cuéntanos brevemente de qué se trata y te respondemos con la información que necesites para postular.
        </p>

        {formSubmitted ? (
          <div data-reveal="" style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: 4, padding: 40 }}>
            <div style={{ width: 14, height: 14, background: 'var(--green)', transform: 'rotate(45deg)', marginBottom: 16 }} />
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Casi listo.</div>
            <div style={{ fontSize: 14, color: 'var(--tan-text)', lineHeight: 1.6 }}>
              Se abrió tu cliente de correo con el mensaje listo — solo confirma el envío y coordinamos por el medio que dejaste.
            </div>
          </div>
        ) : (
          <div data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Nombre y organización"
              style={{
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                borderRadius: 3,
                padding: 16,
                fontSize: 14,
                fontFamily: "'IBM Plex Sans',sans-serif",
              }}
            />
            <input
              value={formContact}
              onChange={(e) => setFormContact(e.target.value)}
              placeholder="Correo o WhatsApp"
              style={{
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                borderRadius: 3,
                padding: 16,
                fontSize: 14,
                fontFamily: "'IBM Plex Sans',sans-serif",
              }}
            />
            <textarea
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              placeholder="Cuéntanos del proceso o TDR"
              rows={4}
              style={{
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                borderRadius: 3,
                padding: 16,
                fontSize: 14,
                fontFamily: "'IBM Plex Sans',sans-serif",
                resize: 'vertical',
              }}
            />
            <button
              type="button"
              onClick={submitForm}
              className="btn-hover"
              style={{
                background: 'var(--terracotta)',
                color: 'var(--bg)',
                textAlign: 'center',
                borderRadius: 3,
                padding: 16,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'IBM Plex Sans',sans-serif",
                cursor: 'pointer',
                width: 'fit-content',
                paddingLeft: 32,
                paddingRight: 32,
                border: 'none',
              }}
            >
              Enviar mensaje
            </button>
          </div>
        )}
      </div>

      <Footer borderTop />
    </>
  );
}
