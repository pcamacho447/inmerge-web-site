import { useState, useEffect, useMemo } from 'react';
import { fetchUserNotifications, markNotificationAsRead } from '../../lib/notifications.js';

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'CRÍTICO',
    badgeStyle: {
      background: 'rgba(168, 71, 43, 0.15)',
      color: 'var(--terracotta)',
      border: '1px solid var(--terracotta)',
    },
  },
  HIGH: {
    label: 'ALTA',
    badgeStyle: {
      background: 'rgba(216, 168, 78, 0.2)',
      color: 'var(--ochre)',
      border: '1px solid var(--gold)',
    },
  },
  MEDIUM: {
    label: 'MEDIA',
    badgeStyle: {
      background: 'rgba(59, 130, 246, 0.15)',
      color: '#2563eb',
      border: '1px solid rgba(59, 130, 246, 0.3)',
    },
  },
  INFO: {
    label: 'INFO',
    badgeStyle: {
      background: 'var(--cream2)',
      color: 'var(--ink)',
      border: '1px solid var(--border)',
    },
  },
};

const CATEGORY_ICONS = {
  DELIVERABLE: '📦 Entregable',
  FINDING: '🔍 Hallazgo',
  TASK: '📋 Tarea',
  SYSTEM: '⚙️ Sistema',
  SECURITY: '🛡️ Seguridad',
};

function formatTimestamp(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * NotificationsPopover — Centro de Notificaciones In-App Accesible (WCAG 2.1 AA)
 * Compatible con modo controlado (notifications prop) o modo autónomo (userEmail prop).
 */
export default function NotificationsPopover({
  isOpen = false,
  onClose,
  notifications: controlledNotifications = null,
  userEmail = null,
  onMarkAsRead = null,
  onMarkAllAsRead = null,
  onSelectNotification = null,
  isLoading = false,
}) {
  const [internalNotifications, setInternalNotifications] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Fetch autónomo si no se pasan notificaciones controladas pero sí userEmail
  useEffect(() => {
    if (isOpen && controlledNotifications === null && userEmail) {
      setInternalLoading(true);
      fetchUserNotifications(userEmail)
        .then((items) => {
          setInternalNotifications(Array.isArray(items) ? items : []);
        })
        .catch((err) => {
          console.warn('[NotificationsPopover] Error al cargar notificaciones:', err);
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [isOpen, controlledNotifications, userEmail]);

  // Tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeItems = useMemo(() => {
    return controlledNotifications !== null ? controlledNotifications : internalNotifications;
  }, [controlledNotifications, internalNotifications]);

  const unreadCount = useMemo(() => {
    return activeItems.filter((n) => !n.is_read).length;
  }, [activeItems]);

  const filteredItems = useMemo(() => {
    if (filter === 'unread') {
      return activeItems.filter((n) => !n.is_read);
    }
    return activeItems;
  }, [activeItems, filter]);

  const handleMarkItemRead = async (e, notifId) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      await onMarkAsRead(notifId);
    } else {
      await markNotificationAsRead(notifId);
      setInternalNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    if (onMarkAllAsRead) {
      await onMarkAllAsRead();
    } else {
      const unread = activeItems.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => markNotificationAsRead(n.id)));
      setInternalNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const handleItemClick = (notif) => {
    if (onSelectNotification) {
      onSelectNotification(notif);
    }
  };

  if (!isOpen) return null;

  const showLoading = isLoading || internalLoading;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="notifications-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          background: 'rgba(36, 26, 18, 0.25)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* Popover Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Centro de Notificaciones"
        className="notifications-popover-dialog"
        style={{
          position: 'fixed',
          top: '64px',
          right: '20px',
          width: 'min(92vw, 440px)',
          maxHeight: 'min(82vh, 600px)',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 36px rgba(36, 26, 18, 0.2)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            background: 'var(--cream2)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3
              style={{
                margin: 0,
                fontSize: '0.95rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '-0.01em',
              }}
            >
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <span
                aria-label={`${unreadCount} notificaciones no leídas`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'var(--terracotta)',
                  borderRadius: '10px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ochre)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  textDecoration: 'underline',
                  fontFamily: 'var(--font-mono)',
                }}
                aria-label="Marcar todas como leídas"
              >
                Marcar todas como leídas
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar notificaciones"
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div
          role="tablist"
          aria-label="Filtro de notificaciones"
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              background: filter === 'all' ? 'var(--cream2)' : 'transparent',
              borderBottom: filter === 'all' ? '2px solid var(--terracotta)' : '2px solid transparent',
              color: 'var(--ink)',
              fontSize: '0.8rem',
              fontWeight: filter === 'all' ? 700 : 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            Todas ({activeItems.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unread'}
            onClick={() => setFilter('unread')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              background: filter === 'unread' ? 'var(--cream2)' : 'transparent',
              borderBottom: filter === 'unread' ? '2px solid var(--terracotta)' : '2px solid transparent',
              color: 'var(--ink)',
              fontSize: '0.8rem',
              fontWeight: filter === 'unread' ? 700 : 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            No leídas ({unreadCount})
          </button>
        </div>

        {/* List of items */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 0',
          }}
        >
          {showLoading ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>Cargando notificaciones...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                color: 'var(--ink)',
                opacity: 0.7,
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📭</div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {filter === 'unread' ? 'No tienes notificaciones no leídas.' : 'No tienes notificaciones pendientes.'}
              </p>
            </div>
          ) : (
            filteredItems.map((notif) => {
              const severityCfg = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.INFO;
              const categoryLabel = CATEGORY_ICONS[notif.category] || notif.category;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--border)',
                    background: notif.is_read ? 'transparent' : 'rgba(235, 223, 201, 0.4)',
                    cursor: onSelectNotification ? 'pointer' : 'default',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 6px',
                          borderRadius: '2px',
                          ...severityCfg.badgeStyle,
                        }}
                      >
                        {severityCfg.label}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--ink)',
                          opacity: 0.75,
                        }}
                      >
                        {categoryLabel}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--ink)',
                        opacity: 0.6,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatTimestamp(notif.created_at)}
                    </span>
                  </div>

                  <h4
                    style={{
                      margin: '2px 0 4px 0',
                      fontSize: '0.88rem',
                      fontWeight: notif.is_read ? 600 : 700,
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {notif.title}
                  </h4>

                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '0.8rem',
                      color: 'var(--ink)',
                      opacity: 0.85,
                      lineHeight: 1.4,
                    }}
                  >
                    {notif.message}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 4,
                    }}
                  >
                    {!notif.is_read ? (
                      <button
                        type="button"
                        onClick={(e) => handleMarkItemRead(e, notif.id)}
                        aria-label="Marcar como leída"
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '0.72rem',
                          color: 'var(--ink)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        ✓ Marcar como leída
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--ink)',
                          opacity: 0.5,
                        }}
                      >
                        Leída
                      </span>
                    )}

                    {notif.link_url && (
                      <a
                        href={notif.link_url}
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--terracotta)',
                          fontFamily: 'var(--font-mono)',
                          textDecoration: 'none',
                        }}
                      >
                        Ver detalles →
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
