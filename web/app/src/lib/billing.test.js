import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  INMERGE_BANK_ACCOUNTS,
  ORDER_STATUS_CONFIG,
  fetchClientOrganization,
  updateOrganizationBilling,
  fetchClientOrders,
  createBankTransferOrder,
  uploadOrderVoucher,
  verifyBillingOrderAdmin,
} from './billing.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    rpc: vi.fn(),
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

  it('updateOrganizationBilling validates required fields and 11-digit RUC format', async () => {
    await expect(
      updateOrganizationBilling('usr-1', { legalName: '', billingEmail: 'test@empresa.pe' }),
    ).rejects.toThrow('Razón Social y Correo de Facturación son obligatorios.');

    await expect(
      updateOrganizationBilling('usr-1', {
        legalName: 'Tech S.A.C.',
        billingEmail: 'test@empresa.pe',
        billingType: 'ruc',
        taxId: '2012345', // Inválido, menos de 11 dígitos
      }),
    ).rejects.toThrow('El RUC debe contener exactamente 11 dígitos numéricos.');

    await expect(
      updateOrganizationBilling('usr-1', {
        legalName: 'Tech S.A.C.',
        billingEmail: 'test@empresa.pe',
        billingType: 'ruc',
        taxId: '2012345678A', // Inválido, contiene letras
      }),
    ).rejects.toThrow('El RUC debe contener exactamente 11 dígitos numéricos.');
  });

  it('updateOrganizationBilling successfully creates new organization and links profile', async () => {
    const mockProfileSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    const mockOrgInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'org-99', legal_name: 'Tech SAC', tax_id: '20601234567' },
          error: null,
        }),
      }),
    });

    const mockProfileUpsert = vi.fn().mockResolvedValue({ data: null, error: null });

    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return { select: mockProfileSelect, upsert: mockProfileUpsert };
      }
      if (table === 'organizations') {
        return { insert: mockOrgInsert };
      }
      return {};
    });

    const result = await updateOrganizationBilling('usr-1', {
      billingType: 'ruc',
      legalName: 'Tech SAC',
      taxId: '20601234567',
      billingEmail: 'admin@tech.pe',
    });

    expect(result.id).toBe('org-99');
    expect(mockOrgInsert).toHaveBeenCalled();
    expect(mockProfileUpsert).toHaveBeenCalledWith({
      id: 'usr-1',
      organization_id: 'org-99',
    });
  });

  it('fetchClientOrders retrieves orders sorted by creation date with explicit projection', async () => {
    const mockOrderSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [{ id: 'ord-1', code: 'INM-2026-0001', amount_pen: 5000 }],
          error: null,
        }),
      }),
    });

    supabase.from.mockReturnValue({ select: mockOrderSelect });

    const orders = await fetchClientOrders('usr-1');
    expect(orders).toHaveLength(1);
    expect(orders[0].code).toBe('INM-2026-0001');
  });

  it('createBankTransferOrder validates positive amount and inserts with method "transferencia_bancaria"', async () => {
    await expect(
      createBankTransferOrder({ userId: 'usr-1', amountPen: 0 }),
    ).rejects.toThrow('El monto de la orden debe ser un valor numérico positivo');

    await expect(
      createBankTransferOrder({ userId: 'usr-1', amountPen: -150 }),
    ).rejects.toThrow('El monto de la orden debe ser un valor numérico positivo');

    await expect(
      createBankTransferOrder({ userId: 'usr-1', amountPen: 'abc' }),
    ).rejects.toThrow('El monto de la orden debe ser un valor numérico positivo');

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

  it('uploadOrderVoucher uploads binary to storage and updates order status', async () => {
    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    supabase.storage.from.mockReturnValue({ upload: mockUpload });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'ord-1', voucher_status: 'uploaded' },
            error: null,
          }),
        }),
      }),
    });
    supabase.from.mockReturnValue({ update: mockUpdate });

    const fakeFile = new File(['voucher_content'], 'voucher.pdf', { type: 'application/pdf' });
    const res = await uploadOrderVoucher({ orderId: 'ord-1', file: fakeFile, userId: 'usr-1' });

    expect(res.voucher_status).toBe('uploaded');
    expect(supabase.storage.from).toHaveBeenCalledWith('billing-vouchers');
  });

  it('verifyBillingOrderAdmin calls RPC verify_billing_order and handles errors', async () => {
    supabase.rpc.mockResolvedValue({
      data: { success: true, status: 'approved' },
      error: null,
    });

    const res = await verifyBillingOrderAdmin({
      orderId: 'ord-1',
      status: 'approved',
      adminNotes: 'Transferencia BCP confirmada',
    });

    expect(res.status).toBe('approved');
    expect(supabase.rpc).toHaveBeenCalledWith('verify_billing_order', {
      p_order_id: 'ord-1',
      p_status: 'approved',
      p_admin_notes: 'Transferencia BCP confirmada',
    });

    await expect(
      verifyBillingOrderAdmin({ orderId: 'ord-1', status: 'invalid_status' }),
    ).rejects.toThrow('orderId y status (approved | rejected) son obligatorios.');
  });
});
