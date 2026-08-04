import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { PLAN_COPY, periodLabel } from '../data/content.js';

// Espejo de useReports.js para la tabla `plans`. La BD manda el precio y la
// duración; content.js solo aporta copy. `plans` tiene SELECT público, así que
// esto funciona sin sesión.
export default function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabase
      .from('plans')
      .select('id, name, price_pen, period_months')
      .order('period_months')
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) setError(fetchError.message);
        else
          setPlans(
            (data || []).map((p) => ({
              ...p,
              ...PLAN_COPY[p.id],
              period: periodLabel(p.period_months),
            })),
          );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { plans, loading, error };
}
