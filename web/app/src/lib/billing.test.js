import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  INMERGE_BANK_ACCOUNTS,
  ORDER_STATUS_CONFIG,
  fetchClientOrganization,
  updateOrganizationBilling,
  fetchClientOrders,
  createBankTransferOrder,
} from './billing.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));


describe('billing.js module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes exclusively bank transfer accounts and valid order statuses', () => {
    expect(INMERGE_BANK_ACCOUNTS.length).toBeGreaterThan(0);
    expect(INMERGE_BANK_ACCOUNTS[0]).toHaveProperty('bank');
    expect(INMERGE_BANK_ACCOUNTS[0]).toHaveProperty('accountNumber');
    expect(INMERGE_BANK_ACCOUNTS[0]).toHaveProperty('cci');

    expect(ORDER_STATUS_CONFIG.pending.key).toBe('pending');
    expect(ORDER_STATUS_CONFIG.approved.key).toBe('approved');
    expect(ORDER_STATUS_CONFIG.rejected.key).toBe('rejected');
  });

  it('fetchClientOrganization returns null if user is null or no org exists', async () => {
    const res = await fetchClientOrganization(null);
    expect(res).toBeNull();
  });

  it('createBankTransferOrder inserts with method "transferencia_bancaria" and status "pending"', async () => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'ord-123',
            code: 'INM-2026-0001',
            method: 'transferencia_bancaria',
            status: 'pending',
          },
          error: null,
        }),
      }),
    });

    supabase.from.mockReturnValue({ insert: mockInsert });

    const result = await createBankTransferOrder({
      userId: 'usr-1',
      plan: 'Auditoría Cloud AWS',
      amountPen: 4500,
    });

    expect(result.method).toBe('transferencia_bancaria');
    expect(result.status).toBe('pending');
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 'usr-1',
        method: 'transferencia_bancaria',
        status: 'pending',
        amount_pen: 4500,
      }),
    ]);
  });
});
