import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient.js';
import { DEMO_MODE } from './demoMode.js';

// Identidad REAL (Supabase Auth + profiles/organizations). El pago dormido es
// por depósito bancario con verificación humana: el cliente crea un pedido
// (tabla `orders`, ver lib/orders.js, dormido — solo lo llama CheckoutModal) y
// el dueño lo aprueba con approve_order() desde el SQL Editor, que es lo único
// que escribe `subscriptions`/`purchases`. Nunca escribas esas tablas desde
// acá. Ya no se leen acá tampoco: ningún reader en src/ consulta
// user.subscription/user.purchases/user.orders fuera del checkout simulado de
// abajo, y el acceso real a un reporte lo decide has_access() del lado del
// servidor al momento de la descarga — así que buildUser() ya no paga esos
// round-trips en cada cambio de sesión.
//
// Con DEMO_MODE=true revive el checkout simulado que escribe en localStorage,
// para mostrar el flujo sin que nadie deposite. Con la bandera apagada —el
// default— el mock está COMPLETAMENTE fuera.

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

  const profileFields = await fetchProfileFields(sessionUser.id);

  // Nada en src/ lee user.subscription/user.purchases fuera de subscribe()/
  // purchaseReport() acá mismo (el checkout simulado de DEMO_MODE) — no hay
  // lectura real de `subscriptions`/`purchases` ni de `orders` en cada cambio
  // de sesión: esas tablas ya no gatean nada en la UI (el acceso real lo
  // decide has_access() del lado del servidor al momento de la descarga), así
  // que no vale la pena pagar el round-trip en el camino crítico de crear una
  // cuenta. Con la bandera apagada (default) esto es null/[] sin tocar la BD.
  const mockState = DEMO_MODE ? loadMockState(sessionUser.id) : { subscription: null, purchases: [] };

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    ...profileFields,
    subscription: mockState.subscription,
    purchases: mockState.purchases || [],
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
    // caso real de producción hoy: recargar la página o volver al sitio con
    // la sesión restaurada desde localStorage, antes de que ensure_profile()
    // haya corrido alguna vez), getSession().then(...) y el INITIAL_SESSION del
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

  // La confirmación por correo está desactivada en el proyecto: signUp deja
  // sesión iniciada de inmediato y el listener de onAuthStateChange construye
  // el usuario. No hay rama de "revisa tu correo" porque no hay correo.
  //
  // Un correo ya registrado sigue devolviendo éxito sin sesión y sin crear
  // nada — GoTrue lo hace a propósito, para que nadie descubra qué direcciones
  // tienen cuenta probándolas. Ese caso se detecta acá y se convierte en un
  // error accionable, porque sin sesión el usuario se quedaría mirando un
  // formulario que "funcionó" y no lo llevó a ninguna parte.
  const signup = useCallback(async ({ fullName, email, password, billingType, taxId }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, billing_type: billingType, tax_id: taxId || null } },
    });
    if (error) throw error;
    if (!data.session) {
      throw new Error('Ese correo ya tiene una cuenta. Inicia sesión con tu contraseña.');
    }
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

  // Estas dos son SOLO del modo demo. Si alguien las cablea en producción,
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

  const value = { user, loading, signup, login, logout, subscribe, purchaseReport, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
