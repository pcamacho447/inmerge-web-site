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
async function ensureProfile(sessionUser) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (error) {
      console.warn('Profiles check error:', error.message);
      return true;
    }

    if (!profile) {
      // Si el trigger de la BD aún no creó el perfil o es un usuario preexistente
      await supabase.from('profiles').insert({
        id: sessionUser.id,
        email: sessionUser.email,
        full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || '',
        role: sessionUser.user_metadata?.role || 'client',
      }).maybeSingle();
    }
    return true;
  } catch (err) {
    console.warn('ensureProfile exception:', err);
    return true;
  }
}

async function fetchProfileFields(userId) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, company, phone, role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      return { fullName: '', company: '', phone: '', role: 'client', isStaff: false };
    }

    const role = profile.role || 'client';
    const isStaff = ['admin', 'auditor', 'engineer'].includes(role);

    return {
      fullName: profile.full_name || '',
      company: profile.company || '',
      phone: profile.phone || '',
      role,
      isStaff,
    };
  } catch {
    return { fullName: '', company: '', phone: '', role: 'client', isStaff: false };
  }
}

async function buildUser(sessionUser) {
  await ensureProfile(sessionUser);
  const profileFields = await fetchProfileFields(sessionUser.id);

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
