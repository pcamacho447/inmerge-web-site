import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth.jsx';
import { fetchClientProjects } from '../lib/projects.js';
import { supabase } from '../lib/supabaseClient.js';

export default function useClientProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const loadProjects = useCallback(async (isInitial = true) => {
    if (!user?.id) {
      setProjects([]);
      setLoading(false);
      return;
    }

    if (isInitial) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchClientProjects(user.id);
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los proyectos.');
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    loadProjects(true);
  }, [loadProjects]);

  // Suscripción reactiva en tiempo real a cambios en proyectos, hitos y entregables
  useEffect(() => {
    if (!user?.id || !supabase?.channel) return;

    const channelName = `realtime-client-portal-${user.id}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_projects',
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setToast({
              type: 'project',
              title: 'Nuevo Proyecto Registrado',
              message: `Se ha creado el proyecto "${payload.new.title}".`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setToast({
              type: 'project',
              title: 'Proyecto Actualizado',
              message: `El proyecto "${payload.new.title}" ahora está en estado "${payload.new.status}".`,
            });
          }
          loadProjects(false);
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_milestones',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setToast({
              type: 'milestone',
              title: 'Hito de Proyecto Actualizado',
              message: `El hito "${payload.new.title}" cambió a estado "${payload.new.status}".`,
            });
          }
          loadProjects(false);
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_deliverables',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setToast({
              type: 'deliverable',
              title: 'Nuevo Entregable Disponible',
              message: `Se ha publicado el entregable "${payload.new.title}".`,
            });
          }
          loadProjects(false);
        },
      )
      .subscribe();

    return () => {
      if (supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, loadProjects]);

  return {
    projects,
    loading,
    error,
    toast,
    dismissToast: () => setToast(null),
    refreshProjects: () => loadProjects(false),
  };
}
