import { supabase } from './supabaseClient.js';

export const NOTIFICATIONS_CACHE_TTL_MS = 15000; // 15s TTL

const notificationsCache = new Map();
const localNotificationsFallback = [];

/**
 * Invalida el caché en memoria de notificaciones.
 */
export function clearNotificationsCache() {
  notificationsCache.clear();
}

/**
 * Sanitiza y crea una notificación in-app para un usuario o rol específico.
 * Incluye fallback resiliente si la base de datos no está migrada o hay problemas de red.
 *
 * @param {Object} params
 * @param {string} [params.userEmail]
 * @param {string} [params.targetRole='ALL'] 'admin' | 'client' | 'engineer' | 'auditor' | 'ALL'
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.category='SYSTEM'] 'DELIVERABLE' | 'FINDING' | 'TASK' | 'SYSTEM' | 'SECURITY'
 * @param {string} [params.severity='INFO'] 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'
 * @param {string|null} [params.projectId=null]
 * @param {string|null} [params.linkUrl=null]
 * @returns {Promise<Object>} Notificación creada
 */
export async function createInAppNotification({
  userEmail,
  targetRole = 'ALL',
  title,
  message,
  category = 'SYSTEM',
  severity = 'INFO',
  projectId = null,
  linkUrl = null,
} = {}) {
  if (!title || !String(title).trim() || !message || !String(message).trim()) {
    throw new Error('El título y mensaje de la notificación son obligatorios.');
  }

  const validCategories = ['DELIVERABLE', 'FINDING', 'TASK', 'SYSTEM', 'SECURITY'];
  const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'INFO'];

  const normalizedCategory = validCategories.includes(category) ? category : 'SYSTEM';
  const normalizedSeverity = validSeverities.includes(severity) ? severity : 'INFO';
  const resolvedEmail = userEmail || (targetRole === 'admin' ? 'admin@inmerge.pe' : 'all@inmerge.pe');

  const payload = {
    user_email: resolvedEmail,
    target_role: targetRole || 'ALL',
    title: String(title).trim(),
    message: String(message).trim(),
    category: normalizedCategory,
    severity: normalizedSeverity,
    project_id: projectId || null,
    link_url: linkUrl || null,
    is_read: false,
  };

  try {
    const tableRef = supabase.from('user_notifications');
    if (!tableRef || typeof tableRef.insert !== 'function') {
      const fallbackItem = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      localNotificationsFallback.unshift(fallbackItem);
      clearNotificationsCache();
      return fallbackItem;
    }

    const { data, error } = await tableRef.insert(payload).select().single();

    if (error) {
      console.warn('[notifications] Error al insertar en user_notifications, aplicando fallback local:', error.message);
      const fallbackItem = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      localNotificationsFallback.unshift(fallbackItem);
      clearNotificationsCache();
      return fallbackItem;
    }

    localNotificationsFallback.unshift(data);
    clearNotificationsCache();
    return data;
  } catch (err) {
    console.warn('[notifications] Excepción al invocar supabase para notificación:', err);
    const fallbackItem = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    localNotificationsFallback.unshift(fallbackItem);
    clearNotificationsCache();
    return fallbackItem;
  }
}

/**
 * Consulta las notificaciones de un usuario con soporte de caché TTL de 15s y fallback local.
 *
 * @param {string} userEmail
 * @param {Object} [options]
 * @param {boolean} [options.unreadOnly=false]
 * @param {boolean} [options.forceRefresh=false]
 * @returns {Promise<Array>} Lista de notificaciones
 */
export async function fetchUserNotifications(userEmail, { unreadOnly = false, forceRefresh = false } = {}) {
  if (!userEmail) return [];

  const cacheKey = `${userEmail}:${Boolean(unreadOnly)}`;
  const now = Date.now();

  if (!forceRefresh && notificationsCache.has(cacheKey)) {
    const cached = notificationsCache.get(cacheKey);
    if (now - cached.timestamp < NOTIFICATIONS_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const tableRef = supabase.from('user_notifications');
    if (!tableRef || typeof tableRef.select !== 'function') {
      const filtered = localNotificationsFallback.filter((item) => {
        const matchesUser = item.user_email === userEmail || item.target_role === 'ALL';
        const matchesRead = unreadOnly ? !item.is_read : true;
        return matchesUser && matchesRead;
      });
      return filtered;
    }

    let query = tableRef.select('*').or(`user_email.eq.${userEmail},target_role.eq.ALL`);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('[notifications] Error al consultar user_notifications, usando fallback local:', error.message);
      const filtered = localNotificationsFallback.filter((item) => {
        const matchesUser = item.user_email === userEmail || item.target_role === 'ALL';
        const matchesRead = unreadOnly ? !item.is_read : true;
        return matchesUser && matchesRead;
      });
      return filtered;
    }

    const results = data || [];
    notificationsCache.set(cacheKey, { timestamp: now, data: results });
    return results;
  } catch (err) {
    console.warn('[notifications] Excepción al consultar user_notifications:', err);
    const filtered = localNotificationsFallback.filter((item) => {
      const matchesUser = item.user_email === userEmail || item.target_role === 'ALL';
      const matchesRead = unreadOnly ? !item.is_read : true;
      return matchesUser && matchesRead;
    });
    return filtered;
  }
}

/**
 * Marca una notificación como leída (is_read = true) e invalida el caché.
 *
 * @param {string} notificationId
 * @returns {Promise<Object>} Notificación actualizada
 */
export async function markNotificationAsRead(notificationId) {
  if (!notificationId) {
    throw new Error('El ID de la notificación es obligatorio.');
  }

  try {
    const tableRef = supabase.from('user_notifications');
    if (!tableRef || typeof tableRef.update !== 'function') {
      const localIndex = localNotificationsFallback.findIndex((n) => n.id === notificationId);
      if (localIndex !== -1) {
        localNotificationsFallback[localIndex].is_read = true;
      }
      clearNotificationsCache();
      return localIndex !== -1 ? localNotificationsFallback[localIndex] : { id: notificationId, is_read: true };
    }

    const { data, error } = await tableRef.update({ is_read: true }).eq('id', notificationId).select().single();

    const localIndex = localNotificationsFallback.findIndex((n) => n.id === notificationId);
    if (localIndex !== -1) {
      localNotificationsFallback[localIndex].is_read = true;
    }

    clearNotificationsCache();

    if (error) {
      console.warn('[notifications] Error al marcar notificación como leída en Supabase:', error.message);
      return localIndex !== -1 ? localNotificationsFallback[localIndex] : { id: notificationId, is_read: true };
    }

    return data;
  } catch (err) {
    console.warn('[notifications] Excepción al marcar notificación:', err);
    clearNotificationsCache();
    return { id: notificationId, is_read: true };
  }
}
