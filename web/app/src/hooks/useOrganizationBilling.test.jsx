import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useOrganizationBilling from './useOrganizationBilling.js';
import * as billingLib from '../lib/billing.js';
import { supabase } from '../lib/supabaseClient.js';

vi.mock('../lib/billing.js', () => ({
  fetchClientOrganization: vi.fn(),
  fetchClientOrders: vi.fn(),
  updateOrganizationBilling: vi.fn(),
  createBankTransferOrder: vi.fn(),
}));

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

describe('useOrganizationBilling hook', () => {
  let mockChannel;
  let realtimeCallback;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChannel = {
      on: vi.fn().mockImplementation((event, filter, callback) => {
        realtimeCallback = callback;
        return mockChannel;
      }),
      subscribe: vi.fn().mockReturnValue(mockChannel),
    };

    supabase.channel.mockReturnValue(mockChannel);
  });

  it('loads organization and orders on mount and connects to Realtime channel', async () => {
    billingLib.fetchClientOrganization.mockResolvedValue({
      id: 'org-1',
      legal_name: 'Tech SAC',
      tax_id: '20123456789',
    });
    billingLib.fetchClientOrders.mockResolvedValue([
      { id: 'ord-1', code: 'INM-2026-0001', amount_pen: 5000, status: 'pending' },
    ]);

    const { result } = renderHook(() => useOrganizationBilling('usr-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.organization?.legal_name).toBe('Tech SAC');
    expect(result.current.orders).toHaveLength(1);
    expect(supabase.channel).toHaveBeenCalledWith('user-orders-usr-123');
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('updates order list and displays toast when order is approved via Realtime', async () => {
    billingLib.fetchClientOrganization.mockResolvedValue(null);
    billingLib.fetchClientOrders.mockResolvedValue([
      { id: 'ord-1', code: 'INM-2026-0001', amount_pen: 5000, status: 'pending' },
    ]);

    const { result } = renderHook(() => useOrganizationBilling('usr-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      if (realtimeCallback) {
        realtimeCallback({
          eventType: 'UPDATE',
          new: { id: 'ord-1', code: 'INM-2026-0001', amount_pen: 5000, status: 'approved' },
        });
      }
    });

    expect(result.current.orders[0].status).toBe('approved');
    expect(result.current.toast).toEqual({
      type: 'deliverable',
      title: 'Transferencia Bancaria Confirmada',
      message: 'Tu orden INM-2026-0001 ha sido aprobada y validada por el equipo de finanzas.',
    });
  });

  it('displays error toast when order is rejected via Realtime', async () => {
    billingLib.fetchClientOrganization.mockResolvedValue(null);
    billingLib.fetchClientOrders.mockResolvedValue([
      { id: 'ord-1', code: 'INM-2026-0001', amount_pen: 5000, status: 'pending' },
    ]);

    const { result } = renderHook(() => useOrganizationBilling('usr-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      if (realtimeCallback) {
        realtimeCallback({
          eventType: 'UPDATE',
          new: { id: 'ord-1', code: 'INM-2026-0001', amount_pen: 5000, status: 'rejected' },
        });
      }
    });

    expect(result.current.orders[0].status).toBe('rejected');
    expect(result.current.toast).toEqual({
      type: 'error',
      title: 'Orden Anulada / Rechazada',
      message: 'La orden INM-2026-0001 fue anulada o no se constató la transferencia bancaria.',
    });
  });

  it('handles saveOrganization error with toast notification', async () => {
    billingLib.fetchClientOrganization.mockResolvedValue(null);
    billingLib.fetchClientOrders.mockResolvedValue([]);
    billingLib.updateOrganizationBilling.mockRejectedValue(new Error('RUC inválido.'));

    const { result } = renderHook(() => useOrganizationBilling('usr-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let capturedError;
    await act(async () => {
      try {
        await result.current.saveOrganization({ legalName: 'Tech' });
      } catch (err) {
        capturedError = err;
      }
    });

    expect(capturedError?.message).toBe('RUC inválido.');
    expect(result.current.toast).toEqual({
      type: 'error',
      title: 'Error al Guardar',
      message: 'RUC inválido.',
    });
  });
});
