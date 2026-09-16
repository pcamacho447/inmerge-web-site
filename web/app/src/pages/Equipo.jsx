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
  updateProjectStaff,
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
    assignedToId: '',
    assignedToName: '',
    assignedToEmail: '',
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

      const staffData = await fetchStaffMembers().catch(() => []);
      setStaffList(staffData);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showSkeleton) {
        setLoading(false);
      }
    }
  }

  // Escuchar suscripciones en tiempo real para el equipo
  const { toast: realtimeToast, dismissToast: dismissRealtimeToast } = useRealtimeTeam({
    onDataRefresh: () => loadData(false),
    enabled: !!user,
  });

  const [localToast, setLocalToast] = useState(null);
  const activeToast = localToast || realtimeToast;

  const showToast = (toastObj) => {
    setLocalToast(toastObj);
  };

  const dismissToast = () => {
    setLocalToast(null);
    dismissRealtimeToast?.();
  };

  async function handleUpdateLead(leadId, updates) {
    if (!user?.isAdmin) {
      showToast({
        type: 'error',
        title: 'Permiso Denegado',
        message: 'Solo los Administradores pueden modificar leads TDR o designar consultores.',
      });
      return;
    }
    try {
      const payload = typeof updates === 'string' ? { status: updates } : updates;
      await updateLeadStatus(leadId, payload);
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== leadId) return l;
          const updated = { ...l, ...payload };
          if (payload.assignedTo !== undefined) {
            updated.assigned_to = payload.assignedTo;
            const staffMember = staffList.find((s) => s.id === payload.assignedTo);
            updated.assigned_profile = staffMember ? { full_name: staffMember.full_name, email: staffMember.email } : null;
          }
          return updated;
        }),
      );
      showTemporaryMsg('Lead actualizado y registrado en la bitácora de auditoría.');
      fetchTeamActivityLogs({ limit: 50 })
        .then(setActivityLogs)
        .catch(() => {});
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al actualizar lead',
        message: err.message,
      });
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
      showToast({
        type: 'error',
        title: 'Error al actualizar estado del proyecto',
        message: err.message,
      });
    }
  }

  function handleConvertLeadToProject(lead) {
    if (!user?.isAdmin) {
      showToast({
        type: 'error',
        title: 'Permiso Denegado',
        message: 'Solo los Administradores tienen permisos para convertir leads y dar de alta proyectos.',
      });
      return;
    }

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

  async function handleUpdateProjectStaff(projectId, staffUpdates) {
    if (!user?.isAdmin) {
      showToast({
        type: 'error',
        title: 'Permiso Denegado',
        message: 'Solo administradores pueden modificar el equipo asignado del proyecto.',
      });
      return;
    }
    try {
      await updateProjectStaff(projectId, staffUpdates);
      showTemporaryMsg('Equipo del proyecto actualizado con éxito.');
      await loadData(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al actualizar equipo del proyecto',
        message: err.message,
      });
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProj.clientId || !newProj.title) {
      showToast({
        type: 'error',
        title: 'Datos Incompletos',
        message: 'Por favor selecciona un cliente registrado e ingresa el título del proyecto.',
      });
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
      showToast({
        type: 'error',
        title: 'Error al crear proyecto',
        message: err.message,
      });
    }
  }

  async function handleAddMilestone(e, overridePayload = null) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const payload = overridePayload || newMilestone;

    if (!payload.projectId || !payload.title) {
      showToast({
        type: 'error',
        title: 'Datos Incompletos',
        message: 'Selecciona un proyecto e ingresa el título del hito.',
      });
      return;
    }

    try {
      await addProjectMilestone({
        projectId: payload.projectId,
        title: payload.title,
        description: payload.description || '',
        dueDate: payload.dueDate || null,
        orderIndex: parseInt(payload.orderIndex, 10) || 1,
        assignedToName: payload.assignedToName || null,
        assignedToEmail: payload.assignedToEmail || null,
        assignedToId: payload.assignedToId || null,
      });
      showTemporaryMsg('Hito agregado correctamente.');
      setNewMilestone({
        projectId: '',
        title: '',
        description: '',
        dueDate: '',
        orderIndex: 1,
        phasePreset: '01',
        assignedToId: '',
        assignedToName: '',
        assignedToEmail: '',
      });
      await loadData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al agregar hito',
        message: err.message,
      });
    }
  }

  async function handleUpdateMilestone(milestoneId, statusOrUpdates) {
    try {
      await updateMilestoneStatus(milestoneId, statusOrUpdates);
      showTemporaryMsg('Hito actualizado correctamente.');
      await loadData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al actualizar hito',
        message: err.message,
      });
    }
  }

  async function handleUploadDeliverable(e, customPayload = null, customFile = null) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const payload = customPayload || newDeliv;
    const file = customFile || delivFile;

    if (!payload.projectId || !payload.title) {
      showToast({
        type: 'error',
        title: 'Datos Incompletos',
        message: 'Selecciona el proyecto e ingresa el nombre del entregable.',
      });
      return false;
    }

    setUploading(true);
    try {
      let filePath = null;
      if (file) {
        const safeName = `${payload.projectId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        filePath = await uploadDeliverableFile(file, safeName);
      }

      const targetProject = projects.find((p) => p.id === payload.projectId);

      await createDeliverableRecord({
        projectId: payload.projectId,
        milestoneId: payload.milestoneId || null,
        title: payload.title,
        fileType: payload.fileType,
        filePath,
        externalUrl: payload.externalUrl || null,
        version: payload.version || 'v1.0',
        notes: payload.notes || '',
        project: targetProject,
        clientEmail: targetProject?.client?.email,
        clientName: targetProject?.client?.full_name,
      });

      showTemporaryMsg('Entregable publicado, notificado al cliente y registrado en auditoría.');
      if (!customPayload) {
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
      }
      await loadData(false);
      return true;
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al publicar entregable',
        message: err.message,
      });
      return false;
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateStaff(e) {
    e.preventDefault();
    if (!newStaff.fullName || !newStaff.email || !newStaff.password) {
      showToast({
        type: 'error',
        title: 'Campos Requeridos',
        message: 'Por favor completa todos los campos del formulario de colaborador.',
      });
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
      showToast({
        type: 'error',
        title: 'Error al registrar colaborador',
        message: err.message,
      });
    } finally {
      setStaffSubmitting(false);
    }
  }

  function showTemporaryMsg(msg) {
    setStatusMsg(msg);
    showToast({
      type: 'success',
      title: 'Acción Confirmada',
      message: msg,
    });
    setTimeout(() => setStatusMsg(null), 4000);
  }

  async function handleTaskCreated(taskPayload) {
    try {
      await createProjectTask(taskPayload);
      showTemporaryMsg('Tarea técnica registrada con éxito.');
      await loadData(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al registrar tarea',
        message: err.message,
      });
    }
  }

  async function handleTaskUpdated(taskId, updates) {
    try {
      await updateProjectTask(taskId, updates);
      showTemporaryMsg('Tarea técnica actualizada.');
      await loadData(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al actualizar tarea',
        message: err.message,
      });
    }
  }

  async function handleTaskDeleted(taskId, projectId) {
    try {
      await deleteProjectTask(taskId, projectId);
      showTemporaryMsg('Tarea técnica eliminada.');
      await loadData(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al eliminar tarea',
        message: err.message,
      });
    }
  }

  async function handleRiskCreated(riskPayload) {
    try {
      await createProjectRisk(riskPayload);
      showTemporaryMsg('Bloqueo o riesgo técnico registrado.');
      await loadData(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al registrar riesgo',
        message: err.message,
      });
    }
  }

  async function handleRiskUpdated(riskId, updates) {
    try {
      await updateProjectRisk(riskId, updates);
      showTemporaryMsg('Estado de riesgo/bloqueo actualizado.');
      await loadData(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al actualizar riesgo',
        message: err.message,
      });
    }
  }

  async function handleProjectHealthChange(projectId, newHealth) {
    try {
      await updateProjectHealth(projectId, { healthStatus: newHealth });
      showTemporaryMsg(`Salud del proyecto actualizada a: ${newHealth}`);
      await loadData(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al actualizar salud del proyecto',
        message: err.message,
      });
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

  const tabs = [
    { id: 'leads', label: 'Bandeja de Leads & TDR', count: leads.length },
    { id: 'projects', label: 'Proyectos & Auditorías', count: projects.length },
    ...(user?.isAdmin ? [{ id: 'new_project', label: '+ Crear Proyecto / Entregable' }] : []),
    { id: 'activity', label: 'Bitácora & Auditoría', count: activityLogs.length },
    ...(user?.isAdmin ? [{ id: 'team', label: 'Gestión de Colaboradores', count: staffList.length }] : []),
  ];

  const handleTabKeyDown = (e, currentTabId) => {
    const tabIds = tabs.map((t) => t.id);
    const currentIndex = tabIds.indexOf(currentTabId);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabIds.length - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      const nextTabId = tabIds[nextIndex];
      setActiveTab(nextTabId);
      document.getElementById(`tab-${nextTabId}`)?.focus();
    }
  };

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
            {user?.isAdmin && (
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
                Vista de Cliente (Admin) →
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

        {/* Navigation Tabs - Accessible WCAG Tablist */}
        <div
          role="tablist"
          aria-label="Secciones del panel de consultores"
          style={{
            display: 'flex',
            gap: 12,
            borderBottom: '1px solid var(--border)',
            marginBottom: 36,
            overflowX: 'auto',
          }}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isSelected ? '3px solid var(--terracotta)' : '3px solid transparent',
                  padding: '12px 20px',
                  fontSize: 15,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--terracotta)' : 'var(--muted)',
                  cursor: 'pointer',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 10,
                      background: isSelected ? 'var(--terracotta)' : 'var(--border)',
                      color: isSelected ? '#fff' : 'var(--ink)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Tabs */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <p>Cargando información del equipo técnico...</p>
          </div>
        ) : (
          <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0} style={{ outline: 'none' }}>
            {activeTab === 'leads' && (
              <LeadsInboxTable
                leads={leads}
                clients={clients}
                staffList={staffList}
                user={user}
                isAdmin={Boolean(user?.isAdmin)}
                onUpdateLeadStatus={handleUpdateLead}
                onConvertLeadToProject={handleConvertLeadToProject}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsManagementView
                projects={projects}
                staffList={staffList}
                isAdmin={Boolean(user?.isAdmin)}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onProjectHealthChange={handleProjectHealthChange}
                onUpdateMilestone={handleUpdateMilestone}
                onAddMilestone={handleAddMilestone}
                onUpdateProjectStaff={handleUpdateProjectStaff}
                onTaskCreated={handleTaskCreated}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                onRiskCreated={handleRiskCreated}
                onRiskUpdated={handleRiskUpdated}
                onUploadDeliverable={handleUploadDeliverable}
                onOpenNewProject={() => setActiveTab('new_project')}
                showToast={showToast}
              />
            )}

            {activeTab === 'new_project' && user?.isAdmin && (
              <NewProjectModal
                clients={clients}
                projects={projects}
                staffList={staffList}
                isAdmin={Boolean(user?.isAdmin)}
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

            {activeTab === 'team' && user?.isAdmin && (
              <StaffManagementView
                staffList={staffList}
                newStaff={newStaff}
                setNewStaff={setNewStaff}
                handleCreateStaff={handleCreateStaff}
                staffSubmitting={staffSubmitting}
              />
            )}
          </div>
        )}
      </div>

      <ToastNotification toast={activeToast} onDismiss={dismissToast} />
      <Footer />
    </>
  );
}
