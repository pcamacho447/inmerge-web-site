import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

// Trae un reporte por slug. La RLS (0011) solo devuelve publicados, así que un
// slug despublicado o inexistente se ven igual desde acá: `notFound`. Es lo
// correcto — un 404 no debe revelar que existe un borrador con ese nombre.
export default function useReport(slug) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    setError('');

    supabase
      .from('reports')
      .select('id, slug, title, summary, key_figure, key_figure_label, sources')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!alive) return;
        if (err) setError('No se pudo cargar el reporte.');
        else if (!data) setNotFound(true);
        else setReport(data);
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  return { report, loading, notFound, error };
}
