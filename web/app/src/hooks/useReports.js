import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

// Single source of truth for the report catalog — Supabase's `reports`
// table, not the old hardcoded array in content.js (which drifted from the
// DB by definition, since it was two copies of the same data). `reports`
// has a public SELECT policy, so this works logged-out too.
export default function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabase
      .from('reports')
      .select('id, slug, tag, title, summary, tier, price_pen, cover_image_path, published_at')
      // Se seleccionaba published_at pero nunca se filtraba, así que un
      // borrador aparecía en el catálogo público apenas se insertaba.
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('created_at')
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) setError(fetchError.message);
        else setReports(data || []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { reports, loading, error };
}
