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
  const {
    toast: realtimeToast,
    dismissToast: dismissRealtimeToast,
    connectionStatus: realtimeConnectionStatus,
    isOnline: realtimeIsOnline,
  } = useRealtimeTeam({
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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

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
    { id: 'leads', label: 'Bandeja de Leads & TDR', icon: '📥', count: leads.length },
    { id: 'projects', label: 'Proyectos & Auditorías', icon: '⚡', count: projects.length },
    ...(user?.isAdmin ? [{ id: 'new_project', label: 'Crear Proyecto / Entregables', icon: '➕' }] : []),
    { id: 'activity', label: 'Bitácora & Auditoría', icon: '📜', count: activityLogs.length },
    ...(user?.isAdmin ? [{ id: 'team', label: 'Gestión de Colaboradores', icon: '👥', count: staffList.length }] : []),
  ];

  const handleTabKeyDown = (e, currentTabId) => {
    const tabIds = tabs.map((t) => t.id);
    const currentIndex = tabIds.indexOf(currentTabId);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
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

  const activeTabMeta = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="equipo-layout-root">
      {/* Sticky Editorial Top Bar */}
      <header className="equipo-topbar">
        <div className="equipo-topbar-left">
          <button
            type="button"
            className="equipo-sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {isSidebarCollapsed ? '☰' : '✕'}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: 'var(--terracotta)',
                letterSpacing: 2,
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
                  fontSize: 9,
                  padding: '1px 6px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                {user?.role || 'STAFF'}
              </span>
              <span
                role="status"
                aria-live="polite"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 9,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 600,
                  color: '#2E7559',
                  background: 'rgba(46, 117, 89, 0.1)',
                  padding: '1px 6px',
                  borderRadius: 10,
                  border: '1px solid rgba(46, 117, 89, 0.25)',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#2E7559',
                  }}
                />
                REALTIME ACTIVO
              </span>
            </div>
            <h1 className="equipo-brand-title">Gestión Operativa de Auditorías & Proyectos</h1>
          </div>
        </div>

        {/* Center / KPI Metric Strip */}
        <div className="equipo-kpi-strip">
          <div className="equipo-kpi-pill" title="Total de solicitudes y TDRs recibidos">
            <span>📥 Leads TDR:</span>
            <span className="equipo-kpi-val">{leads.length}</span>
          </div>
          <div className="equipo-kpi-pill" title="Proyectos y auditorías en ejecución">
            <span>⚡ Proyectos:</span>
            <span className="equipo-kpi-val">{projects.length}</span>
          </div>
          <div className="equipo-kpi-pill" title="Colaboradores e ingenieros asignados">
            <span>👥 Staff:</span>
            <span className="equipo-kpi-val">{staffList.length}</span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="equipo-topbar-actions">
          {user?.isAdmin && (
            <button
              type="button"
              className="btn-drawer-trigger"
              onClick={() => setIsDrawerOpen(true)}
              title="Abrir ventana de opciones y creación rápida"
            >
              <span>+ Opciones & Creación</span>
            </button>
          )}

          {user?.isAdmin && (
            <Link
              to="/cuenta"
              style={{
                fontSize: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                color: 'var(--ink)',
                textDecoration: 'none',
                borderBottom: '1px dotted var(--terracotta)',
                padding: '4px 6px',
              }}
            >
              Vista Cliente →
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
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main App Canvas Container */}
      <div className="equipo-body-container">
        {/* Collapsible Sidebar Navigation */}
        <aside className={`equipo-sidebar ${isSidebarCollapsed ? 'is-collapsed' : ''}`} aria-label="Navegación lateral de operaciones">
          <div className="equipo-sidebar-nav" role="tablist" aria-label="Secciones del panel de consultores">
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
                  className={`equipo-nav-item ${isSelected ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                  title={tab.label}
                >
                  <span className="equipo-nav-icon">{tab.icon}</span>
                  {!isSidebarCollapsed && <span className="equipo-nav-label">{tab.label}</span>}
                  {!isSidebarCollapsed && tab.count !== undefined && (
                    <span className="equipo-nav-badge">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="equipo-sidebar-footer">
            {!isSidebarCollapsed ? (
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
                <div>Consultor:</div>
                <strong style={{ color: 'var(--ink)', wordBreak: 'break-all' }}>{user?.email}</strong>
                <div style={{ marginTop: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--terracotta)' }}>
                  {user?.fullName || 'Inmerge Staff'}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', fontSize: 14 }} title={`${user?.email} (${user?.role})`}>
                👤
              </div>
            )}
          </div>
        </aside>

        {/* Fluid Workspace Canvas */}
        <main className="equipo-workspace">
          {/* Workspace Subheader */}
          <div className="equipo-workspace-header">
            <div>
              <h2 className="equipo-workspace-title">{activeTabMeta.label}</h2>
              <p className="equipo-workspace-subtitle">
                {activeTab === 'leads' && 'Gestión y triaje de solicitudes TDR enviadas por clientes y empresas.'}
                {activeTab === 'projects' && 'Supervisión integral de proyectos, hitos Gantt, entregables y matriz de riesgos.'}
                {activeTab === 'new_project' && 'Centro de operaciones para creación de proyectos, hitos técnicos y subida de entregables.'}
                {activeTab === 'activity' && 'Registro cronológico forense y eventos de auditoría en tiempo real.'}
                {activeTab === 'team' && 'Directorio técnico y gestión de roles para ingenieros y auditores.'}
              </p>
            </div>

            {user?.isAdmin && activeTab !== 'new_project' && (
              <button
                type="button"
                className="btn-drawer-trigger"
                onClick={() => setIsDrawerOpen(true)}
                style={{ fontSize: 13, padding: '6px 12px' }}
              >
                <span>⚡ Opciones Rápidas</span>
              </button>
            )}
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

          {/* Dynamic Content Views */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Cargando consola del equipo técnico...</p>
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
                  onOpenNewProject={() => {
                    setIsDrawerOpen(true);
                  }}
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
        </main>
      </div>

      {/* Slide-Over Drawer de Opciones & Creación */}
      <div
        className={`equipo-drawer-overlay ${isDrawerOpen ? 'is-open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden={!isDrawerOpen}
      />
      <div
        className={`equipo-drawer-panel ${isDrawerOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-hidden={!isDrawerOpen}
      >
        <div className="equipo-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            <h3 id="drawer-title" className="equipo-drawer-title">
              Centro de Opciones & Creación
            </h3>
          </div>
          <button
            type="button"
            className="equipo-drawer-close"
            onClick={() => setIsDrawerOpen(false)}
            title="Cerrar ventana de opciones (Esc)"
            aria-label="Cerrar ventana de opciones"
          >
            ✕ Cerrar
          </button>
        </div>

        <div className="equipo-drawer-body">
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px' }}>
            Acceso rápido para registrar proyectos, añadir hitos a la metodología Inmerge y subir entregables forenses sin perder tu vista de trabajo.
          </p>

          <NewProjectModal
            clients={clients}
            projects={projects}
            staffList={staffList}
            isAdmin={Boolean(user?.isAdmin)}
            newProj={newProj}
            setNewProj={setNewProj}
            handleCreateProject={async (e) => {
              await handleCreateProject(e);
              setIsDrawerOpen(false);
            }}
            newMilestone={newMilestone}
            setNewMilestone={setNewMilestone}
            handleAddMilestone={async (e, override) => {
              await handleAddMilestone(e, override);
              setIsDrawerOpen(false);
            }}
            newDeliv={newDeliv}
            setNewDeliv={setNewDeliv}
            delivFile={delivFile}
            setDelivFile={setDelivFile}
            handleUploadDeliverable={async (e) => {
              await handleUploadDeliverable(e);
              setIsDrawerOpen(false);
            }}
            uploading={uploading}
          />
        </div>
      </div>

      <ToastNotification toast={activeToast} onDismiss={dismissToast} />
      <Footer />
    </div>
  );
}

