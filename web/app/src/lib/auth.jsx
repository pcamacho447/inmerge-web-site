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

// La creación de profile/organization vive en la BD (ensure_profile(),
// migración 0006 + 0008): es security definer, atómica e idempotente, así
// que dos llamadas concurrentes no pueden duplicar la organización. Devuelve
// false si la sesión es basura (usuario borrado o proyecto reconstruido), y en
// ese caso cerramos sesión en vez de reintentar en cada getSession.
async function ensureProfile() {
  const { error } = await supabase.rpc('ensure_profile');
  if (!error) return true;

  // P0002 = no_data_found: ensure_profile() (migración 0008) hace
  // `select ... into strict ... from auth.users where id = v_uid` y Postgres
  // levanta ese código solo cuando no hay fila. auth.uid() lee el `sub` del
  // JWT directamente, sin consultar ninguna tabla, así que un usuario borrado
  // (o un proyecto reconstruido) sigue teniendo un JWT sin expirar — nunca
  // vemos un error de permisos acá, solo la ausencia de la fila. Esa es la
  // sesión zombi real.
  if (error.code === 'P0002') {
    await supabase.auth.signOut();
    return false;
  }
  console.error('ensure_profile failed:', error);
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
  const sessionValid = await ensureProfile();
  if (!sessionValid) return null; // sesión zombi: ya cerramos sesión

  const [profileFields, real] = await Promise.all([fetchProfileFields(sessionUser.id), fetchRealEntitlements(sessionUser.id)]);

  // Antes esto era `.catch(() => [])`, y una falla de carga se veía IDÉNTICA a
  // "no tienes pedidos" — justo en la página que existe para tranquilizar a
  // alguien que acaba de depositar. Ahora se distingue.
  //
  // expire_own_stale_orders() corre ACÁ, antes de fetchOrders, no solo dentro
  // de createOrder: sin esto, un pedido creado y nunca pagado seguía
  // 'pending' para siempre en /cuenta — con su código y "esperando
  // verificación de tu depósito" — hasta que el cliente reabriera el modal de
  // checkout, que es lo único que antes disparaba el vencimiento. Un cliente
  // que solo visita /cuenta (el caso normal tras depositar) veía un pedido
  // vencido presentado como pagable, depositaba, y approve_order() lo
  // rechazaba por vencido con la plata ya en el banco. Es la misma llamada
  // que createOrder ya hace (0010), SECURITY DEFINER pero acotada a
  // `auth.uid()`, así que dispararla acá es igual de seguro.
  let orders = [];
  let ordersError = false;
  try {
    const { error: expireError } = await supabase.rpc('expire_own_stale_orders');
    if (expireError) throw new Error(expireError.message);
    orders = await fetchOrders(sessionUser.id);
  } catch (err) {
    console.error('No se pudieron cargar los pedidos:', err);
    ordersError = true;
  }

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
    ordersError,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Un solo escritor. onAuthStateChange SIEMPRE emite un evento
    // INITIAL_SESSION al suscribirse (ver GoTrueClient._emitInitialSession en
    // @supabase/auth-js), con la sesión que haya o null si no hay ninguna —
    // así que un getSession() aparte acá no aportaba nada salvo un segundo
    // escritor: si al montar ya existía una sesión sin profile todavía (el
    // caso real de producción, porque la confirmación de email está
    // encendida: signup → email → clic en el link → aterrizas con sesión
    // recién creada), getSession().then(...) y el INITIAL_SESSION del
    // listener llamaban a buildUser() — y por lo tanto a ensure_profile() —
    // en paralelo. `on conflict` protegía `profiles`, pero `organizations` no
    // tiene ese resguardo, así que igual podía quedar una organización
    // huérfana: exactamente el defecto que esta migración existe para cerrar.
    // setLoading(false) va acá adentro, no en un then() aparte, para que
    // cubra los tres casos (sesión válida, sin sesión, sesión zombi) sin
    // dejar a ProtectedRoute colgado en `loading` para siempre.
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setUser(session?.user ? await buildUser(session.user) : null);
      setLoading(false);
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
    // Igual que en login(): el listener de onAuthStateChange se encarga.
    return { confirmEmailRequired: false };
  }, []);

  // No llamamos a buildUser acá: signInWithPassword dispara SIGNED_IN y el
  // listener de onAuthStateChange ya reconstruye el usuario. Hacerlo en los dos
  // lados ejecutaba todo el arranque dos veces por login.
  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
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

// Espeja has_access() en supabase/migrations/0009_published_and_file_path.sql
// (su redefinición más reciente — 0011 solo mueve el filtro de published_at a
// la RLS policy de `reports`, no toca la función) — mantenlos sincronizados.
// Este es el gate de UI; el gate real es la Edge Function, que reconsulta
// has_access() del lado del servidor.
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
