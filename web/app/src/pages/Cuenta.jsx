import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import useClientProjects from '../hooks/useClientProjects.js';
import useOrganizationBilling from '../hooks/useOrganizationBilling.js';
import { useAuth } from '../lib/auth.jsx';
import { getSignedDeliverableUrl } from '../lib/projects.js';
import ToastNotification from '../components/ToastNotification.jsx';

import ClientProjectsView from '../components/client/ClientProjectsView.jsx';
import ClientBillingView from '../components/client/ClientBillingView.jsx';
import ClientSupportCard from '../components/client/ClientSupportCard.jsx';

export default function Cuenta() {
  useDocumentHead({ title: 'Portal de Clientes — Inmerge', path: '/cuenta', noIndex: true });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'billing' | 'support'
  const [downloadingId, setDownloadingId] = useState(null);

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    toast: projectsToast,
    dismissToast: dismissProjectsToast,
  } = useClientProjects();

  const {
    organization,
    orders,
    loading: billingLoading,
    saving: billingSaving,
    toast: billingToast,
    dismissToast: dismissBillingToast,
    saveOrganization,
  } = useOrganizationBilling(user?.id);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function handleDownload(deliverable) {
    if (deliverable.external_url) {
      window.open(deliverable.external_url, '_blank');
      return;
    }

    if (!deliverable.file_path) return;

    setDownloadingId(deliverable.id);
    try {
      const url = await getSignedDeliverableUrl({
        filePath: deliverable.file_path,
        deliverableId: deliverable.id,
      });
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      alert(`No se pudo descargar el archivo: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  }

  const activeToast = projectsToast || billingToast;
  const dismissActiveToast = projectsToast ? dismissProjectsToast : dismissBillingToast;

  return (
    <>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '120px clamp(20px,5vw,40px) 80px' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: 'var(--terracotta)',
                  letterSpacing: 2,
                  fontWeight: 600,
                }}
              >
                PORTAL EXCLUSIVO DE CLIENTES
              </div>
              {organization?.legal_name && (
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(46, 117, 89, 0.12)',
                    color: '#2E7559',
                    border: '1px solid #2E7559',
                    fontWeight: 600,
                  }}
                >
                  🏢 {organization.legal_name}
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,44px)', margin: 0 }}>
              Seguimiento Técnico & Facturación
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {['admin', 'auditor', 'engineer'].includes(user?.role) && (
              <Link
                to="/equipo"
                style={{
                  fontSize: 13,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'var(--terracotta)',
                  textDecoration: 'none',
                  borderBottom: '1px dotted var(--terracotta)',
                  fontWeight: 600,
                }}
              >
                Panel de Consultores →
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="btn-outline-hover"
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                borderRadius: 20,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans',sans-serif",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
          Sesión activa: <strong style={{ color: 'var(--ink)' }}>{user.email}</strong> {user.fullName ? `(${user.fullName})` : ''}
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            borderBottom: '1px solid var(--border)',
            marginBottom: 36,
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'projects' ? '3px solid var(--terracotta)' : '3px solid transparent',
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: activeTab === 'projects' ? 700 : 500,
              color: activeTab === 'projects' ? 'var(--terracotta)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Mis Proyectos & Cronogramas</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 10,
                background: activeTab === 'projects' ? 'var(--terracotta)' : 'var(--border)',
                color: activeTab === 'projects' ? '#fff' : 'var(--ink)',
              }}
            >
              {projects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'billing' ? '3px solid var(--terracotta)' : '3px solid transparent',
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: activeTab === 'billing' ? 700 : 500,
              color: activeTab === 'billing' ? 'var(--terracotta)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Organización & Facturación</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 10,
                background: activeTab === 'billing' ? 'var(--terracotta)' : 'var(--border)',
                color: activeTab === 'billing' ? '#fff' : 'var(--ink)',
              }}
            >
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'support' ? '3px solid var(--terracotta)' : '3px solid transparent',
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: activeTab === 'support' ? 700 : 500,
              color: activeTab === 'support' ? 'var(--terracotta)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            Soporte & Tech Lead
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'projects' && (
          <ClientProjectsView
            projects={projects}
            loading={projectsLoading}
            error={projectsError}
            downloadingId={downloadingId}
            onDownloadDeliverable={handleDownload}
          />
        )}

        {activeTab === 'billing' && (
          <ClientBillingView
            organization={organization}
            orders={orders}
            loading={billingLoading}
            saving={billingSaving}
            onSaveOrganization={saveOrganization}
            user={user}
          />
        )}

        {activeTab === 'support' && (
          <ClientSupportCard user={user} projectsCount={projects.length} />
        )}
      </div>

      <ToastNotification toast={activeToast} onDismiss={dismissActiveToast} />
      <Footer />
    </>
  );
}
