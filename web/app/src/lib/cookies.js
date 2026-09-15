/**
 * Módulo de Gestión de Cookies y Privacidad de Inmerge
 * Cumplimiento con directivas ePrivacy, RGPD y LPDP (Perú - Ley 29733)
 */

export const COOKIE_CONSENT_KEY = 'inmerge_cookie_consent';
export const EVENT_COOKIE_CONSENT_CHANGED = 'inmerge:cookie-consent-changed';
export const EVENT_OPEN_COOKIE_PREFERENCES = 'inmerge:open-cookie-preferences';

export const COOKIE_CATEGORIES = {
  ESSENTIAL: 'essential',
  ANALYTICS: 'analytics',
  PREFERENCES: 'preferences',
};

/**
 * Inventario detallado de cookies y almacenamiento de Inmerge
 */
export const COOKIE_INVENTORY = [
  {
    name: 'sb-*-auth-token',
    provider: 'Inmerge / Supabase',
    category: COOKIE_CATEGORIES.ESSENTIAL,
    type: 'Almacenamiento Local / Cookie',
    duration: 'Sesión / 1 año renovable',
    purpose: 'Autenticación segura de clientes y equipo consultor, control de sesiones JWT y protección de datos privados.',
  },
  {
    name: 'inmerge_cookie_consent',
    provider: 'Inmerge',
    category: COOKIE_CATEGORIES.ESSENTIAL,
    type: 'Almacenamiento Local / Cookie',
    duration: '12 meses',
    purpose: 'Guarda el registro de consentimiento y las preferencias de cookies seleccionadas por el usuario.',
  },
  {
    name: '_cfuvid / cf_clearance',
    provider: 'Cloudflare',
    category: COOKIE_CATEGORIES.ESSENTIAL,
    type: 'Cookie HTTP',
    duration: 'Sesión / 1 año',
    purpose: 'Mitigación de ataques DDoS, balanceo perimetral y validación de tráfico legítimo.',
  },
  {
    name: 'inmerge_gantt_zoom',
    provider: 'Inmerge',
    category: COOKIE_CATEGORIES.PREFERENCES,
    type: 'Almacenamiento Local',
    duration: 'Persistente',
    purpose: 'Recuerda el nivel de zoom y vista preferida (Semanas/Meses) en el diagrama Gantt de proyectos.',
  },
  {
    name: 'inmerge_analytics_perf',
    provider: 'Inmerge Analytics / Cloudflare Insights',
    category: COOKIE_CATEGORIES.ANALYTICS,
    type: 'Cookie / Métricas',
    duration: '30 días',
    purpose: 'Medición anónima de tiempos de respuesta, latencia y rendimiento de navegación para optimizar la experiencia técnica.',
  },
];

/**
 * Obtiene el estado actual de consentimiento del usuario
 * @returns {{ essential: boolean, analytics: boolean, preferences: boolean, timestamp: string } | null}
 */
export function getCookieConsent() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        essential: true, // Siempre activo
        analytics: Boolean(parsed.analytics),
        preferences: Boolean(parsed.preferences),
        timestamp: parsed.timestamp || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.warn('[cookies] Error al leer el consentimiento:', err);
    return null;
  }
}

/**
 * Guarda las preferencias de consentimiento y despacha el evento global
 */
export function setCookieConsent({ analytics = false, preferences = false }) {
  if (typeof window === 'undefined') return;

  const consentData = {
    essential: true,
    analytics: Boolean(analytics),
    preferences: Boolean(preferences),
    timestamp: new Date().toISOString(),
  };

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));

    // También establecemos una cookie segura para lectura en cabeceras o workers
    const maxAge = 365 * 24 * 60 * 60; // 1 año
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(consentData))}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;

    window.dispatchEvent(
      new CustomEvent(EVENT_COOKIE_CONSENT_CHANGED, {
        detail: consentData,
      })
    );
  } catch (err) {
    console.error('[cookies] Error al guardar consentimiento:', err);
  }

  return consentData;
}

/**
 * Acepta todas las categorías de cookies
 */
export function acceptAllCookies() {
  return setCookieConsent({ analytics: true, preferences: true });
}

/**
 * Rechaza las cookies opcionales (solo mantiene esenciales)
 */
export function rejectOptionalCookies() {
  return setCookieConsent({ analytics: false, preferences: false });
}

/**
 * Dispara el evento para abrir el modal/panel de preferencias de cookies
 */
export function openCookiePreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_OPEN_COOKIE_PREFERENCES));
  }
}

/**
 * Restablece el consentimiento (para pruebas o revocación total)
 */
export function resetCookieConsent() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    document.cookie = `${COOKIE_CONSENT_KEY}=; path=/; max-age=0; SameSite=Lax`;
    window.dispatchEvent(
      new CustomEvent(EVENT_COOKIE_CONSENT_CHANGED, {
        detail: null,
      })
    );
  } catch (err) {
    console.warn('[cookies] Error al restablecer consentimiento:', err);
  }
}
