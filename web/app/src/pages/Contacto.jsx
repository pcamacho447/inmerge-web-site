import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import { waLink } from '../data/content.js';
import { submitLeadTdr } from '../lib/leads.js';

export default function Contacto() {
  useReveal();
  useDocumentHead({
    title: 'Contacto & Cotización TDR — Inmerge',
    description: 'Solicita cotización o propuesta técnica para proyectos de Auditoría, Desarrollo Cloud y Ciencia de Datos en Lima, Perú.',
    path: '/contacto',
  });

  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('servicio') || '';

  const [formPillar, setFormPillar] = useState(preselectedService ? 'Especificado' : 'auditoria');
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTimeline, setFormTimeline] = useState('1 a 2 meses');
  const [formMessage, setFormMessage] = useState(preselectedService ? `Interés en el servicio: ${preselectedService}\n\n` : '');
  const [formHoneypot, setFormHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setFormMessage((prev) => (prev.includes(preselectedService) ? prev : `Interés en el servicio: ${preselectedService}\n\n${prev}`));
    }
  }, [preselectedService]);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!formContact.trim() || !formMessage.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setIsRateLimited(false);

    try {
      await submitLeadTdr({
        pillar: formPillar,
        fullName: formName,
        company: formCompany,
        email: formContact,
        phone: formPhone,
        timeline: formTimeline,
        message: formMessage,
        honeypot: formHoneypot,
      });
      setFormSubmitted(true);
    } catch (err) {
      if (err.isRateLimited || err.code === 'RATE_LIMIT_EXCEEDED' || (err.message && err.message.includes('RATE_LIMIT_EXCEEDED'))) {
        setIsRateLimited(true);
        setSubmitError(err.message || 'Has superado el límite de 3 solicitudes por hora para este correo.');
        return;
      }

      console.warn('Fallo al guardar lead en Supabase, activando fallback:', err);
      // Fallback a mailto si la base de datos o conexión falla
      const subject = `Solicitud TDR / Cotización — ${formCompany || formName || 'Inmerge'}`;
      const body = `Pilar de Interés: ${formPillar}\nNombre: ${formName || 'No indicado'}\nEmpresa/Organización: ${formCompany || 'No indicado'}\nEmail: ${formContact}\nTeléfono/WhatsApp: ${formPhone || 'No indicado'}\nPlazo estimado: ${formTimeline}\n\nRequerimiento:\n${formMessage}`;
      window.location.href = `mailto:inmerge3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const customWaMessage = `Hola Inmerge, deseo cotizar un proyecto.\n*Pilar:* ${formPillar}\n*Empresa:* ${formCompany || 'Particular'}\n*Contacto:* ${formName || 'No especificado'}\n*Detalle:* ${formMessage || 'Coordinar reunión preliminar'}`;
  const customWaUrl = waLink(customWaMessage);

  return (
    <>
      <div style={{ padding: '100px clamp(20px,5vw,40px) 60px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>
          COTIZACIÓN & TDR
        </div>
        <h1
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,88px)',
            lineHeight: 1.05,
            letterSpacing: -1,
            maxWidth: 960,
            margin: '0 0 24px 0',
          }}
        >
          Evaluación técnica y propuestas a medida.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          Respondemos directamente con el equipo de ingeniería y consultoría que ejecutará el proyecto — sin capas comerciales ni demoras.
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '80px clamp(20px,5vw,40px) 140px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 64,
        }}
      >
        {/* Left Column: Direct WhatsApp & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div
            data-reveal=""
            style={{
              background: 'var(--ink)',
              color: 'var(--bg)',
              padding: 'clamp(32px, 5vw, 48px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 380,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  letterSpacing: 2,
                  color: 'var(--gold)',
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                CANAL INMEDIATO
              </div>
              <h2
                style={{
                  fontFamily: "'Spectral',serif",
                  fontWeight: 700,
                  fontSize: 'clamp(26px, 3vw, 36px)',
                  lineHeight: 1.25,
                  marginBottom: 16,
                  color: '#F3EADA',
                }}
              >
                Conversación directa por WhatsApp
              </h2>
              <p style={{ fontSize: 15, color: 'var(--tan-text)', lineHeight: 1.6, margin: 0 }}>
                Ideal para coordinar reuniones exploratorias, compartir alcances de TDR o recibir un diagnóstico inicial de factibilidad.
              </p>
            </div>

            <div style={{ marginTop: 32 }}>
              <a
                href={customWaUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'var(--gold)',
                  color: 'var(--ink)',
                  padding: '16px 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                className="btn-hover"
              >
                <span>Escribir por WhatsApp</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div
            data-reveal=""
            style={{
              background: 'var(--cream2)',
              border: '1px solid var(--border)',
              padding: 32,
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: 1.5,
                color: 'var(--terracotta)',
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              DATOS INSTITUCIONALES
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink)' }}>
              <div>
                <strong>Firma:</strong> Inmerge Consultoría y Tecnología
              </div>
              <div>
                <strong>Correo:</strong> inmerge3@gmail.com
              </div>
              <div>
                <strong>Ubicación:</strong> Lima, Perú
              </div>
              <div>
                <strong>Régimen:</strong> Facturación electrónica con RUC activo y habido
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Structured B2B Quote Form */}
        <div
          data-reveal=""
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            padding: 'clamp(32px, 5vw, 48px)',
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: 2,
              color: 'var(--terracotta)',
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            FORMULARIO DE REQUERIMIENTO
          </div>
          <h2
            style={{
              fontFamily: "'Spectral',serif",
              fontWeight: 700,
              fontSize: 'clamp(26px, 3vw, 36px)',
              margin: '0 0 24px 0',
              color: 'var(--ink)',
            }}
          >
            Detalles de la Solicitud
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Service Pillar Selector */}
            <div>
              <label
                htmlFor="pillar-select"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
              >
                Pilar o Especialidad Principal *
              </label>
              <select
                id="pillar-select"
                value={formPillar}
                onChange={(e) => setFormPillar(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--cream2)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 14,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                <option value="auditoria">Pilar 01: Auditoría Técnica y de Datos</option>
                <option value="desarrollo">Pilar 02: Desarrollo Tecnológico & Cloud (AWS)</option>
                <option value="datos">Pilar 03: Ciencia de Datos & Inteligencia Artificial</option>
                <option value="integral">Proyecto Integral / Múltiples Pilares</option>
                <option value="otro">Otro Requerimiento Específico</option>
              </select>
            </div>

            {/* Name & Company */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label
                  htmlFor="contact-name"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
                >
                  Nombre y Cargo
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Ej. Carlos Mendoza, Gerente de TI"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--cream2)',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-company"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
                >
                  Empresa u Organización
                </label>
                <input
                  id="contact-company"
                  type="text"
                  placeholder="Ej. Corporación Andina S.A."
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--cream2)',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label
                  htmlFor="contact-email"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
                >
                  Correo Electrónico *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="correo@empresa.com"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--cream2)',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
                >
                  Teléfono / WhatsApp
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="+51 987 654 321"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--cream2)',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label
                htmlFor="contact-timeline"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
              >
                Plazo Estimado de Ejecución
              </label>
              <select
                id="contact-timeline"
                value={formTimeline}
                onChange={(e) => setFormTimeline(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--cream2)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 14,
                }}
              >
                <option value="Urgente (< 1 mes)">Inmediato / Urgente (&lt; 1 mes)</option>
                <option value="1 a 2 meses">1 a 2 meses</option>
                <option value="3 a 6 meses">3 a 6 meses</option>
                <option value="Planificación anual">Planificación anual / Sin fecha fija</option>
              </select>
            </div>

            {/* Requirements Message */}
            <div>
              <label
                htmlFor="contact-message"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
              >
                Descripción del Requerimiento / Alcance *
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                placeholder="Describe el estado de tus sistemas, fuentes de datos o el problema que buscas resolver..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--cream2)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontSize: 14,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Campo Honeypot Anti-Bot Invisible */}
            <div
              style={{
                opacity: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                height: 0,
                width: 0,
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <label htmlFor="website_url_hp">No completar este campo</label>
              <input
                id="website_url_hp"
                type="text"
                name="website_url_hp"
                tabIndex={-1}
                autoComplete="off"
                value={formHoneypot}
                onChange={(e) => setFormHoneypot(e.target.value)}
              />
            </div>

            {submitError && isRateLimited && (
              <div
                style={{
                  padding: '16px 20px',
                  background: 'rgba(168, 71, 43, 0.1)',
                  border: '1px solid var(--terracotta)',
                  color: 'var(--ink)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div>
                  <strong style={{ color: 'var(--terracotta)', display: 'block', marginBottom: 4 }}>
                    ⚠️ Límite de solicitudes de cotización alcanzado
                  </strong>
                  Has enviado 3 solicitudes recientemente desde este correo electrónico. Para prevenir saturación y garantizar atención prioritaria, por favor comunícate directamente con nuestro equipo de ingeniería vía WhatsApp.
                </div>
                <div>
                  <a
                    href={customWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#25D366',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    💬 Contactar por WhatsApp de Inmediato
                  </a>
                </div>
              </div>
            )}

            {submitError && !isRateLimited && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(208, 138, 110, 0.15)',
                  border: '1px solid var(--rose)',
                  color: 'var(--rose)',
                  fontSize: 14,
                }}
              >
                {submitError}
              </div>
            )}

            {formSubmitted && (
              <div
                style={{
                  padding: '16px 20px',
                  background: 'rgba(74, 156, 106, 0.1)',
                  border: '1px solid var(--green)',
                  color: 'var(--ink)',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: 'var(--green)', display: 'block', marginBottom: 4 }}>
                  ✓ ¡Solicitud registrada exitosamente en Inmerge!
                </strong>
                Nuestro equipo técnico revisará los detalles y te responderá en menos de 24 horas laborables. También puedes adelantar la
                coordinación escribiéndonos directamente al WhatsApp.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'var(--terracotta)',
                color: '#F3EADA',
                border: 'none',
                padding: '16px 32px',
                fontSize: 15,
                fontWeight: 600,
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                marginTop: 8,
                transition: 'opacity 0.2s ease',
              }}
              className="btn-accent"
            >
              {isSubmitting ? 'Guardando solicitud...' : 'Enviar Solicitud de Cotización (TDR)'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
