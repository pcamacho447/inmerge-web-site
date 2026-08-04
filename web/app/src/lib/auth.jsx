import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient.js';
import { DEMO_MODE } from './demoMode.js';
import { fetchOrders } from './orders.js';

// Identidad, derechos y pedidos REALES. El pago es por depósito bancario con
// verificación humana: el cliente crea un pedido (tabla `orders`, ver
// lib/orders.js) y el dueño lo aprueba con approve_order() desde el SQL Editor,
// que es lo único que escribe `subscriptions`/`purchases`. Nunca escribas esas
// tablas desde acá.
//
// Con DEMO_MODE=true revive el checkout simulado que escribe en localStorage,
// para mostrar el flujo sin que nadie deposite. Con la bandera apagada —el
// default— el mock está COMPLETAMENTE fuera: sin unión mock∪real, que es lo que
// antes hacía imposible saber qué acceso era de verdad.

const AuthContext = createContext(null);

function mockStateKey(userId) {
  return `inmerge_mock_entitlements_${userId}`;
}

function loadMockState(userId) {
  try {
    const raw = localStorage.getItem(mockStateKey(userId));
    return raw ? JSON.parse(raw) : { subscription: null, purchases: [] };
  } catch {
    return { subscription: null, purchases: [] };
  }
}

function saveMockState(userId, state) {
  localStorage.setItem(mockStateKey(userId), JSON.stringify(state));
}

// Crea profile/organization desde la metadata de registro la primera vez que
// hay sesión. Devuelve false si la sesión resultó ser basura (ver el 42501).
async function ensureProfile(sessionUser) {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', sessionUser.id).maybeSingle();
  if (existing) return true;

  const meta = sessionUser.user_metadata || {};
  if (!meta.full_name) return true; // nada que crear — sin metadata de registro

  // El id se genera acá, no con .select() tras el insert: organizations_select_own
  // (0001_init.sql) solo deja ver una organización a través de un `profiles` que
  // ya apunte a ella, y ese `profiles` es justo el que estamos por crear. Pedir
  // RETURNING obligaría a pasar esa policy de SELECT sobre la fila recién
  // insertada, que nunca puede cumplirse todavía — huevo y gallina, siempre 42501.
  const orgId = crypto.randomUUID();
  const { error: orgError } = await supabase.from('organizations').insert({
    id: orgId,
    billing_type: meta.billing_type || 'persona_natural',
    legal_name: meta.full_name,
    tax_id: meta.tax_id || null,
    billing_email: sessionUser.email,
  });

  if (orgError) {
    // 42501 = RLS rechazó el insert. Con el id generado acá esto ya no debería
    // pasar para un alta legítima — si pasa, la sesión es basura (usuario
    // borrado, o proyecto reconstruido). Eso no es un fallo transitorio —
    // reintentarlo en cada getSession y cada cambio de visibilidad solo
    // inunda la consola.
    if (orgError.code === '42501') {
      await supabase.auth.signOut();
      return false;
    }
    console.error('Failed to create organization on first login:', orgError);
    return true;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: sessionUser.id, organization_id: orgId, full_name: meta.full_name });
  if (profileError) console.error('Failed to create profile on first login:', profileError);
  return true;
}

// Lecturas reales vía RLS (*_select_own en 0001_init.sql). Los writes son
// exclusivos de approve_order(). current_period_end es obligatorio acá: es lo
// que distingue una suscripción vigente de una vencida, y has_access() lo
// exige del lado del servidor.
async function fetchRealEntitlements(userId) {
  const [{ data: subs }, { data: purchases }] = await Promise.all([
    supabase.from('subscriptions').select('plan, status, current_period_end').eq('user_id', userId).limit(1),
    supabase.from('purchases').select('report_id').eq('user_id', userId).eq('status', 'paid'),
  ]);
  const sub = subs?.[0];
  return {
    subscription: sub ? { plan: sub.plan, status: sub.status, currentPeriodEnd: sub.current_period_end } : null,
    purchases: (purchases || []).map((p) => p.report_id),
  };
}

async function fetchProfileFields(userId) {
  const { data: profile } = await supabase.from('profiles').select('full_name, organization_id').eq('id', userId).maybeSingle();
  if (!profile) return { fullName: '', billingType: null, taxId: null };

  let billingType = null;
  let taxId = null;
  if (profile.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('billing_type, tax_id')
      .eq('id', profile.organization_id)
      .maybeSingle();
    billingType = org?.billing_type ?? null;
    taxId = org?.tax_id ?? null;
  }
  return { fullName: profile.full_name || '', billingType, taxId };
}

async function buildUser(sessionUser) {
  const sessionValid = await ensureProfile(sessionUser);
  if (!sessionValid) return null; // sesión zombi: ya cerramos sesión

  const profileFields = await fetchProfileFields(sessionUser.id);
  const real = await fetchRealEntitlements(sessionUser.id);
  const orders = await fetchOrders(sessionUser.id).catch(() => []);

  // Con la bandera apagada el mock no participa: una sola fuente de verdad.
  const mockState = DEMO_MODE ? loadMockState(sessionUser.id) : { subscription: null, purchases: [] };
  const subscription = real.subscription ?? mockState.subscription;
  const purchases = Array.from(new Set([...(mockState.purchases || []), ...real.purchases]));

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    ...profileFields,
    subscription,
    purchases,
    orders,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setUser(session?.user ? await buildUser(session.user) : null);
      setLoading(false);
    });

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setUser(session?.user ? await buildUser(session.user) : null);
    });

    return () => {
      active = false;
      authListener.unsubscribe();
    };
  }, []);

  // Returns { confirmEmailRequired: boolean } on success; throws on real errors.
  const signup = useCallback(async ({ fullName, email, password, billingType, taxId }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, billing_type: billingType, tax_id: taxId || null } },
    });
    if (error) throw error;
    if (!data.session) {
      // Email confirmation is on for this project — no session yet, so
      // profile/org creation happens later (ensureProfile, on first login).
      return { confirmEmailRequired: true };
    }
    setUser(await buildUser(data.session.user));
    return { confirmEmailRequired: false };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(await buildUser(data.user));
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // Estas tres son SOLO del modo demo. Si alguien las cablea en producción,
  // revienta en desarrollo en vez de conceder acceso falso en silencio.
  function assertDemo(name) {
    if (!DEMO_MODE) {
      throw new Error(`${name}() es solo del modo demo. En producción el acceso lo crea approve_order() tras verificar el depósito.`);
    }
  }

  const subscribe = useCallback((plan) => {
    assertDemo('subscribe');
    setUser((u) => {
      if (!u) return u;
      const subscription = { plan, status: 'active', currentPeriodEnd: null };
      saveMockState(u.id, { subscription, purchases: u.purchases });
      return { ...u, subscription };
    });
  }, []);

  const cancelSubscription = useCallback(() => {
    assertDemo('cancelSubscription');
    setUser((u) => {
      if (!u) return u;
      const subscription = { ...u.subscription, status: 'canceled' };
      saveMockState(u.id, { subscription, purchases: u.purchases });
      return { ...u, subscription };
    });
  }, []);

  const purchaseReport = useCallback((reportId) => {
    assertDemo('purchaseReport');
    setUser((u) => {
      if (!u || u.purchases.includes(reportId)) return u;
      const purchases = [...u.purchases, reportId];
      saveMockState(u.id, { subscription: u.subscription, purchases });
      return { ...u, purchases };
    });
  }, []);

  // Tras crear un pedido, /cuenta tiene que poder mostrarlo sin recargar.
  const refreshUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ? await buildUser(session.user) : null);
  }, []);

  const value = { user, loading, signup, login, logout, subscribe, cancelSubscription, purchaseReport, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Espeja has_access() en supabase/migrations/0004_approve_orders.sql —
// mantenlos sincronizados. Este es el gate de UI; el gate real es la Edge
// Function, que reconsulta has_access() del lado del servidor.
export function isSubscriptionActive(subscription) {
  if (!subscription || subscription.status !== 'active') return false;
  // Sin periodo solo puede ser una suscripción del modo demo, que nunca toca la
  // BD y por lo tanto no puede desbloquear una descarga real.
  if (!subscription.currentPeriodEnd) return DEMO_MODE;
  return new Date(subscription.currentPeriodEnd).getTime() > Date.now();
}

export function hasAccess(user, report) {
  if (report.tier === 'free') return true;
  if (!user) return false;
  if (user.purchases?.includes(report.id)) return true;
  return isSubscriptionActive(user.subscription);
}
