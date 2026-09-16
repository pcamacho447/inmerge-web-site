import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Registro() {
  const { signup } = useAuth();
  const { isEn, content } = useLanguage();
  const authDict = content?.AUTH_CONTENT || {};

  useDocumentHead({
    title: isEn ? 'Create account — Inmerge' : 'Crear cuenta — Inmerge',
    path: isEn ? '/en/register' : '/registro',
    noIndex: true,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [billingType, setBillingType] = useState('persona_natural');
  const [taxId, setTaxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !password) return;
    setSubmitting(true);
    setError('');
    try {
      await signup({ fullName: fullName.trim(), email: email.trim(), password, billingType, taxId: taxId.trim() });
      navigate(location.state?.redirectTo || (isEn ? '/en/account' : '/cuenta'));
    } catch (err) {
      setError(err.message || authDict.genericAuthError || 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '140px clamp(20px,5vw,40px) 120px' }}>
        <div
          style={{
            background: 'var(--cream2)',
            borderRadius: 3,
            padding: '8px 12px',
            fontSize: 11,
            letterSpacing: 0.5,
            color: 'var(--muted)',
            marginBottom: 24,
          }}
        >
          {authDict.registerSubtitle || 'Portal de seguimiento de proyectos, auditorías e informes técnicos.'}
        </div>
        {isEn && (
          <div
            role="note"
            style={{
              background: 'rgba(168,71,43,0.08)',
              border: '1px solid rgba(168,71,43,0.2)',
              borderRadius: 3,
              padding: '10px 14px',
              fontSize: 12,
              lineHeight: 1.5,
              color: 'var(--ink)',
              marginBottom: 20,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: 'var(--terracotta)', fontWeight: 700, flexShrink: 0 }}>ℹ</span>
            <span>
              <strong>International Client Portal:</strong> Sign up with your corporate or individual email. You can specify an
              international Tax ID (EIN, VAT, Reg No.) or Peruvian RUC for invoicing.
            </span>
          </div>
        )}
        <h1 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,44px)', margin: '0 0 12px' }}>
          {authDict.registerTitle || 'Crear cuenta'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 32 }}>
          {authDict.registerIntro || 'Registra tu cuenta corporativa para acceder al seguimiento de tus proyectos y entregables.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={authDict.fullNamePlaceholder || 'Nombre completo'}
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
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={authDict.workEmailPlaceholder || 'tucorreo@empresa.com'}
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
            id="new-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEn ? 'Password (at least 6 characters)' : 'Contraseña (mínimo 6 caracteres)'}
            style={{
              border: '1px solid var(--border)',
              background: '#FFFFFF',
              borderRadius: 3,
              padding: 16,
              fontSize: 14,
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}
          />

          <div style={{ display: 'flex', gap: 1, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            {[
              { value: 'persona_natural', label: isEn ? 'Individual' : 'Persona natural' },
              { value: 'empresa', label: isEn ? 'Corporate Entity' : 'Empresa' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBillingType(opt.value)}
                className={billingType === opt.value ? undefined : 'btn-outline-hover'}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Sans',sans-serif",
                  border: 'none',
                  cursor: 'pointer',
                  background: billingType === opt.value ? 'var(--ink)' : '#FFFFFF',
                  color: billingType === opt.value ? 'var(--bg)' : 'var(--ink)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {billingType === 'empresa' && (
            <input
              id="tax-id"
              name="tax-id"
              required
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder={authDict.taxIdPlaceholder || (isEn ? 'e.g. US EIN, VAT ID or 11-digit RUC' : 'RUC (para factura)')}
              style={{
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                borderRadius: 3,
                padding: 16,
                fontSize: 14,
                fontFamily: "'IBM Plex Sans',sans-serif",
              }}
            />
          )}

          {error && <div style={{ fontSize: 13, color: 'var(--rose)' }}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
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
              cursor: submitting ? 'default' : 'pointer',
              border: 'none',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? authDict.creatingAccountBtn || 'Creando cuenta...' : authDict.createAccountBtn || 'Crear cuenta'}
          </button>
        </form>

        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 24 }}>
          {authDict.alreadyHaveAccountPrompt || '¿Ya tienes cuenta?'}{' '}
          <Link to={isEn ? '/en/login' : '/login'} className="link-hover" style={{ fontWeight: 600 }}>
            {authDict.signInLink || 'Inicia sesión'}
          </Link>
        </div>
      </div>
      <Footer borderTop />
    </>
  );
}
