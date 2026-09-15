import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitLeadTdr } from './leads.js';
import { supabase } from './supabaseClient.js';

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
  },
}));

describe('leads.js - submitLeadTdr', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects if email is missing', async () => {
    await expect(submitLeadTdr({ email: '', message: 'Requiero auditoría de base de datos' })).rejects.toThrow(
      /correo electrónico es requerido/i,
    );
  });

  it('rejects if message is missing', async () => {
    await expect(submitLeadTdr({ email: 'cliente@empresa.com', message: '   ' })).rejects.toThrow(
      /descripción del requerimiento es requerida/i,
    );
  });

  it('successfully sanitizes, inserts lead and triggers notify-lead-tdr', async () => {
    const mockInsert = vi.fn().mockResolvedValue({
      error: null,
    });

    supabase.from.mockReturnValue({
      insert: mockInsert,
    });

    const result = await submitLeadTdr({
      pillar: 'auditoria',
      fullName: '  Juan Perez ',
      company: ' Empresa SAC ',
      email: '  CLIENTE@EMPRESA.COM ',
      phone: ' 987654321 ',
      timeline: '1 a 2 meses',
      message: ' Auditoría de calidad de datos en Postgres ',
    });

    expect(result.success).toBe(true);
    expect(result.lead.email).toBe('cliente@empresa.com');
    const expectedPayload = {
      pillar: 'auditoria',
      full_name: 'Juan Perez',
      company: 'Empresa SAC',
      email: 'cliente@empresa.com',
      phone: '987654321',
      timeline: '1 a 2 meses',
      message: 'Auditoría de calidad de datos en Postgres',
      status: 'NUEVO',
    };
    expect(mockInsert).toHaveBeenCalledWith([expectedPayload]);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('notify-lead-tdr', {
      body: { record: expectedPayload },
    });
  });
});
