import { beforeEach, describe, expect, it, vi } from 'vitest';

// Estado compartido con el mock. vi.hoisted corre antes que vi.mock, que a su
// vez se iza por encima de los imports.
const mockState = vi.hoisted(() => ({
  pendingRows: [],
  insertedRows: [],
  insertResult: { data: { id: 'o-nuevo', code: 'INM-2026-0007' }, error: null },
  rpcCalls: [],
}));

// Stand-in mínimo del builder de PostgREST: cada filtro devuelve `this`, la
// cadena awaited resuelve a los pendientes, y `.single()` al insert.
vi.mock('./supabaseClient.js', () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: 'u-1' } }, error: null }) },
    // createOrder llama a expire_own_stale_orders() (0010) antes de mirar si
    // hay algo que reutilizar — ver src/lib/orders.js.
    rpc: (name) => {
      mockState.rpcCalls.push(name);
      return Promise.resolve({ data: 0, error: null });
    },
    from: () => ({
      select() {
        return this;
      },
      eq() {
        return this;
      },
      in() {
        return this;
      },
      or() {
        return this;
      },
      order() {
        return this;
      },
      limit() {
        return this;
      },
      insert(row) {
        mockState.insertedRows.push(row);
        return this;
      },
      single() {
        return Promise.resolve(mockState.insertResult);
      },
      then(resolve, reject) {
        return Promise.resolve({ data: mockState.pendingRows, error: null }).then(resolve, reject);
      },
    }),
  },
}));

const { createOrder } = await import('./orders.js');

describe('createOrder', () => {
  beforeEach(() => {
    mockState.pendingRows = [];
    mockState.insertedRows = [];
    mockState.rpcCalls = [];
  });

  it('barre pedidos vencidos antes de mirar si hay algo que reutilizar', async () => {
    await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(mockState.rpcCalls).toEqual(['expire_own_stale_orders']);
  });

  it('crea un pedido nuevo cuando no hay ninguno pendiente', async () => {
    const order = await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(order.code).toBe('INM-2026-0007');
    expect(mockState.insertedRows).toEqual([{ user_id: 'u-1', kind: 'report', report_id: 'r-1', method: 'deposit' }]);
  });

  it('reutiliza el pedido pendiente en vez de generar otro código', async () => {
    mockState.pendingRows = [{ id: 'o-viejo', code: 'INM-2026-0003', status: 'pending' }];

    const order = await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(order.code).toBe('INM-2026-0003');
    expect(mockState.insertedRows).toEqual([]); // no insertó nada
  });

  it('usa la columna plan para suscripciones, no report_id', async () => {
    await createOrder({ kind: 'subscription', itemId: 'monthly', method: 'yape_plin' });

    expect(mockState.insertedRows).toEqual([{ user_id: 'u-1', kind: 'subscription', plan: 'monthly', method: 'yape_plin' }]);
  });

  it('nunca manda amount_pen: el precio lo pone el servidor', async () => {
    await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(mockState.insertedRows[0]).not.toHaveProperty('amount_pen');
  });
});
