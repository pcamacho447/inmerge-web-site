import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { submitLeadTdr } from '../lib/leads.js';

export default function Contacto() {
  useReveal();
  const { isEn, content } = useLanguage();

  useDocumentHead({
    title: isEn ? 'Contact & Technical Proposal (TDR) — Inmerge' : 'Contacto & Cotización TDR — Inmerge',
    description: isEn
      ? 'Request a technical proposal or consultation for Systems Auditing, Cloud Engineering (AWS), and Applied Data Science in Lima, Peru.'
      : 'Solicita cotización o propuesta técnica para proyectos de Auditoría, Desarrollo Cloud y Ciencia de Datos en Lima, Perú.',
    path: isEn ? '/en/contact' : '/contacto',
  });

  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('servicio') || searchParams.get('service') || '';

  const [formPillar, setFormPillar] = useState(preselectedService ? 'Especificado' : 'auditoria');
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTimeline, setFormTimeline] = useState(isEn ? '1 to 2 months' : '1 a 2 meses');
  const [formMessage, setFormMessage] = useState(
    preselectedService
      ? isEn
        ? `Interest in service: ${preselectedService}\n\n`
        : `Interés en el servicio: ${preselectedService}\n\n`
      : '',
  );
  const [formHoneypot, setFormHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setFormMessage((prev) =>
        prev.includes(preselectedService)
          ? prev
          : isEn
            ? `Interest in service: ${preselectedService}\n\n${prev}`
            : `Interés en el servicio: ${preselectedService}\n\n${prev}`,
      );
    }
  }, [preselectedService, isEn]);

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
        setSubmitError(
          isEn
            ? 'You have reached the limit of 3 submissions per hour for this email address.'
            : err.message || 'Has superado el límite de 3 solicitudes por hora para este correo.',
        );
        return;
      }

      console.warn('Fallo al guardar lead en Supabase, activando fallback:', err);
      // Fallback a mailto si la base de datos o conexión falla
      const subject = isEn
        ? `TDR Project Request — ${formCompany || formName || 'Inmerge'}`
        : `Solicitud TDR / Cotización — ${formCompany || formName || 'Inmerge'}`;
      const body = isEn
        ? `Pillar of Interest: ${formPillar}\nName: ${formName || 'Not specified'}\nCompany: ${formCompany || 'Not specified'}\nEmail: ${formContact}\nPhone/WhatsApp: ${formPhone || 'Not specified'}\nEstimated Timeline: ${formTimeline}\n\nScope Requirement:\n${formMessage}`
        : `Pilar de Interés: ${formPillar}\nNombre: ${formName || 'No indicado'}\nEmpresa/Organización: ${formCompany || 'No indicado'}\nEmail: ${formContact}\nTeléfono/WhatsApp: ${formPhone || 'No indicado'}\nPlazo estimado: ${formTimeline}\n\nRequerimiento:\n${formMessage}`;
      window.location.href = `mailto:inmerge3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const customWaMessage = isEn
    ? `Hello Inmerge, I would like to request a technical proposal.\n*Pillar:* ${formPillar}\n*Company:* ${formCompany || 'Not specified'}\n*Contact:* ${formName || 'Not specified'}\n*Scope:* ${formMessage || 'Schedule preliminary technical discussion'}`
    : `Hola Inmerge, deseo cotizar un proyecto.\n*Pilar:* ${formPillar}\n*Empresa:* ${formCompany || 'Particular'}\n*Contacto:* ${formName || 'No especificado'}\n*Detalle:* ${formMessage || 'Coordinar reunión preliminar'}`;
  const customWaUrl = content.waLink(customWaMessage);

  return (
    <>
      <div style={{ padding: '100px clamp(20px,5vw,40px) 60px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>
          {isEn ? 'PROPOSALS & TECHNICAL SCOPE' : 'COTIZACIÓN & TDR'}
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
          {isEn ? 'Technical evaluation and bespoke engineering proposals.' : 'Evaluación técnica y propuestas a medida.'}
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          {isEn
            ? 'We communicate directly through the engineering partners and consultants who build and audit your systems — zero commercial bureaucracy.'
            : 'Respondemos directamente con el equipo de ingeniería y consultoría que ejecutará el proyecto — sin capas comerciales ni demoras.'}
        </p>
      </div>

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
              background: 'transparent',
              borderLeft: '3px solid var(--terracotta)',
              padding: '0 0 0 clamp(20px, 3vw, 28px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  letterSpacing: 2,
                  color: 'var(--terracotta)',
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {isEn ? 'DIRECT CHANNEL' : 'CANAL INMEDIATO'}
              </div>
              <h2
                style={{
                  fontFamily: "'Spectral',serif",
                  fontWeight: 700,
                  fontSize: 'clamp(26px, 3vw, 36px)',
                  lineHeight: 1.25,
                  marginBottom: 16,
                  color: 'var(--ink)',
                }}
              >
                {isEn ? 'Direct Conversation via WhatsApp' : 'Conversación directa por WhatsApp'}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                {isEn
                  ? 'Exploratory discovery sessions, Terms of Reference (TDR) review, or preliminary feasibility diagnostics.'
                  : 'Reuniones exploratorias, revisión de alcances de TDR o diagnóstico preliminar de factibilidad técnica.'}
              </p>
            </div>

            <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={customWaUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'var(--gold)',
                  color: 'var(--ink)',
                  padding: '14px 26px',
                  fontSize: 14.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                className="btn-hover"
              >
                <span>{isEn ? 'Message via WhatsApp' : 'Escribir por WhatsApp'}</span>
                <span aria-hidden="true">→</span>
              </a>
              <a
                href={`mailto:inmerge3@gmail.com?subject=${encodeURIComponent(isEn ? 'Inmerge — Technical Scope Consultation' : 'Inmerge — Consulta Técnica y TDR')}`}
                style={{
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                  padding: '14px 20px',
                  fontSize: 14.5,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                className="btn-outline"
              >
                <span>{isEn ? 'Formal Email' : 'Correo Formal'}</span>
                <span aria-hidden="true">✉</span>
              </a>
            </div>
          </div>

          {/* Trust & SLA Badges — Continuous Editorial List */}
          <div
            data-reveal=""
            style={{
              background: 'transparent',
              padding: 0,
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: 1.5,
                color: 'var(--terracotta)',
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {isEn ? 'ASSURANCE & ENGAGEMENT SLA' : 'COMPROMISOS DE SERVICIO'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(content.TRUST_BADGES || []).map((badge, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 18,
                      color: 'var(--terracotta)',
                      lineHeight: 1.2,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    {badge.icon}
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{badge.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{badge.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            data-reveal=""
            style={{
              background: 'transparent',
              padding: 0,
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
              {isEn ? 'INSTITUTIONAL METADATA' : 'DATOS INSTITUCIONALES'}
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--ink)' }}>
              <div>
                <strong>{isEn ? 'Firm:' : 'Firma:'}</strong> Inmerge Consultoría y Tecnología
              </div>
              <div>
                <strong>{isEn ? 'Email:' : 'Correo:'}</strong> inmerge3@gmail.com
              </div>
              <div>
                <strong>{isEn ? 'Location:' : 'Ubicación:'}</strong> Lima, Perú
              </div>
              <div>
                <strong>{isEn ? 'Timezone:' : 'Huso horario:'}</strong>{' '}
                {isEn ? 'GMT-5 / UTC-5 (Lima Time)' : 'GMT-5 (UTC-5 · Lima)'}
              </div>
              <div>
                <strong>{isEn ? 'Fiscal Status:' : 'Régimen:'}</strong>{' '}
                {isEn ? 'Electronic Invoicing (RUC Active & Verified)' : 'Facturación electrónica con RUC activo y habido'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Structured B2B Quote Form — Open Continuous Layout */}
        <div
          data-reveal=""
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
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
            {isEn ? 'TECHNICAL SCOPE FORM' : 'FORMULARIO DE REQUERIMIENTO'}
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
            {isEn ? 'Project & Mandate Details' : 'Detalles de la Solicitud'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Service Pillar Selector */}
            <div>
              <label
                htmlFor="pillar-select"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
              >
                {isEn ? 'Pillar or Primary Focus *' : 'Pilar o Especialidad Principal *'}
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
                <option value="auditoria">
                  {isEn ? 'Pillar 01: Technical & Data Auditing' : 'Pilar 01: Auditoría Técnica y de Datos'}
                </option>
                <option value="desarrollo">
                  {isEn ? 'Pillar 02: Cloud Development & Architecture (AWS)' : 'Pilar 02: Desarrollo Tecnológico & Cloud (AWS)'}
                </option>
                <option value="datos">
                  {isEn ? 'Pillar 03: Applied Data Science & AI' : 'Pilar 03: Ciencia de Datos & Inteligencia Artificial'}
                </option>
                <option value="integral">
                  {isEn ? 'Comprehensive Project / Multiple Pillars' : 'Proyecto Integral / Múltiples Pilares'}
                </option>
                <option value="otro">{isEn ? 'Other Specific Requirement' : 'Otro Requerimiento Específico'}</option>
              </select>
            </div>

            {/* Name & Company */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label
                  htmlFor="contact-name"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
                >
                  {isEn ? 'Full Name & Role' : 'Nombre y Cargo'}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder={isEn ? 'e.g. Alex Morgan, VP of Engineering' : 'Ej. Carlos Mendoza, Gerente de TI'}
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
                  {isEn ? 'Company or Entity' : 'Empresa u Organización'}
                </label>
                <input
                  id="contact-company"
                  type="text"
                  placeholder={isEn ? 'e.g. Acme Corp' : 'Ej. Corporación Andina S.A.'}
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
                  {isEn ? 'Corporate Email *' : 'Correo Electrónico *'}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="contact@company.com"
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
                  {isEn ? 'Phone / WhatsApp' : 'Teléfono / WhatsApp'}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="+1 415 555 0199"
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
                {isEn ? 'Estimated Project Timeline' : 'Plazo Estimado de Ejecución'}
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
                <option value="Urgente (< 1 mes)">{isEn ? 'Immediate / Urgent (< 1 month)' : 'Inmediato / Urgente (< 1 mes)'}</option>
                <option value="1 a 2 meses">{isEn ? '1 to 2 months' : '1 a 2 meses'}</option>
                <option value="3 a 6 meses">{isEn ? '3 to 6 months' : '3 a 6 meses'}</option>
                <option value="Planificación anual">
                  {isEn ? 'Strategic planning / Open timeline' : 'Planificación anual / Sin fecha fija'}
                </option>
              </select>
            </div>

            {/* Requirements Message */}
            <div>
              <label
                htmlFor="contact-message"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}
              >
                {isEn ? 'Scope Description / Core Requirements *' : 'Descripción del Requerimiento / Alcance *'}
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                placeholder={
                  isEn
                    ? 'Outline your current system architecture, data sources, or specific technical challenge you are solving...'
                    : 'Describe el estado de tus sistemas, fuentes de datos o el problema que buscas resolver...'
                }
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
                    {isEn ? '⚠️ Request submission limit reached' : '⚠️ Límite de solicitudes de cotización alcanzado'}
                  </strong>
                  {isEn
                    ? 'You have sent multiple requests recently. To ensure priority attention without delay, please reach out directly to our engineering team on WhatsApp.'
                    : 'Has enviado 3 solicitudes recientemente desde este correo electrónico. Para prevenir saturación y garantizar atención prioritaria, por favor comunícate directamente con nuestro equipo de ingeniería vía WhatsApp.'}
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
                    {isEn ? '💬 Message via WhatsApp Directly' : '💬 Contactar por WhatsApp de Inmediato'}
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
                  {isEn ? '✓ Project scope successfully submitted to Inmerge!' : '✓ ¡Solicitud registrada exitosamente en Inmerge!'}
                </strong>
                {isEn
                  ? 'Our senior engineering partners will review your technical requirements and respond within 24 business hours. You may also expedite discussion by messaging our WhatsApp channel.'
                  : 'Nuestro equipo técnico revisará los detalles y te responderá en menos de 24 horas laborables. También puedes adelantar la coordinación escribiéndonos directamente al WhatsApp.'}
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
              {isSubmitting
                ? isEn
                  ? 'Submitting scope...'
                  : 'Guardando solicitud...'
                : isEn
                  ? 'Submit Project Scope (TDR)'
                  : 'Enviar Solicitud de Cotización (TDR)'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
