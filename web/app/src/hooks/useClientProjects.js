import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth.jsx';
import { fetchClientProjects } from '../lib/projects.js';

export default function useClientProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    if (!user?.id) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientProjects(user.id);
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    refreshProjects: loadProjects,
  };
}
