import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Login() {
  useDocumentHead({ title: 'Iniciar sesión — Inmerge', path: '/login', noIndex: true });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate(location.state?.redirectTo || '/cuenta');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
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
          Cuenta real (Supabase) — la suscripción y compra de reportes siguen en modo de vista previa, sin pago real todavía.
        </div>
        <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,44px)', marginBottom: 32 }}>
          Iniciar sesión
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            style={{
              border: '1px solid var(--border)',
              background: '#FFFFFF',
              borderRadius: 3,
              padding: 16,
              fontSize: 14,
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}
          />
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
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 24 }}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="link-hover" style={{ fontWeight: 600 }}>
            Regístrate
          </Link>
        </div>
      </div>
      <Footer borderTop />
    </>
  );
}
