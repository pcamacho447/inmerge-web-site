import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationsPopover from './NotificationsPopover.jsx';
import * as notificationsLib from '../../lib/notifications.js';

vi.mock('../../lib/notifications.js', () => ({
  fetchUserNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

describe('NotificationsPopover Component', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      title: 'Entregable Publicado',
      message: 'El informe de auditoría Cloud AWS está listo para revisión.',
      category: 'DELIVERABLE',
      severity: 'HIGH',
      is_read: false,
      created_at: new Date('2026-09-23T10:00:00Z').toISOString(),
      link_url: '/equipo',
    },
    {
      id: 'notif-2',
      title: 'Hallazgo Crítico Detectado',
      message: 'Vulnerabilidad crítica en bucket de almacenamiento.',
      category: 'FINDING',
      severity: 'CRITICAL',
      is_read: false,
      created_at: new Date('2026-09-23T11:00:00Z').toISOString(),
      link_url: null,
    },
    {
      id: 'notif-3',
      title: 'Hito Completado',
      message: 'Fase 01 de diagnóstico Mochica completada.',
      category: 'TASK',
      severity: 'INFO',
      is_read: true,
      created_at: new Date('2026-09-22T08:00:00Z').toISOString(),
      link_url: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering & Visibility', () => {
    it('no renderiza el diálogo si isOpen es false', () => {
      render(<NotificationsPopover isOpen={false} notifications={mockNotifications} onClose={vi.fn()} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Entregable Publicado')).not.toBeInTheDocument();
    });

    it('renderiza la lista de notificaciones con título y mensajes cuando isOpen es true', () => {
      render(<NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={vi.fn()} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Entregable Publicado')).toBeInTheDocument();
      expect(screen.getByText(/El informe de auditoría Cloud AWS/i)).toBeInTheDocument();
      expect(screen.getByText('Hallazgo Crítico Detectado')).toBeInTheDocument();
      expect(screen.getByText('Hito Completado')).toBeInTheDocument();
    });

    it('muestra el estado vacío cuando no hay notificaciones', () => {
      render(<NotificationsPopover isOpen={true} notifications={[]} onClose={vi.fn()} />);

      expect(screen.getByText(/No tienes notificaciones pendientes/i)).toBeInTheDocument();
    });
  });

  describe('Unread Badge Count', () => {
    it('muestra el contador correcto de notificaciones no leídas', () => {
      render(<NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={vi.fn()} />);

      const unreadBadge = screen.getByLabelText(/2 notificaciones no leídas/i);
      expect(unreadBadge).toBeInTheDocument();
      expect(unreadBadge).toHaveTextContent('2');
    });

    it('no muestra badge positivo si todas están leídas', () => {
      const allRead = mockNotifications.map((n) => ({ ...n, is_read: true }));
      render(<NotificationsPopover isOpen={true} notifications={allRead} onClose={vi.fn()} />);

      expect(screen.queryByLabelText(/notificaciones no leídas/i)).not.toBeInTheDocument();
    });
  });

  describe('Mark as Read & Interaction Handlers', () => {
    it('invoca onMarkAsRead con el ID correspondiente al hacer clic en marcar como leída', async () => {
      const user = userEvent.setup();
      const handleMarkAsRead = vi.fn();

      render(<NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={vi.fn()} onMarkAsRead={handleMarkAsRead} />);

      const markButtons = screen.getAllByRole('button', { name: /Marcar como leída/i });
      expect(markButtons.length).toBe(2); // Dos no leídas

      await user.click(markButtons[0]);
      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-1');
    });

    it('invoca onSelectNotification al hacer clic en un item de notificación', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(
        <NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={vi.fn()} onSelectNotification={handleSelect} />,
      );

      const itemTitle = screen.getByText('Entregable Publicado');
      await user.click(itemTitle);

      expect(handleSelect).toHaveBeenCalledWith(mockNotifications[0]);
    });

    it('invoca onMarkAllAsRead al hacer clic en marcar todas como leídas', async () => {
      const user = userEvent.setup();
      const handleMarkAll = vi.fn();

      render(<NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={vi.fn()} onMarkAllAsRead={handleMarkAll} />);

      const markAllBtn = screen.getByRole('button', { name: /Marcar todas como leídas/i });
      await user.click(markAllBtn);

      expect(handleMarkAll).toHaveBeenCalled();
    });
  });

  describe('ARIA Attributes & Accessibility (WCAG 2.1 AA)', () => {
    it('contiene los atributos semánticos ARIA en el diálogo y botones', () => {
      render(<NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={vi.fn()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Centro de Notificaciones');

      const closeButton = screen.getByRole('button', { name: /Cerrar notificaciones/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('cierra el popover al presionar la tecla Escape', () => {
      const handleClose = vi.fn();
      render(<NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });

    it('cierra el popover al hacer clic en el botón de cerrar', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(<NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={handleClose} />);

      const closeBtn = screen.getByRole('button', { name: /Cerrar notificaciones/i });
      await user.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Filtering (Todas vs No leídas)', () => {
    it('permite filtrar para ver solo notificaciones no leídas', async () => {
      const user = userEvent.setup();

      render(<NotificationsPopover isOpen={true} notifications={mockNotifications} onClose={vi.fn()} />);

      // Inicialmente se ven todas
      expect(screen.getByText('Hito Completado')).toBeInTheDocument();

      // Cambiar filtro a no leídas
      const unreadTab = screen.getByRole('tab', { name: /No leídas/i });
      await user.click(unreadTab);

      // Ahora solo se ven las 2 no leídas
      expect(screen.getByText('Entregable Publicado')).toBeInTheDocument();
      expect(screen.getByText('Hallazgo Crítico Detectado')).toBeInTheDocument();
      expect(screen.queryByText('Hito Completado')).not.toBeInTheDocument();
    });
  });

  describe('Autonomous Fetch Mode', () => {
    it('consulta fetchUserNotifications si no se suministran notificaciones explícitas pero sí userEmail', async () => {
      notificationsLib.fetchUserNotifications.mockResolvedValueOnce(mockNotifications);

      render(<NotificationsPopover isOpen={true} userEmail="engineer@inmerge.pe" onClose={vi.fn()} />);

      expect(notificationsLib.fetchUserNotifications).toHaveBeenCalledWith('engineer@inmerge.pe');
    });
  });
});
