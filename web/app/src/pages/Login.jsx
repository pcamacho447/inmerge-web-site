import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

import { supabase } from '../lib/supabaseClient.js';

export default function Login() {
  const { login } = useAuth();
  const { isEn, content } = useLanguage();
  const authDict = content?.AUTH_CONTENT || {};

  useDocumentHead({
    title: isEn ? 'Sign in — Inmerge' : 'Iniciar sesión — Inmerge',
    path: isEn ? '/en/login' : '/login',
    noIndex: true,
  });

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

      // Si el usuario venía con un redirectTo específico, respetar esa ruta
      if (location.state?.redirectTo) {
        navigate(location.state.redirectTo);
        return;
      }

      // Redirección inteligente según el rol del usuario
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', authUser.id).maybeSingle();

        const role = profile?.role || 'client';
        if (['admin', 'auditor', 'engineer'].includes(role)) {
          navigate('/equipo');
          return;
        }
      }

      navigate(isEn ? '/en/account' : '/cuenta');
    } catch (err) {
      if (
        err.message?.toLowerCase().includes('invalid login credentials') ||
        err.message?.toLowerCase().includes('invalid grant') ||
        err.status === 400
      ) {
        setError(authDict.invalidCredentialsError || 'Tus credenciales son incorrectas.');
      } else {
        setError(err.message || authDict.invalidCredentialsError || 'Tus credenciales son incorrectas.');
      }
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
          {authDict.loginSubtitle || 'Portal seguro de seguimiento de proyectos, auditorías y entregables técnicos.'}
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
              <strong>International Client Portal:</strong> Project tracking, architecture milestones, and deliverables are fully available in English. Domestic payments operate in PEN, while international corporate agreements use institutional wire transfer (SWIFT).
            </span>
          </div>
        )}
        <h1 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,44px)', margin: '0 0 32px' }}>
          {authDict.loginTitle || 'Iniciar sesión'}
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={authDict.emailPlaceholder || 'tucorreo@empresa.com'}
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
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={authDict.passwordPlaceholder || 'Contraseña'}
            style={{
              border: '1px solid var(--border)',
              background: '#FFFFFF',
              borderRadius: 3,
              padding: 16,
              fontSize: 14,
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}
          />
          {error && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--rose)',
                background: 'rgba(208, 138, 110, 0.12)',
                padding: '10px 14px',
                borderRadius: 4,
                border: '1px solid var(--rose)',
              }}
            >
              {typeof error === 'string' ? error : error?.message || authDict.invalidCredentialsError}
            </div>
          )}
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
            {submitting ? authDict.signingInBtn || 'Entrando...' : authDict.signInBtn || 'Entrar'}
          </button>
        </form>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 24 }}>
          {authDict.noAccountPrompt || '¿No tienes cuenta?'}{' '}
          <Link to={isEn ? '/en/register' : '/registro'} className="link-hover" style={{ fontWeight: 600 }}>
            {authDict.createAccountLink || 'Regístrate'}
          </Link>
        </div>
      </div>
      <Footer borderTop />
    </>
  );
}
