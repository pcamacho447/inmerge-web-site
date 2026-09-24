import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createInAppNotification,
  fetchUserNotifications,
  markNotificationAsRead,
  clearNotificationsCache,
  NOTIFICATIONS_CACHE_TTL_MS,
} from './notifications.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('notifications.js — Gestor de Notificaciones In-App y Telemetría', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearNotificationsCache();
  });

  describe('createInAppNotification', () => {
    it('lanza un error si el título o el mensaje están ausentes', async () => {
      await expect(createInAppNotification({})).rejects.toThrow('El título y mensaje de la notificación son obligatorios.');
      await expect(createInAppNotification({ title: 'Solo título' })).rejects.toThrow(
        'El título y mensaje de la notificación son obligatorios.',
      );
      await expect(createInAppNotification({ message: 'Solo mensaje' })).rejects.toThrow(
        'El título y mensaje de la notificación son obligatorios.',
      );
    });

    it('inserta una notificación en Supabase con los campos sanitizados y valores por defecto', async () => {
      const mockCreated = {
        id: 'notif-uuid-1',
        user_email: 'cliente@empresa.com',
        target_role: 'ALL',
        title: 'Nuevo Entregable',
        message: 'Se ha publicado un nuevo entregable técnico.',
        category: 'DELIVERABLE',
        severity: 'INFO',
        project_id: 'proj-123',
        link_url: '/cuenta',
        is_read: false,
        created_at: '2026-09-24T05:00:00Z',
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockCreated, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      supabase.from.mockReturnValue({ insert: insertMock });

      const result = await createInAppNotification({
        userEmail: 'cliente@empresa.com',
        title: 'Nuevo Entregable',
        message: 'Se ha publicado un nuevo entregable técnico.',
        category: 'DELIVERABLE',
        projectId: 'proj-123',
        linkUrl: '/cuenta',
      });

      expect(supabase.from).toHaveBeenCalledWith('user_notifications');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_email: 'cliente@empresa.com',
          target_role: 'ALL',
          title: 'Nuevo Entregable',
          message: 'Se ha publicado un nuevo entregable técnico.',
          category: 'DELIVERABLE',
          severity: 'INFO',
          project_id: 'proj-123',
          link_url: '/cuenta',
          is_read: false,
        }),
      );
      expect(result).toEqual(mockCreated);
    });

    it('asigna roles y severidad específicos (CRITICAL, HIGH, etc.)', async () => {
      const mockCreated = {
        id: 'notif-uuid-2',
        user_email: 'admin@inmerge.pe',
        target_role: 'admin',
        title: 'Hallazgo Crítico',
        message: 'Vulnerabilidad SQL Injection detectada.',
        category: 'FINDING',
        severity: 'CRITICAL',
        project_id: 'proj-123',
        link_url: '/equipo',
        is_read: false,
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockCreated, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      supabase.from.mockReturnValue({ insert: insertMock });

      const result = await createInAppNotification({
        userEmail: 'admin@inmerge.pe',
        targetRole: 'admin',
        title: 'Hallazgo Crítico',
        message: 'Vulnerabilidad SQL Injection detectada.',
        category: 'FINDING',
        severity: 'CRITICAL',
        projectId: 'proj-123',
        linkUrl: '/equipo',
      });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          target_role: 'admin',
          category: 'FINDING',
          severity: 'CRITICAL',
        }),
      );
      expect(result.severity).toBe('CRITICAL');
    });

    it('ejecuta fallback local resiliente si Supabase falla o no está migrado', async () => {
      const selectMock = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'relation user_notifications does not exist' } }),
      });
      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({ select: selectMock }),
      });

      const fallbackResult = await createInAppNotification({
        userEmail: 'admin@inmerge.pe',
        targetRole: 'admin',
        title: 'Alerta offline',
        message: 'Operación en contingencia local.',
        category: 'SYSTEM',
        severity: 'MEDIUM',
      });

      expect(fallbackResult).toBeDefined();
      expect(fallbackResult.title).toBe('Alerta offline');
      expect(fallbackResult.is_read).toBe(false);
      expect(fallbackResult.id).toBeDefined();
    });
  });

  describe('fetchUserNotifications & In-Memory TTL Cache (15s)', () => {
    it('retorna arreglo vacío si no se proporciona userEmail', async () => {
      const result = await fetchUserNotifications('');
      expect(result).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('consulta las notificaciones del usuario ordenadas por fecha descendente', async () => {
      const mockNotifications = [
        {
          id: 'n-1',
          user_email: 'dev@inmerge.pe',
          title: 'Notif 1',
          is_read: false,
          created_at: '2026-09-24T04:00:00Z',
        },
      ];

      const orderMock = vi.fn().mockResolvedValue({ data: mockNotifications, error: null });
      const orMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ or: orMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const data = await fetchUserNotifications('dev@inmerge.pe');

      expect(supabase.from).toHaveBeenCalledWith('user_notifications');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(orMock).toHaveBeenCalledWith('user_email.eq.dev@inmerge.pe,target_role.eq.ALL');
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(data).toEqual(mockNotifications);
    });

    it('soporta filtro unreadOnly: true consultando solo no leídas', async () => {
      const mockUnread = [{ id: 'n-1', user_email: 'dev@inmerge.pe', is_read: false }];

      const orderMock = vi.fn().mockResolvedValue({ data: mockUnread, error: null });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const orMock = vi.fn().mockReturnValue({ eq: eqMock });
      const selectMock = vi.fn().mockReturnValue({ or: orMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const data = await fetchUserNotifications('dev@inmerge.pe', { unreadOnly: true });

      expect(eqMock).toHaveBeenCalledWith('is_read', false);
      expect(data).toEqual(mockUnread);
    });

    it('utiliza caché en memoria dentro del TTL de 15 segundos', async () => {
      expect(NOTIFICATIONS_CACHE_TTL_MS).toBe(15000);

      const mockNotifications = [{ id: 'n-1', title: 'Cached Notif', is_read: false }];
      const orderMock = vi.fn().mockResolvedValue({ data: mockNotifications, error: null });
      const orMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ or: orMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const call1 = await fetchUserNotifications('dev@inmerge.pe');
      const call2 = await fetchUserNotifications('dev@inmerge.pe');

      expect(supabase.from).toHaveBeenCalledTimes(1);
      expect(call1).toEqual(call2);
    });

    it('forceRefresh: true ignora el caché y consulta la base de datos', async () => {
      const mock1 = [{ id: 'n-1', title: 'Notif 1', is_read: false }];
      const mock2 = [{ id: 'n-1', title: 'Notif 1 Actualizada', is_read: false }];

      const orderMock = vi.fn().mockResolvedValueOnce({ data: mock1, error: null }).mockResolvedValueOnce({ data: mock2, error: null });
      const orMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ or: orMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const first = await fetchUserNotifications('dev@inmerge.pe');
      const refreshed = await fetchUserNotifications('dev@inmerge.pe', { forceRefresh: true });

      expect(supabase.from).toHaveBeenCalledTimes(2);
      expect(first[0].title).toBe('Notif 1');
      expect(refreshed[0].title).toBe('Notif 1 Actualizada');
    });

    it('retorna fallback local si Supabase arroja error de consulta', async () => {
      const orderMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Connection refused' } });
      const orMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ or: orMock });
      supabase.from.mockReturnValue({ select: selectMock });

      const result = await fetchUserNotifications('dev@inmerge.pe');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('markNotificationAsRead & Invalidation', () => {
    it('lanza un error si notificationId es inválido o nulo', async () => {
      await expect(markNotificationAsRead(null)).rejects.toThrow('El ID de la notificación es obligatorio.');
    });

    it('actualiza is_read = true en Supabase e invalida el caché', async () => {
      const mockUpdated = { id: 'n-1', is_read: true };
      const singleMock = vi.fn().mockResolvedValue({ data: mockUpdated, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      supabase.from.mockReturnValue({ update: updateMock });

      // Llenamos el caché con un fetch previo
      const fetchOrderMock = vi.fn().mockResolvedValue({ data: [{ id: 'n-1', is_read: false }], error: null });
      const fetchOrMock = vi.fn().mockReturnValue({ order: fetchOrderMock });
      const fetchSelectMock = vi.fn().mockReturnValue({ or: fetchOrMock });

      supabase.from.mockImplementation((table) => {
        if (table === 'user_notifications') {
          return {
            select: fetchSelectMock,
            update: updateMock,
          };
        }
        return {};
      });

      await fetchUserNotifications('dev@inmerge.pe');
      expect(fetchSelectMock).toHaveBeenCalledTimes(1);

      const res = await markNotificationAsRead('n-1');
      expect(updateMock).toHaveBeenCalledWith({ is_read: true });
      expect(eqMock).toHaveBeenCalledWith('id', 'n-1');
      expect(res).toEqual(mockUpdated);

      // Siguiente fetch debe consultar de nuevo la base de datos (caché invalidado)
      await fetchUserNotifications('dev@inmerge.pe');
      expect(fetchSelectMock).toHaveBeenCalledTimes(2);
    });
  });
});
