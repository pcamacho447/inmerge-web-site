import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';

import {
  fetchClientOrganization,
  fetchClientOrders,
  updateOrganizationBilling,
  createBankTransferOrder,
} from '../lib/billing.js';

export default function useOrganizationBilling(userId) {
  const [organization, setOrganization] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const loadBillingData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [orgData, ordersData] = await Promise.all([
        fetchClientOrganization(userId),
        fetchClientOrders(userId),
      ]);
      setOrganization(orgData);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  // Suscripción Realtime a cambios en órdenes del usuario
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)),
            );
            if (updated.status === 'approved') {
              setToast({
                type: 'deliverable',
                title: 'Transferencia Bancaria Confirmada',
                message: `Tu orden ${updated.code} ha sido aprobada y validada por el equipo de finanzas.`,
              });
            }
          } else if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleSaveOrganization = async (orgPayload) => {
    setSaving(true);
    try {
      const updated = await updateOrganizationBilling(userId, orgPayload);
      setOrganization(updated);
      setToast({
        type: 'info',
        title: 'Datos Fiscales Guardados',
        message: 'La información de tu organización ha sido actualizada correctamente.',
      });
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOrder = async (orderPayload) => {
    const created = await createBankTransferOrder({
      userId,
      ...orderPayload,
    });
    setOrders((prev) => [created, ...prev]);
    return created;
  };

  return {
    organization,
    orders,
    loading,
    saving,
    error,
    toast,
    dismissToast: () => setToast(null),
    refreshBilling: loadBillingData,
    saveOrganization: handleSaveOrganization,
    createOrder: handleCreateOrder,
  };
}
