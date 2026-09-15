import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../lib/auth.jsx';
import {
  fetchRegisteredClients,
  fetchTeamLeads,
  updateLeadStatus,
  fetchTeamProjects,
  createTeamProject,
  updateProjectStatus,
  addProjectMilestone,
  updateMilestoneStatus,
  uploadDeliverableFile,
  createDeliverableRecord,
  fetchStaffMembers,
  createStaffMember,
  fetchTeamActivityLogs,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  createProjectRisk,
  updateProjectRisk,
  updateProjectHealth,
} from '../lib/team.js';
import useRealtimeTeam from '../hooks/useRealtimeTeam.js';
import ToastNotification from '../components/ToastNotification.jsx';

import LeadsInboxTable, { PILLAR_LABELS } from '../components/team/LeadsInboxTable.jsx';
import ProjectsManagementView from '../components/team/ProjectsManagementView.jsx';
import NewProjectModal from '../components/team/NewProjectModal.jsx';
import TeamActivityFeed from '../components/team/TeamActivityFeed.jsx';
import StaffManagementView from '../components/team/StaffManagementView.jsx';

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
    techLeadContact: user?.email || 'inmerge3@gmail.com',
  });

  // Milestone Form State
  const [newMilestone, setNewMilestone] = useState({
    projectId: '',
    title: '',
    description: '',
    dueDate: '',
    orderIndex: 1,
    phasePreset: '01',
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
    loadData(true);
  }, []);

  async function loadData(showSkeleton = true) {
    if (showSkeleton) {
      setLoading(true);
    }
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
      if (showSkeleton) {
        setLoading(false);
      }
    }
  }

  // Escuchar suscripciones en tiempo real para el equipo
  const { toast, dismissToast } = useRealtimeTeam({
    onDataRefresh: () => loadData(false),
    enabled: !!user,
  });

  async function handleUpdateLead(leadId, newStatus) {
    try {
      await updateLeadStatus(leadId, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
      showTemporaryMsg('Estado del lead actualizado y registrado en auditoría.');
      fetchTeamActivityLogs({ limit: 50 })
        .then(setActivityLogs)
        .catch(() => {});
    } catch (err) {
      alert(`Error al actualizar lead: ${err.message}`);
    }
  }

  async function handleUpdateProjectStatus(projectId, newStatus) {
    try {
      const proj = projects.find((p) => p.id === projectId);
      await updateProjectStatus(projectId, newStatus, {
        clientEmail: proj?.client?.email,
        clientName: proj?.client?.full_name,
      });
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)));
      showTemporaryMsg(`Estado del proyecto actualizado a "${newStatus}" y notificación despachada al cliente.`);
      fetchTeamActivityLogs({ limit: 50 })
        .then(setActivityLogs)
        .catch(() => {});
    } catch (err) {
      alert(`Error al actualizar estado del proyecto: ${err.message}`);
    }
  }

  function handleConvertLeadToProject(lead) {
    const matchedClient = clients.find((c) => c.email && c.email.toLowerCase() === lead.email?.toLowerCase());

    setNewProj({
      clientId: matchedClient ? matchedClient.id : clients[0]?.id || '',
      title: `${PILLAR_LABELS[lead.pillar] || 'Proyecto'} — ${lead.company || lead.full_name || 'Cliente'}`,
      pillar: ['auditoria', 'desarrollo', 'datos', 'integral'].includes(lead.pillar) ? lead.pillar : 'auditoria',
      description: `Requerimiento TDR: ${lead.message || 'Sin descripción'}\n\nContacto: ${lead.full_name || 'N/A'} (${lead.email || 'N/A'}${lead.phone ? `, Tel: ${lead.phone}` : ''})\nPlazo estimado: ${lead.timeline || 'A coordinar'}`,
      targetCompletionDate: '',
      techLeadName: user?.fullName || 'Inmerge Tech Lead',
      techLeadContact: user?.email || 'inmerge3@gmail.com',
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
        techLeadContact: user?.email || 'inmerge3@gmail.com',
      });
      await loadData();
      setActiveTab('projects');
    } catch (err) {
      alert(`Error al crear proyecto: ${err.message}`);
    }
  }

  async function handleAddMilestone(e, overridePayload = null) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const payload = overridePayload || newMilestone;

    if (!payload.projectId || !payload.title) {
      alert('Selecciona un proyecto e ingresa el título del hito.');
      return;
    }

    try {
      await addProjectMilestone({
        projectId: payload.projectId,
        title: payload.title,
        description: payload.description || '',
        dueDate: payload.dueDate || null,
        orderIndex: parseInt(payload.orderIndex, 10) || 1,
      });
      showTemporaryMsg('Hito agregado correctamente.');
      setNewMilestone({ projectId: '', title: '', description: '', dueDate: '', orderIndex: 1, phasePreset: '01' });
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

  async function handleTaskCreated(taskPayload) {
    try {
      await createProjectTask(taskPayload);
      showTemporaryMsg('Tarea técnica registrada con éxito.');
      await loadData(false);
    } catch (err) {
      alert(`Error al registrar tarea: ${err.message}`);
    }
  }

  async function handleTaskUpdated(taskId, updates) {
    try {
      await updateProjectTask(taskId, updates);
      showTemporaryMsg('Tarea técnica actualizada.');
      await loadData(false);
    } catch (err) {
      alert(`Error al actualizar tarea: ${err.message}`);
    }
  }

  async function handleTaskDeleted(taskId, projectId) {
    try {
      await deleteProjectTask(taskId, projectId);
      showTemporaryMsg('Tarea técnica eliminada.');
      await loadData(false);
    } catch (err) {
      alert(`Error al eliminar tarea: ${err.message}`);
    }
  }

  async function handleRiskCreated(riskPayload) {
    try {
      await createProjectRisk(riskPayload);
      showTemporaryMsg('Bloqueo o riesgo técnico registrado.');
      await loadData(false);
    } catch (err) {
      alert(`Error al registrar riesgo: ${err.message}`);
    }
  }

  async function handleRiskUpdated(riskId, updates) {
    try {
      await updateProjectRisk(riskId, updates);
      showTemporaryMsg('Estado de riesgo/bloqueo actualizado.');
      await loadData(false);
    } catch (err) {
      alert(`Error al actualizar riesgo: ${err.message}`);
    }
  }

  async function handleProjectHealthChange(projectId, newHealth) {
    try {
      await updateProjectHealth(projectId, { healthStatus: newHealth });
      showTemporaryMsg(`Salud del proyecto actualizada a: ${newHealth}`);
      await loadData(false);
    } catch (err) {
      alert(`Error al actualizar salud del proyecto: ${err.message}`);
    }
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 12,
          }}
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
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: '#2E7559',
                  background: 'rgba(46, 117, 89, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid rgba(46, 117, 89, 0.25)',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7559' }}></span>
                REALTIME ACTIVO
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

        {error && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 8,
              background: 'rgba(168, 71, 43, 0.15)',
              border: '1px solid var(--terracotta)',
              color: 'var(--terracotta)',
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}

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
            {activeTab === 'leads' && (
              <LeadsInboxTable
                leads={leads}
                clients={clients}
                user={user}
                onUpdateLeadStatus={handleUpdateLead}
                onConvertLeadToProject={handleConvertLeadToProject}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsManagementView
                projects={projects}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onProjectHealthChange={handleProjectHealthChange}
                onUpdateMilestone={handleUpdateMilestone}
                onAddMilestone={handleAddMilestone}
                onTaskCreated={handleTaskCreated}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                onRiskCreated={handleRiskCreated}
                onRiskUpdated={handleRiskUpdated}
              />
            )}

            {activeTab === 'new_project' && (
              <NewProjectModal
                clients={clients}
                projects={projects}
                newProj={newProj}
                setNewProj={setNewProj}
                handleCreateProject={handleCreateProject}
                newMilestone={newMilestone}
                setNewMilestone={setNewMilestone}
                handleAddMilestone={handleAddMilestone}
                newDeliv={newDeliv}
                setNewDeliv={setNewDeliv}
                delivFile={delivFile}
                setDelivFile={setDelivFile}
                handleUploadDeliverable={handleUploadDeliverable}
                uploading={uploading}
              />
            )}

            {activeTab === 'activity' && (
              <TeamActivityFeed
                filteredActivityLogs={filteredActivityLogs}
                activityFilter={activityFilter}
                setActivityFilter={setActivityFilter}
              />
            )}

            {activeTab === 'team' && user?.role === 'admin' && (
              <StaffManagementView
                staffList={staffList}
                newStaff={newStaff}
                setNewStaff={setNewStaff}
                handleCreateStaff={handleCreateStaff}
                staffSubmitting={staffSubmitting}
              />
            )}
          </>
        )}
      </div>

      <ToastNotification toast={toast} onDismiss={dismissToast} />
      <Footer />
    </>
  );
}
