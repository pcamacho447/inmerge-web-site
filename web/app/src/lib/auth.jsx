import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient.js';

const AuthContext = createContext(null);

/**
 * Garantiza que el perfil de usuario exista en public.profiles
 */
async function ensureProfile(sessionUser) {
  try {
    const { data: profile, error } = await supabase.from('profiles').select('id, role').eq('id', sessionUser.id).maybeSingle();

    if (error) {
      console.warn('Profiles check error:', error.message);
      return true;
    }

    if (!profile) {
      await supabase
        .from('profiles')
        .insert({
          id: sessionUser.id,
          email: sessionUser.email,
          full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || '',
          role: sessionUser.user_metadata?.role || 'client',
        })
        .maybeSingle();
    }
    return true;
  } catch (err) {
    console.warn('ensureProfile exception:', err);
    return true;
  }
}

/**
 * Obtiene los campos del perfil y roles organizacionales
 */
async function fetchProfileFields(userId) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, company, phone, role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      return { fullName: '', company: '', phone: '', role: 'client', isStaff: false, isAdmin: false };
    }

    const role = profile.role || 'client';
    const isStaff = ['admin', 'auditor', 'engineer'].includes(role);
    const isAdmin = role === 'admin';

    return {
      fullName: profile.full_name || '',
      company: profile.company || '',
      phone: profile.phone || '',
      role,
      isStaff,
      isAdmin,
    };
  } catch {
    return { fullName: '', company: '', phone: '', role: 'client', isStaff: false, isAdmin: false };
  }
}

/**
 * Construye el objeto de usuario activo con perfil e identidad
 */
async function buildUser(sessionUser) {
  await ensureProfile(sessionUser);
  const profileFields = await fetchProfileFields(sessionUser.id);

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    ...profileFields,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

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

  const signup = useCallback(async ({ fullName, email, password, company, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, company, phone } },
    });
    if (error) throw error;
    if (!data.session) {
      throw new Error('Ese correo ya tiene una cuenta. Inicia sesión con tu contraseña.');
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ? await buildUser(session.user) : null);
  }, []);

  const value = { user, loading, signup, login, logout, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
