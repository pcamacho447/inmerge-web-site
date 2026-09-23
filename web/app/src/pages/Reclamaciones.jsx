import { useState } from 'react';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { submitClaim } from '../lib/claims.js';

export default function Reclamaciones() {
  useReveal();
  const { isEn } = useLanguage();

  useDocumentHead({
    title: isEn ? 'Complaints Book — Inmerge' : 'Libro de Reclamaciones — Inmerge',
    description: isEn
      ? 'Virtual complaints book in compliance with Peruvian consumer protection laws.'
      : 'Libro de reclamaciones virtual conforme a las leyes de protección al consumidor de Perú.',
    path: isEn ? '/en/claims' : '/libro-de-reclamaciones',
  });

  const [formType, setFormType] = useState('reclamo');
  const [formName, setFormName] = useState('');
  const [formDocType, setFormDocType] = useState('DNI');
  const [formDocNum, setFormDocNum] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  const [formService, setFormService] = useState('Auditoría');
  const [formAmount, setFormAmount] = useState('');

  const [formDetail, setFormDetail] = useState('');
  const [formRequest, setFormRequest] = useState('');

  const [formHoneypot, setFormHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!formEmail.trim() || !formDetail.trim() || !formName.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitClaim({
        type: formType,
        fullName: formName,
        documentType: formDocType,
        documentNumber: formDocNum,
        email: formEmail,
        phone: formPhone,
        address: formAddress,
        service: formService,
        amount: formAmount,
        detail: formDetail,
        request: formRequest,
        honeypot: formHoneypot,
      });
      setFormSubmitted(true);
    } catch (err) {
      console.warn('Fallo al guardar reclamo en Supabase, activando fallback mailto:', err);

      const subject = isEn
        ? `Complaints Book - ${formType.toUpperCase()} - ${formName}`
        : `Libro de Reclamaciones - ${formType.toUpperCase()} - ${formName}`;

      const body = isEn
        ? `Type: ${formType.toUpperCase()}
Name: ${formName}
Doc: ${formDocType} ${formDocNum}
Email: ${formEmail}
Phone: ${formPhone || '-'}
Address: ${formAddress || '-'}

Service: ${formService}
Claimed Amount: ${formAmount || '-'}

Details:
${formDetail}

Request:
${formRequest}`
        : `Tipo: ${formType.toUpperCase()}
Nombre/Razón Social: ${formName}
Documento: ${formDocType} ${formDocNum}
Correo: ${formEmail}
Teléfono: ${formPhone || '-'}
Domicilio: ${formAddress || '-'}

Servicio: ${formService}
Monto Reclamado: ${formAmount || '-'}

Detalle:
${formDetail}

Pedido:
${formRequest}`;

      window.location.href = `mailto:inmerge3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--cream2)',
    border: '1px solid var(--border)',
    color: 'var(--ink)',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box',
  };

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' };

  return (
    <>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px, 6vh, 64px) clamp(24px, 5vw, 64px)' }}>
        <div data-reveal="" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: 2,
              color: 'var(--terracotta)',
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            {isEn ? 'VIRTUAL COMPLAINTS BOOK' : 'LIBRO DE RECLAMACIONES VIRTUAL'}
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(26px, 3vw, 36px)',
              margin: '0 0 8px 0',
              color: 'var(--ink)',
            }}
          >
            {isEn ? 'Register a Claim or Complaint' : 'Hoja de Reclamación'}
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', marginBottom: 32 }}>
            {isEn
              ? 'Pursuant to the laws of Peru, we provide this Virtual Complaints Book to address your concerns.'
              : 'Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571), este establecimiento cuenta con un Libro de Reclamaciones Virtual a tu disposición.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* 1. Datos del Consumidor */}
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 4 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--terracotta)' }}>
                {isEn ? '1. Consumer Identification' : '1. Identificación del Consumidor Reclamante'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="rec-name" style={labelStyle}>
                    {isEn ? 'Full Name / Company Name *' : 'Nombre o Razón Social *'}
                  </label>
                  <input
                    id="rec-name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                  <div>
                    <label htmlFor="rec-doctype" style={labelStyle}>
                      {isEn ? 'ID Type *' : 'Tipo Documento *'}
                    </label>
                    <select id="rec-doctype" value={formDocType} onChange={(e) => setFormDocType(e.target.value)} style={inputStyle}>
                      <option value="DNI">DNI</option>
                      <option value="CE">CE</option>
                      <option value="RUC">RUC</option>
                      <option value="Pasaporte">Pasaporte / Passport</option>
                    </select>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label htmlFor="rec-docnum" style={labelStyle}>
                      {isEn ? 'Document Number *' : 'Número de Documento *'}
                    </label>
                    <input
                      id="rec-docnum"
                      type="text"
                      required
                      value={formDocNum}
                      onChange={(e) => setFormDocNum(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <label htmlFor="rec-email" style={labelStyle}>
                      {isEn ? 'Email *' : 'Correo Electrónico *'}
                    </label>
                    <input
                      id="rec-email"
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="rec-phone" style={labelStyle}>
                      {isEn ? 'Phone Number' : 'Teléfono'}
                    </label>
                    <input id="rec-phone" type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label htmlFor="rec-address" style={labelStyle}>
                    {isEn ? 'Address' : 'Domicilio'}
                  </label>
                  <input
                    id="rec-address"
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* 2. Identificación del Bien o Servicio */}
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 4 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--terracotta)' }}>
                {isEn ? '2. Service Identification' : '2. Identificación del Bien Contratado'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <label htmlFor="rec-service" style={labelStyle}>
                    {isEn ? 'Service *' : 'Servicio *'}
                  </label>
                  <select id="rec-service" value={formService} onChange={(e) => setFormService(e.target.value)} style={inputStyle}>
                    <option value="Auditoría">Pilar 01: Auditoría Técnica</option>
                    <option value="Desarrollo Cloud">Pilar 02: Desarrollo Cloud</option>
                    <option value="Data Science">Pilar 03: Data Science</option>
                    <option value="Otro">Otro / Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rec-amount" style={labelStyle}>
                    {isEn ? 'Claimed Amount (Optional)' : 'Monto Reclamado (Opcional)'}
                  </label>
                  <input
                    id="rec-amount"
                    type="text"
                    placeholder="Ej. 1500.00 PEN"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* 3. Detalle de Reclamación */}
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 4 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--terracotta)' }}>
                {isEn ? '3. Claim Details & Request' : '3. Detalle de la Reclamación y Pedido'}
              </h3>

              <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="rec-type"
                    value="reclamo"
                    checked={formType === 'reclamo'}
                    onChange={() => setFormType('reclamo')}
                    style={{ accentColor: 'var(--terracotta)' }}
                  />
                  {isEn ? 'Claim (Reclamo)' : 'Reclamo'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="rec-type"
                    value="queja"
                    checked={formType === 'queja'}
                    onChange={() => setFormType('queja')}
                    style={{ accentColor: 'var(--terracotta)' }}
                  />
                  {isEn ? 'Complaint (Queja)' : 'Queja'}
                </label>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
                {isEn
                  ? 'Claim: Discontent related to the product/service. Complaint: Discontent not directly related to the product/service or regarding customer service.'
                  : 'Reclamo: Disconformidad relacionada a los productos o servicios. Queja: Disconformidad no relacionada a los productos o servicios, o malestar respecto a la atención al público.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="rec-detail" style={labelStyle}>
                    {isEn ? 'Details *' : 'Detalle *'}
                  </label>
                  <textarea
                    id="rec-detail"
                    rows={4}
                    required
                    value={formDetail}
                    onChange={(e) => setFormDetail(e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label htmlFor="rec-request" style={labelStyle}>
                    {isEn ? 'Consumer Request (Optional)' : 'Pedido del Consumidor (Opcional)'}
                  </label>
                  <textarea
                    id="rec-request"
                    rows={3}
                    value={formRequest}
                    onChange={(e) => setFormRequest(e.target.value)}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Honeypot */}
            <div
              style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1, overflow: 'hidden' }}
              aria-hidden="true"
            >
              <label htmlFor="website_url_hp">No completar este campo</label>
              <input
                id="website_url_hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formHoneypot}
                onChange={(e) => setFormHoneypot(e.target.value)}
              />
            </div>

            {submitError && (
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
                  {isEn ? '✓ Submitted successfully' : '✓ Solicitud registrada exitosamente'}
                </strong>
                {isEn
                  ? 'We have received your submission. We will respond within the legal timeframe.'
                  : 'Hemos recibido tu hoja de reclamación. Daremos respuesta en el plazo establecido por ley.'}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent"
              style={{
                background: 'var(--terracotta)',
                color: 'var(--bg)',
                border: 'none',
                padding: '16px 32px',
                fontSize: 15,
                fontWeight: 600,
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                marginTop: 8,
                transition: 'opacity 0.2s ease',
              }}
            >
              {isSubmitting ? (isEn ? 'Submitting...' : 'Enviando...') : isEn ? 'Submit' : 'Enviar Reclamo / Queja'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
