import { beforeEach, describe, expect, it, vi } from 'vitest';

// Estado compartido con el mock. vi.hoisted corre antes que vi.mock, que a su
// vez se iza por encima de los imports.
const mockState = vi.hoisted(() => ({
  pendingRows: [],
  insertedRows: [],
  filtros: [],
  tablasConsultadas: [],
  insertResult: { data: { id: 'o-nuevo', code: 'INM-2026-0007' }, error: null },
  rpcCalls: [],
  // Secuencia compartida entre rpc() y from(): a diferencia de rpcCalls y
  // tablasConsultadas por separado, esto es lo único que puede probar un
  // ORDEN relativo entre las dos llamadas.
  secuencia: [],
}));

// Stand-in mínimo del builder de PostgREST: cada filtro registra sus
// argumentos en vez de devolver `this` sin mirarlos — un mock que ignora lo
// que se le pasa no puede distinguir "filtró por el usuario correcto" de
// "filtró por cualquier cosa". La cadena awaited resuelve a los pendientes, y
// `.single()` al insert.
vi.mock('./supabaseClient.js', () => ({
  supabase: {
    auth: { getUser: async () => ({ data: { user: { id: 'u-1' } }, error: null }) },
    // createOrder llama a expire_own_stale_orders() (0010) antes de mirar si
    // hay algo que reutilizar — ver src/lib/orders.js.
    rpc: (name) => {
      mockState.rpcCalls.push(name);
      mockState.secuencia.push(`rpc:${name}`);
      return Promise.resolve({ data: 0, error: null });
    },
    from(tabla) {
      mockState.tablasConsultadas.push(tabla);
      mockState.secuencia.push(`from:${tabla}`);
      return {
        select() {
          return this;
        },
        eq(col, val) {
          mockState.filtros.push([col, val]);
          return this;
        },
        in(col, vals) {
          mockState.filtros.push([col, vals]);
          return this;
        },
        or(expr) {
          mockState.filtros.push(['or', expr]);
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
      };
    },
  },
}));

const { createOrder } = await import('./orders.js');

describe('createOrder', () => {
  beforeEach(() => {
    mockState.pendingRows = [];
    mockState.insertedRows = [];
    mockState.filtros = [];
    mockState.tablasConsultadas = [];
    mockState.rpcCalls = [];
    mockState.secuencia = [];
    mockState.insertResult = { data: { id: 'o-nuevo', code: 'INM-2026-0007' }, error: null };
  });

  it('llama a expire_own_stale_orders antes de consultar la tabla orders', async () => {
    await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(mockState.rpcCalls).toEqual(['expire_own_stale_orders']);
    // No basta con que el rpc se haya llamado: tiene que haber pasado ANTES
    // de la primera consulta a `from()`, que es lo que la barrida previene
    // (ver el comentario sobre expire_own_stale_orders en orders.js). La
    // secuencia compartida es lo que realmente prueba el orden — si
    // createOrder llamara a from('orders') antes que al rpc, esta aserción
    // fallaría aunque ambas listas por separado siguieran viéndose "bien".
    expect(mockState.secuencia[0]).toBe('rpc:expire_own_stale_orders');
    expect(mockState.secuencia[1]).toBe('from:orders');
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

  it('busca el pendiente filtrando por usuario, tipo, ítem, estado y vencimiento', async () => {
    await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(mockState.filtros[0]).toEqual(['user_id', 'u-1']);
    expect(mockState.filtros[1]).toEqual(['kind', 'report']);
    expect(mockState.filtros[2]).toEqual(['report_id', 'r-1']);
    expect(mockState.filtros[3]).toEqual(['status', 'pending']);
    // El cuarto filtro es el `.or(...)` de vencimiento: cinturón-y-tirantes
    // sobre expire_own_stale_orders, ver el comentario en orders.js. Se
    // verifica la forma en vez del timestamp exacto (que depende de
    // Date.now()).
    expect(mockState.filtros[4][0]).toBe('or');
    expect(mockState.filtros[4][1]).toMatch(/^expires_at\.is\.null,expires_at\.gt\.\d{4}-\d{2}-\d{2}T/);
  });

  it('consulta la tabla orders y ninguna otra', async () => {
    await createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' });

    expect(new Set(mockState.tablasConsultadas)).toEqual(new Set(['orders']));
  });

  it('propaga el error del insert en vez de devolver un pedido inválido', async () => {
    mockState.insertResult = { data: null, error: { message: 'boom' } };

    await expect(createOrder({ kind: 'report', itemId: 'r-1', method: 'deposit' })).rejects.toThrow('boom');
  });
});
