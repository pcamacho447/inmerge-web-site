import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Registro() {
  useDocumentHead({ title: 'Crear cuenta — Inmerge', path: '/registro', noIndex: true });
  const { signup } = useAuth();
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
      navigate(location.state?.redirectTo || '/cuenta');
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
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
          Portal de seguimiento de proyectos, auditorías e informes técnicos.
        </div>
        <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,44px)', marginBottom: 12 }}>
          Crear cuenta
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 32 }}>
          Registra tu cuenta corporativa para acceder al seguimiento de tus proyectos y entregables.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nombre completo"
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
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@empresa.com"
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
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mínimo 6 caracteres)"
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
              { value: 'persona_natural', label: 'Persona natural' },
              { value: 'empresa', label: 'Empresa' },
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
              required
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="RUC (para factura)"
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
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 24 }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="link-hover" style={{ fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </div>
      </div>
      <Footer borderTop />
    </>
  );
}
