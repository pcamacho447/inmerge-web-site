import { useNavigate, Link } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../lib/auth.jsx';
import { waLink } from '../data/content.js';

export default function Cuenta() {
  useDocumentHead({ title: 'Portal de Clientes — Inmerge', path: '/cuenta', noIndex: true });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const supportWaUrl = waLink(
    `Hola Inmerge, soy cliente registrado con correo ${user.email}. Deseo consultar sobre el estado de mi proyecto/auditoría.`,
  );

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '120px clamp(20px,5vw,40px) 80px' }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}
        >
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: 'var(--terracotta)',
                letterSpacing: 2,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              PORTAL DE CLIENTES
            </div>
            <h1 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,44px)', margin: 0 }}>
              Panel de Cuenta
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-outline-hover"
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              borderRadius: 20,
              padding: '9px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 48 }}>
          Sesión activa: <strong style={{ color: 'var(--ink)' }}>{user.email}</strong>
        </div>

        {/* Project Tracking Banner */}
        <div
          style={{
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            padding: '32px clamp(20px, 4vw, 40px)',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: 'var(--terracotta)',
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            ESTADO DE PROYECTOS & AUDITORÍAS
          </div>
          <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, fontWeight: 700, margin: '0 0 12px 0' }}>
            Seguimiento de Servicios Activos
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Tu cuenta te permite acceder al repositorio de documentación, informes técnicos de auditoría, credenciales de acceso a
            dashboards privados y canales de soporte directo.
          </p>

          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Módulo de Entregables y Trazabilidad</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                Los accesos a repositorios e informes de auditoría se sincronizan tras la firma del TDR.
              </div>
            </div>
            <a
              href={supportWaUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--terracotta)',
                color: '#F3EADA',
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
              className="btn-accent"
            >
              Consultar con Tech Lead
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <Link
            to="/servicios"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 24,
              textDecoration: 'none',
              color: 'var(--ink)',
              display: 'block',
            }}
            className="card-hover"
          >
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--terracotta)', marginBottom: 6 }}>
              SERVICIOS
            </div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Explorar Catálogo</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Revisa los 3 pilares: Auditoría, Desarrollo Cloud y Ciencia de Datos.</div>
          </Link>

          <Link
            to="/metodologia"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 24,
              textDecoration: 'none',
              color: 'var(--ink)',
              display: 'block',
            }}
            className="card-hover"
          >
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--terracotta)', marginBottom: 6 }}>
              ARQUITECTURA
            </div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Stack & Metodología</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Conoce los estándares de seguridad, pipelines y tecnologías aplicadas.
            </div>
          </Link>

          <Link
            to="/contacto"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: 24,
              textDecoration: 'none',
              color: 'var(--ink)',
              display: 'block',
            }}
            className="card-hover"
          >
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--terracotta)', marginBottom: 6 }}>
              REQUERIMIENTO
            </div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Nuevo Proyecto / TDR</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Solicita cotización formal o ampliación de alcance técnico.</div>
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
