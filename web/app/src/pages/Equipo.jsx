import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../lib/auth.jsx';
import { waLink } from '../data/content.js';
import {
  fetchRegisteredClients,
  fetchTeamLeads,
  updateLeadStatus,
  fetchTeamProjects,
  createTeamProject,
  addProjectMilestone,
  updateMilestoneStatus,
  uploadDeliverableFile,
  createDeliverableRecord,
  fetchStaffMembers,
  createStaffMember,
  fetchTeamActivityLogs,
} from '../lib/team.js';

const PILLAR_LABELS = {
  auditoria: '01. Auditoría Técnica & Datos',
  desarrollo: '02. Desarrollo Cloud & AWS',
  datos: '03. Datos & IA',
  integral: 'Solución Integral',
};

const STATUS_COLORS = {
  NUEVO: { bg: 'rgba(168, 71, 43, 0.1)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
  EN_REVISION: { bg: 'rgba(198, 138, 61, 0.12)', text: 'var(--ochre)', border: 'var(--ochre)' },
  CONTACTADO: { bg: 'rgba(216, 168, 78, 0.15)', text: '#9B7322', border: 'var(--gold)' },
  PROPUESTA_ENVIADA: { bg: 'rgba(74, 114, 186, 0.1)', text: '#345995', border: '#345995' },
  CERRADO_GANADO: { bg: 'rgba(46, 117, 89, 0.12)', text: '#2E7559', border: '#2E7559' },
  DESCARTADO: { bg: 'rgba(0,0,0,0.05)', text: 'var(--muted)', border: 'var(--border)' },
};

const MILESTONE_STATUS_COLORS = {
  PENDIENTE: { bg: 'rgba(0,0,0,0.04)', text: 'var(--muted)', border: 'var(--border)' },
  EN_PROCESO: { bg: 'rgba(198, 138, 61, 0.15)', text: 'var(--ochre)', border: 'var(--ochre)' },
  COMPLETADO: { bg: 'rgba(46, 117, 89, 0.15)', text: '#2E7559', border: '#2E7559' },
  BLOQUEADO: { bg: 'rgba(168, 71, 43, 0.15)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
};

const ACTIVITY_ACTION_BADGES = {
  LEAD_STATUS_UPDATED: { label: 'LEAD ACTUALIZADO', bg: 'rgba(216, 168, 78, 0.15)', text: '#9B7322', border: 'var(--gold)' },
  PROJECT_CREATED: { label: 'PROYECTO CREADO', bg: 'rgba(168, 71, 43, 0.1)', text: 'var(--terracotta)', border: 'var(--terracotta)' },
  MILESTONE_CREATED: { label: 'HITO AGREGADO', bg: 'rgba(36, 26, 18, 0.08)', text: 'var(--ink)', border: 'var(--border)' },
  MILESTONE_STATUS_UPDATED: { label: 'HITO ACTUALIZADO', bg: 'rgba(198, 138, 61, 0.15)', text: 'var(--ochre)', border: 'var(--ochre)' },
  DELIVERABLE_PUBLISHED: { label: 'ENTREGABLE PUBLICADO', bg: 'rgba(46, 117, 89, 0.15)', text: '#2E7559', border: '#2E7559' },
  STAFF_REGISTERED: { label: 'STAFF REGISTRADO', bg: 'rgba(74, 114, 186, 0.12)', text: '#345995', border: '#345995' },
};

export default function Equipo() {
  useDocumentHead({ title: 'Panel de Equipo & Consultores — Inmerge', path: '/equipo', noIndex: true });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'projects' | 'new_project' | 'activity' | 'team'
  const [activityFilter, setActivityFilter] = useState('ALL'); // 'ALL' | 'LEADS' | 'PROJECTS' | 'DELIVERABLES' | 'STAFF'
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // New Project Form State
  const [newProj, setNewProj] = useState({
    clientId: '',
    title: '',
    pillar: 'auditoria',
    description: '',
    targetCompletionDate: '',
    techLeadName: user?.fullName || 'Inmerge Tech Lead',
    techLeadContact: user?.email || 'contacto@inmerge.pe',
  });

  // Milestone Form State
  const [newMilestone, setNewMilestone] = useState({
    projectId: '',
    title: '',
    description: '',
    dueDate: '',
  });

  // Deliverable Upload Form State
  const [newDeliv, setNewDeliv] = useState({
    projectId: '',
    milestoneId: '',
    title: '',
    fileType: 'PDF',
    externalUrl: '',
    version: 'v1.0',
    notes: '',
  });
  const [delivFile, setDelivFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // New Staff Member Form State (Admins only)
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'engineer',
  });
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [leadsData, projsData, clientsData, logsData] = await Promise.all([
        fetchTeamLeads().catch(() => []),
        fetchTeamProjects().catch(() => []),
        fetchRegisteredClients().catch(() => []),
        fetchTeamActivityLogs({ limit: 50 }).catch(() => []),
      ]);
      setLeads(leadsData);
      setProjects(projsData);
      setClients(clientsData);
      setActivityLogs(logsData);

      if (user?.role === 'admin') {
        const staffData = await fetchStaffMembers().catch(() => []);
        setStaffList(staffData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateLead(leadId, newStatus) {
    try {
      await updateLeadStatus(leadId, { status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      showTemporaryMsg('Estado del lead actualizado y registrado en auditoría.');
      fetchTeamActivityLogs({ limit: 50 }).then(setActivityLogs).catch(() => {});
    } catch (err) {
      alert(`Error al actualizar lead: ${err.message}`);
    }
  }

  function handleConvertLeadToProject(lead) {
    const matchedClient = clients.find(
      (c) => c.email && c.email.toLowerCase() === lead.email?.toLowerCase()
    );

    setNewProj({
      clientId: matchedClient ? matchedClient.id : (clients[0]?.id || ''),
      title: `${PILLAR_LABELS[lead.pillar] || 'Proyecto'} — ${lead.company || lead.full_name || 'Cliente'}`,
      pillar: ['auditoria', 'desarrollo', 'datos', 'integral'].includes(lead.pillar) ? lead.pillar : 'auditoria',
      description: `Requerimiento TDR: ${lead.message || 'Sin descripción'}\n\nContacto: ${lead.full_name || 'N/A'} (${lead.email || 'N/A'}${lead.phone ? `, Tel: ${lead.phone}` : ''})\nPlazo estimado: ${lead.timeline || 'A coordinar'}`,
      targetCompletionDate: '',
      techLeadName: user?.fullName || 'Inmerge Tech Lead',
      techLeadContact: user?.email || 'contacto@inmerge.pe',
    });

    setActiveTab('new_project');
    if (matchedClient) {
      showTemporaryMsg(`Lead vinculado automáticamente con el cliente registrado: ${matchedClient.full_name || matchedClient.email}`);
    } else {
      showTemporaryMsg(`Datos del lead pre-cargados. Selecciona el cliente correspondiente o solicita su registro previo.`);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProj.clientId || !newProj.title) {
      alert('Por favor selecciona un cliente registrado e ingresa el título del proyecto.');
      return;
    }

    try {
      const created = await createTeamProject(newProj);
      showTemporaryMsg(`Proyecto "${created.title}" creado exitosamente.`);
      setNewProj({
        clientId: '',
        title: '',
        pillar: 'auditoria',
        description: '',
        targetCompletionDate: '',
        techLeadName: user?.fullName || 'Inmerge Tech Lead',
        techLeadContact: user?.email || 'contacto@inmerge.pe',
      });
      await loadData();
      setActiveTab('projects');
    } catch (err) {
      alert(`Error al crear proyecto: ${err.message}`);
    }
  }

  async function handleAddMilestone(e) {
    e.preventDefault();
    if (!newMilestone.projectId || !newMilestone.title) {
      alert('Selecciona un proyecto e ingresa el título del hito.');
      return;
    }

    try {
      await addProjectMilestone({
        projectId: newMilestone.projectId,
        title: newMilestone.title,
        description: newMilestone.description,
        dueDate: newMilestone.dueDate || null,
      });
      showTemporaryMsg('Hito agregado correctamente.');
      setNewMilestone({ projectId: '', title: '', description: '', dueDate: '' });
      await loadData();
    } catch (err) {
      alert(`Error al agregar hito: ${err.message}`);
    }
  }

  async function handleUpdateMilestone(milestoneId, newStatus) {
    try {
      await updateMilestoneStatus(milestoneId, newStatus);
      showTemporaryMsg('Estado de hito actualizado.');
      await loadData();
    } catch (err) {
      alert(`Error al actualizar hito: ${err.message}`);
    }
  }

  async function handleUploadDeliverable(e) {
    e.preventDefault();
    if (!newDeliv.projectId || !newDeliv.title) {
      alert('Selecciona el proyecto e ingresa el nombre del entregable.');
      return;
    }

    setUploading(true);
    try {
      let filePath = null;
      if (delivFile) {
        const safeName = `${newDeliv.projectId}/${Date.now()}_${delivFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        filePath = await uploadDeliverableFile(delivFile, safeName);
      }

      const targetProject = projects.find((p) => p.id === newDeliv.projectId);

      await createDeliverableRecord({
        projectId: newDeliv.projectId,
        milestoneId: newDeliv.milestoneId || null,
        title: newDeliv.title,
        fileType: newDeliv.fileType,
        filePath,
        externalUrl: newDeliv.externalUrl || null,
        version: newDeliv.version || 'v1.0',
        notes: newDeliv.notes || '',
        project: targetProject,
        clientEmail: targetProject?.client?.email,
        clientName: targetProject?.client?.full_name,
      });

      showTemporaryMsg('Entregable publicado, notificado al cliente y registrado en auditoría.');
      setNewDeliv({
        projectId: '',
        milestoneId: '',
        title: '',
        fileType: 'PDF',
        externalUrl: '',
        version: 'v1.0',
        notes: '',
      });
      setDelivFile(null);
      await loadData();
    } catch (err) {
      alert(`Error al publicar entregable: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateStaff(e) {
    e.preventDefault();
    if (!newStaff.fullName || !newStaff.email || !newStaff.password) {
      alert('Por favor completa todos los campos del formulario de colaborador.');
      return;
    }

    setStaffSubmitting(true);
    try {
      await createStaffMember({
        fullName: newStaff.fullName,
        email: newStaff.email,
        password: newStaff.password,
        role: newStaff.role,
      });

      showTemporaryMsg(`Colaborador ${newStaff.fullName} (${newStaff.email}) dado de alta exitosamente con rol ${newStaff.role}.`);
      setNewStaff({
        fullName: '',
        email: '',
        password: '',
        role: 'engineer',
      });
      await loadData();
    } catch (err) {
      alert(`Error al registrar colaborador: ${err.message}`);
    } finally {
      setStaffSubmitting(false);
    }
  }

  function showTemporaryMsg(msg) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4000);
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  // Filter activity logs by active filter category
  const filteredActivityLogs = activityLogs.filter((log) => {
    if (activityFilter === 'ALL') return true;
    if (activityFilter === 'LEADS') return log.action.includes('LEAD');
    if (activityFilter === 'PROJECTS') return log.action.includes('PROJECT') || log.action.includes('MILESTONE');
    if (activityFilter === 'DELIVERABLES') return log.action.includes('DELIVERABLE');
    if (activityFilter === 'STAFF') return log.action.includes('STAFF');
    return true;
  });

  return (
    <>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '120px clamp(20px,5vw,40px) 80px' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: 'var(--terracotta)',
                letterSpacing: 2,
                marginBottom: 6,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>PANEL DE EQUIPO & CONSULTORÍA</span>
              <span
                style={{
                  background: 'var(--terracotta)',
                  color: '#fff',
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                {user?.role || 'STAFF'}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,42px)', margin: 0 }}>
              Gestión Operativa de Auditorías & Proyectos
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link
              to="/cuenta"
              style={{
                fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
                color: 'var(--ink)',
                textDecoration: 'none',
                borderBottom: '1px dotted var(--terracotta)',
              }}
            >
              Vista de Cliente →
            </Link>
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

        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
          Consultor conectado: <strong style={{ color: 'var(--ink)' }}>{user?.email}</strong> ({user?.fullName || 'Inmerge Staff'})
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 8,
              background: 'rgba(46, 117, 89, 0.15)',
              border: '1px solid #2E7559',
              color: '#1b4d3a',
              marginBottom: 24,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ✓ {statusMsg}
          </div>
        )}

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
            onClick={() => setActiveTab('leads')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'leads' ? '3px solid var(--terracotta)' : '3px solid transparent',
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: activeTab === 'leads' ? 700 : 500,
              color: activeTab === 'leads' ? 'var(--terracotta)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Bandeja de Leads & TDR</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 10,
                background: activeTab === 'leads' ? 'var(--terracotta)' : 'var(--border)',
                color: activeTab === 'leads' ? '#fff' : 'var(--ink)',
              }}
            >
              {leads.length}
            </span>
          </button>

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
            <span>Proyectos & Auditorías</span>
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
            onClick={() => setActiveTab('new_project')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'new_project' ? '3px solid var(--terracotta)' : '3px solid transparent',
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: activeTab === 'new_project' ? 700 : 500,
              color: activeTab === 'new_project' ? 'var(--terracotta)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            + Crear Proyecto / Entregable
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'activity' ? '3px solid var(--terracotta)' : '3px solid transparent',
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: activeTab === 'activity' ? 700 : 500,
              color: activeTab === 'activity' ? 'var(--terracotta)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Bitácora & Auditoría</span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 10,
                background: activeTab === 'activity' ? 'var(--terracotta)' : 'var(--border)',
                color: activeTab === 'activity' ? '#fff' : 'var(--ink)',
              }}
            >
              {activityLogs.length}
            </span>
          </button>

          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('team')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'team' ? '3px solid var(--terracotta)' : '3px solid transparent',
                padding: '12px 20px',
                fontSize: 15,
                fontWeight: activeTab === 'team' ? 700 : 500,
                color: activeTab === 'team' ? 'var(--terracotta)' : 'var(--muted)',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Gestión de Colaboradores</span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  padding: '2px 6px',
                  borderRadius: 10,
                  background: activeTab === 'team' ? 'var(--terracotta)' : 'var(--border)',
                  color: activeTab === 'team' ? '#fff' : 'var(--ink)',
                }}
              >
                {staffList.length}
              </span>
            </button>
          )}
        </div>

        {/* Content Tabs */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <p>Cargando información del equipo técnico...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: LEADS TDR */}
            {activeTab === 'leads' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: 0 }}>
                    Solicitudes de Cotización Recibidas ({leads.length})
                  </h2>
                </div>

                {leads.length === 0 ? (
                  <div
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      background: 'var(--cream2)',
                      borderRadius: 8,
                      border: '1px dashed var(--border)',
                    }}
                  >
                    <p style={{ color: 'var(--muted)', margin: 0 }}>No hay solicitudes de cotización registradas aún.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {leads.map((lead) => {
                      const color = STATUS_COLORS[lead.status] || STATUS_COLORS.NUEVO;
                      const matchedClient = clients.find(
                        (c) => c.email && c.email.toLowerCase() === lead.email?.toLowerCase()
                      );

                      const leadWaMsg = `Hola ${lead.full_name || 'estimado(a)'}, te saluda ${user?.fullName || 'el equipo técnico'} de Inmerge. Recibimos tu solicitud para "${PILLAR_LABELS[lead.pillar] || lead.pillar}"${lead.company ? ` en ${lead.company}` : ''}. ¿Podemos agendar una breve llamada técnica para revisar los requerimientos?`;
                      const leadWaUrl = waLink(leadWaMsg);

                      return (
                        <div
                          key={lead.id}
                          style={{
                            background: 'var(--cream2)',
                            borderRadius: 8,
                            padding: '24px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: 11,
                                    padding: '3px 8px',
                                    borderRadius: 4,
                                    background: color.bg,
                                    color: color.text,
                                    border: `1px solid ${color.border}`,
                                    fontWeight: 700,
                                  }}
                                >
                                  {lead.status}
                                </span>
                                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--terracotta)', fontWeight: 600 }}>
                                  {PILLAR_LABELS[lead.pillar] || lead.pillar}
                                </span>
                                {matchedClient ? (
                                  <span
                                    style={{
                                      fontFamily: "'IBM Plex Mono', monospace",
                                      fontSize: 11,
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      background: 'rgba(46, 117, 89, 0.12)',
                                      color: '#2E7559',
                                      border: '1px solid #2E7559',
                                    }}
                                  >
                                    ✓ Cuenta Cliente Vinculada
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontFamily: "'IBM Plex Mono', monospace",
                                      fontSize: 11,
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      background: 'rgba(0,0,0,0.04)',
                                      color: 'var(--muted)',
                                      border: '1px solid var(--border)',
                                    }}
                                  >
                                    Prospecto nuevo
                                  </span>
                                )}
                              </div>
                              <h3 style={{ margin: '4px 0', fontSize: 18, fontWeight: 700 }}>
                                {lead.company ? `${lead.company} — ` : ''}{lead.full_name || 'Solicitud Anónima'}
                              </h3>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
                                {new Date(lead.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          <div style={{ background: '#fff', padding: 14, borderRadius: 6, marginBottom: 14, border: '1px solid rgba(0,0,0,0.06)' }}>
                            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)', marginBottom: 4 }}>
                              DESCRIPCIÓN DEL REQUERIMIENTO / TDR:
                            </div>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}>
                              {lead.message}
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--muted)' }}>
                              <span>📧 <strong style={{ color: 'var(--ink)' }}>{lead.email}</strong></span>
                              {lead.phone && <span>📞 <strong style={{ color: 'var(--ink)' }}>{lead.phone}</strong></span>}
                              {lead.timeline && <span>⏱️ Plazo: <strong style={{ color: 'var(--ink)' }}>{lead.timeline}</strong></span>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <a
                                href={leadWaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  background: '#25D366',
                                  color: '#fff',
                                  padding: '6px 14px',
                                  borderRadius: 20,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  fontFamily: "'IBM Plex Sans', sans-serif",
                                }}
                              >
                                💬 WhatsApp Directo
                              </a>

                              <button
                                type="button"
                                onClick={() => handleConvertLeadToProject(lead)}
                                style={{
                                  background: 'var(--terracotta)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '6px 14px',
                                  borderRadius: 20,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontFamily: "'IBM Plex Sans', sans-serif",
                                }}
                              >
                                Convertir en Proyecto →
                              </button>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <label style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>Estado:</label>
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleUpdateLead(lead.id, e.target.value)}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: 4,
                                    border: '1px solid var(--border)',
                                    background: '#fff',
                                    fontSize: 12,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    fontWeight: 600,
                                  }}
                                >
                                  <option value="NUEVO">NUEVO</option>
                                  <option value="EN_REVISION">EN_REVISION</option>
                                  <option value="CONTACTADO">CONTACTADO</option>
                                  <option value="PROPUESTA_ENVIADA">PROPUESTA_ENVIADA</option>
                                  <option value="CERRADO_GANADO">CERRADO_GANADO</option>
                                  <option value="DESCARTADO">DESCARTADO</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROJECTS & AUDITS */}
            {activeTab === 'projects' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: 0 }}>
                    Proyectos en Curso & Auditorías ({projects.length})
                  </h2>
                </div>

                {projects.length === 0 ? (
                  <div
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      background: 'var(--cream2)',
                      borderRadius: 8,
                      border: '1px dashed var(--border)',
                    }}
                  >
                    <p style={{ color: 'var(--muted)', margin: 0 }}>No hay proyectos activos registrados.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {projects.map((proj) => {
                      const totalMilestones = proj.milestones?.length || 0;
                      const completedMilestones = proj.milestones?.filter((m) => m.status === 'COMPLETADO').length || 0;
                      const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                      return (
                        <div
                          key={proj.id}
                          style={{
                            background: 'var(--cream2)',
                            borderRadius: 8,
                            padding: '24px',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                            <div>
                              <span
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: 11,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: 'rgba(168,71,43,0.1)',
                                  color: 'var(--terracotta)',
                                  border: '1px solid var(--terracotta)',
                                  fontWeight: 700,
                                  marginRight: 8,
                                }}
                              >
                                {proj.status}
                              </span>
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
                                Pilar: <strong>{PILLAR_LABELS[proj.pillar] || proj.pillar}</strong>
                              </span>
                              <h3 style={{ margin: '8px 0 4px', fontSize: 20, fontFamily: "'Spectral', serif", fontWeight: 700 }}>
                                {proj.title}
                              </h3>
                              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                                Cliente: <strong style={{ color: 'var(--ink)' }}>{proj.client?.full_name ? `${proj.client.full_name} (${proj.client.email})` : (proj.client?.email || proj.client_id)}</strong>
                                {proj.client?.company && ` — ${proj.client.company}`}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)' }}>
                              <div>Inicio: {proj.start_date || 'N/A'}</div>
                              {proj.target_completion_date && <div>Entrega estimada: {proj.target_completion_date}</div>}
                            </div>
                          </div>

                          {proj.description && (
                            <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 16, whiteSpace: 'pre-line' }}>
                              {proj.description}
                            </p>
                          )}

                          {/* Progress Bar */}
                          <div style={{ margin: '16px 0', background: '#fff', padding: 14, borderRadius: 6, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                              <span>Avance de Hitos: <strong>{completedMilestones} de {totalMilestones} completados</strong></span>
                              <span style={{ fontWeight: 700, color: 'var(--terracotta)' }}>{progressPct}%</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: 'var(--cream2)', borderRadius: 3, overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${progressPct}%`,
                                  height: '100%',
                                  background: 'var(--terracotta)',
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                          </div>

                          {/* Milestones Accordion / List */}
                          {proj.milestones && proj.milestones.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>
                                HITOS DE TRABAJO:
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {proj.milestones.map((m) => {
                                  const mColor = MILESTONE_STATUS_COLORS[m.status] || MILESTONE_STATUS_COLORS.PENDIENTE;
                                  return (
                                    <div
                                      key={m.id}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: '#fff',
                                        padding: '8px 12px',
                                        borderRadius: 4,
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        fontSize: 13,
                                        flexWrap: 'wrap',
                                        gap: 8,
                                      }}
                                    >
                                      <div>
                                        <strong>{m.title}</strong>
                                        {m.due_date && (
                                          <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
                                            (Fecha: {m.due_date})
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <select
                                          value={m.status}
                                          onChange={(e) => handleUpdateMilestone(m.id, e.target.value)}
                                          style={{
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            border: `1px solid ${mColor.border}`,
                                            background: mColor.bg,
                                            color: mColor.text,
                                            fontSize: 11,
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontWeight: 700,
                                          }}
                                        >
                                          <option value="PENDIENTE">PENDIENTE</option>
                                          <option value="EN_PROCESO">EN_PROCESO</option>
                                          <option value="COMPLETADO">COMPLETADO</option>
                                          <option value="BLOQUEADO">BLOQUEADO</option>
                                        </select>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Deliverables summary */}
                          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13 }}>
                            <div>
                              📍 <strong>{totalMilestones} Hitos</strong> registrados
                            </div>
                            <div>
                              📦 <strong>{proj.deliverables?.length || 0} Entregables</strong> publicados
                            </div>
                            <div>
                              👨‍💻 Tech Lead: <strong>{proj.tech_lead_name || 'Inmerge Lead'}</strong> ({proj.tech_lead_contact || 'contacto@inmerge.pe'})
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CREATE PROJECT / ADD DELIVERABLE */}
            {activeTab === 'new_project' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
                {/* Form 1: New Project */}
                <div
                  style={{
                    background: 'var(--cream2)',
                    padding: 24,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
                    1. Registrar Nuevo Proyecto
                  </h3>
                  <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Cliente Asignado (Seleccionar Usuario Registrado) *
                      </label>
                      <select
                        value={newProj.clientId}
                        onChange={(e) => setNewProj({ ...newProj, clientId: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                          background: '#fff',
                        }}
                      >
                        <option value="">-- Seleccionar Cliente ({clients.length} disponibles) --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.full_name ? `${c.full_name} (${c.email})` : c.email} {c.company ? `— ${c.company}` : ''}
                          </option>
                        ))}
                      </select>
                      {clients.length === 0 && (
                        <div style={{ fontSize: 11, color: 'var(--terracotta)', marginTop: 4 }}>
                          Nota: No hay cuentas de cliente registradas aún. El cliente puede registrarse en /registro.
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Nombre del Proyecto / Auditoría *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Auditoría Integral de Base de Datos y AWS"
                        value={newProj.title}
                        onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Pilar Estratégico *
                      </label>
                      <select
                        value={newProj.pillar}
                        onChange={(e) => setNewProj({ ...newProj, pillar: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="auditoria">01. Auditoría Técnica & Datos</option>
                        <option value="desarrollo">02. Desarrollo Cloud & AWS</option>
                        <option value="datos">03. Datos & IA</option>
                        <option value="integral">Solución Integral Multi-pilar</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Descripción del Alcance
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Objetivos técnicos, infraestructura evaluada y entregables acordados..."
                        value={newProj.description}
                        onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Fecha Estimada de Entrega
                      </label>
                      <input
                        type="date"
                        value={newProj.targetCompletionDate}
                        onChange={(e) => setNewProj({ ...newProj, targetCompletionDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        background: 'var(--terracotta)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 20,
                        padding: '10px 20px',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: 8,
                      }}
                    >
                      Guardar Proyecto
                    </button>
                  </form>
                </div>

                {/* Form 2: Add Milestone & Upload Deliverable */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Milestone Form */}
                  <div
                    style={{
                      background: 'var(--cream2)',
                      padding: 24,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
                      2. Agregar Hito a Proyecto
                    </h3>
                    <form onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                          Seleccionar Proyecto *
                        </label>
                        <select
                          value={newMilestone.projectId}
                          onChange={(e) => setNewMilestone({ ...newMilestone, projectId: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="">-- Seleccionar Proyecto --</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                          Título del Hito *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Fase 01 — Diagnóstico de Queries y Rendimiento"
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                          Fecha Límite
                        </label>
                        <input
                          type="date"
                          value={newMilestone.dueDate}
                          onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        style={{
                          background: 'var(--ink)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 20,
                          padding: '9px 18px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Añadir Hito
                      </button>
                    </form>
                  </div>

                  {/* Deliverable Form */}
                  <div
                    style={{
                      background: 'var(--cream2)',
                      padding: 24,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
                      3. Publicar Entregable / Informe Técnico
                    </h3>
                    <form onSubmit={handleUploadDeliverable} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                          Proyecto Destino *
                        </label>
                        <select
                          value={newDeliv.projectId}
                          onChange={(e) => setNewDeliv({ ...newDeliv, projectId: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="">-- Seleccionar Proyecto --</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                          Nombre del Entregable *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Informe_Auditoria_Arquitectura_Cloud_v1.0.pdf"
                          value={newDeliv.title}
                          onChange={(e) => setNewDeliv({ ...newDeliv, title: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                            Tipo
                          </label>
                          <select
                            value={newDeliv.fileType}
                            onChange={(e) => setNewDeliv({ ...newDeliv, fileType: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 4,
                              border: '1px solid var(--border)',
                              fontSize: 13,
                              boxSizing: 'border-box',
                            }}
                          >
                            <option value="PDF">PDF / Informe Técnico</option>
                            <option value="DASHBOARD_URL">Dashboard BI URL</option>
                            <option value="REPO">Repositorio Git</option>
                            <option value="DATASET">Dataset / CSV</option>
                            <option value="DOCUMENTO">Documento Técnico</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                            Versión
                          </label>
                          <input
                            type="text"
                            value={newDeliv.version}
                            onChange={(e) => setNewDeliv({ ...newDeliv, version: e.target.value })}
                            placeholder="v1.0"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 4,
                              border: '1px solid var(--border)',
                              fontSize: 13,
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>

                      {newDeliv.fileType === 'PDF' || newDeliv.fileType === 'DATASET' || newDeliv.fileType === 'DOCUMENTO' ? (
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                            Subir Archivo a Storage Seguro
                          </label>
                          <input
                            type="file"
                            onChange={(e) => setDelivFile(e.target.files?.[0] || null)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              fontSize: 12,
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      ) : (
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                            URL Externa (Dashboard / Repositorio)
                          </label>
                          <input
                            type="url"
                            placeholder="https://lookerstudio.google.com/..."
                            value={newDeliv.externalUrl}
                            onChange={(e) => setNewDeliv({ ...newDeliv, externalUrl: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 4,
                              border: '1px solid var(--border)',
                              fontSize: 13,
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={uploading}
                        style={{
                          background: 'var(--terracotta)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 20,
                          padding: '10px 20px',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          opacity: uploading ? 0.7 : 1,
                        }}
                      >
                        {uploading ? 'Subiendo archivo...' : 'Publicar Entregable'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AUDIT LOGS & ACTIVITY TIMELINE */}
            {activeTab === 'activity' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 24, margin: 0 }}>
                      Bitácora de Auditoría Técnica & Actividad ({filteredActivityLogs.length})
                    </h2>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                      Registro inmutable de trazabilidad de proyectos, hitos, entregables y leads.
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { key: 'ALL', label: 'Todos' },
                      { key: 'LEADS', label: 'Leads TDR' },
                      { key: 'PROJECTS', label: 'Proyectos & Hitos' },
                      { key: 'DELIVERABLES', label: 'Entregables' },
                      { key: 'STAFF', label: 'Equipo' },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => setActivityFilter(btn.key)}
                        style={{
                          background: activityFilter === btn.key ? 'var(--terracotta)' : 'var(--cream2)',
                          color: activityFilter === btn.key ? '#fff' : 'var(--ink)',
                          border: '1px solid var(--border)',
                          borderRadius: 16,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontFamily: "'IBM Plex Sans', sans-serif",
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredActivityLogs.length === 0 ? (
                  <div
                    style={{
                      padding: 40,
                      textAlign: 'center',
                      background: 'var(--cream2)',
                      borderRadius: 8,
                      border: '1px dashed var(--border)',
                    }}
                  >
                    <p style={{ color: 'var(--muted)', margin: 0 }}>No hay eventos registrados en esta categoría.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredActivityLogs.map((log) => {
                      const badge = ACTIVITY_ACTION_BADGES[log.action] || {
                        label: log.action,
                        bg: 'rgba(0,0,0,0.05)',
                        text: 'var(--ink)',
                        border: 'var(--border)',
                      };

                      return (
                        <div
                          key={log.id}
                          style={{
                            background: 'var(--cream2)',
                            borderRadius: 8,
                            padding: '16px 20px',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 12,
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: 10,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: badge.bg,
                                  color: badge.text,
                                  border: `1px solid ${badge.border}`,
                                  fontWeight: 700,
                                }}
                              >
                                {badge.label}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                                Entidad: <strong>{log.entity_type}</strong>
                              </span>
                            </div>

                            <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 6 }}>
                              {log.action === 'PROJECT_CREATED' && (
                                <span>Proyecto creado: <strong>{log.details?.title}</strong> (Pilar: {log.details?.pillar})</span>
                              )}
                              {log.action === 'LEAD_STATUS_UPDATED' && (
                                <span>Lead actualizado a <strong>{log.details?.new_status}</strong> {log.details?.full_name ? `(${log.details.full_name})` : ''}</span>
                              )}
                              {log.action === 'MILESTONE_CREATED' && (
                                <span>Nuevo hito creado: <strong>{log.details?.title}</strong></span>
                              )}
                              {log.action === 'MILESTONE_STATUS_UPDATED' && (
                                <span>Hito cambiado a <strong>{log.details?.new_status}</strong> {log.details?.title ? `(${log.details.title})` : ''}</span>
                              )}
                              {log.action === 'DELIVERABLE_PUBLISHED' && (
                                <span>Entregable publicado: <strong>{log.details?.title}</strong> ({log.details?.file_type} {log.details?.version})</span>
                              )}
                              {log.action === 'STAFF_REGISTERED' && (
                                <span>Nuevo colaborador dado de alta: <strong>{log.details?.full_name}</strong> ({log.details?.email}, Rol: {log.details?.role})</span>
                              )}
                            </div>

                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                              Autor: <strong style={{ color: 'var(--ink)' }}>{log.author?.full_name || log.author?.email || 'Sistema / Staff'}</strong>
                              {log.author?.role && ` (${log.author.role})`}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)' }}>
                            {new Date(log.created_at).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: TEAM MANAGEMENT (ADMINS ONLY) */}
            {activeTab === 'team' && user?.role === 'admin' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
                {/* Form: Register New Staff */}
                <div
                  style={{
                    background: 'var(--cream2)',
                    padding: 24,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
                    Alta de Nuevo Colaborador / Consultor
                  </h3>
                  <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Andrea Valdivia"
                        value={newStaff.fullName}
                        onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Correo Institucional *
                      </label>
                      <input
                        type="email"
                        placeholder="colaborador@inmerge.pe"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Contraseña Inicial *
                      </label>
                      <input
                        type="password"
                        placeholder="Contraseña segura"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        required
                        minLength={6}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                        Rol Asignado *
                      </label>
                      <select
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="engineer">Ingeniero de Software / Cloud (engineer)</option>
                        <option value="auditor">Auditor Técnico & Datos (auditor)</option>
                        <option value="admin">Administrador General (admin)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={staffSubmitting}
                      style={{
                        background: 'var(--terracotta)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 20,
                        padding: '10px 20px',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: staffSubmitting ? 'not-allowed' : 'pointer',
                        marginTop: 8,
                      }}
                    >
                      {staffSubmitting ? 'Registrando...' : 'Registrar Colaborador'}
                    </button>
                  </form>
                </div>

                {/* Staff List Table */}
                <div
                  style={{
                    background: 'var(--cream2)',
                    padding: 24,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
                    Equipo Interno ({staffList.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {staffList.map((st) => (
                      <div
                        key={st.id}
                        style={{
                          background: '#fff',
                          padding: '12px 16px',
                          borderRadius: 6,
                          border: '1px solid rgba(0,0,0,0.06)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{st.full_name || 'Sin nombre'}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>{st.email}</div>
                        </div>
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: st.role === 'admin' ? 'rgba(168,71,43,0.1)' : 'rgba(198,138,61,0.15)',
                            color: st.role === 'admin' ? 'var(--terracotta)' : 'var(--ochre)',
                            border: `1px solid ${st.role === 'admin' ? 'var(--terracotta)' : 'var(--ochre)'}`,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {st.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
