import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockState = vi.hoisted(() => ({ createOrderImpl: null }));

vi.mock('../lib/orders.js', () => ({
  ORDER_METHODS: { DEPOSIT: 'deposit', YAPE_PLIN: 'yape_plin' },
  createOrder: (...args) => mockState.createOrderImpl(...args),
}));

vi.mock('../lib/auth.jsx', () => ({
  useAuth: () => ({ user: { id: 'u-1' }, subscribe: vi.fn(), purchaseReport: vi.fn(), refreshUser: vi.fn() }),
}));

const CheckoutModal = (await import('./CheckoutModal.jsx')).default;

const PLAN = { id: 'monthly', name: 'Premium Mensual', price_pen: 249, period: 'mes' };

function montar() {
  return render(
    <MemoryRouter>
      <CheckoutModal kind="subscription" item={PLAN} onClose={vi.fn()} />
    </MemoryRouter>,
  );
}

describe('CheckoutModal', () => {
  beforeEach(() => {
    mockState.createOrderImpl = null;
  });

  // Esta es la garantía más fuerte del spec original, y hasta ahora estaba
  // sostenida solo por un comentario en el código (ver el catch en
  // handleSubmit, CheckoutModal.jsx).
  it('no entrega datos bancarios si el pedido no se pudo registrar', async () => {
    mockState.createOrderImpl = () => Promise.reject(new Error('no se pudo guardar'));
    montar();

    await userEvent.click(screen.getByRole('button', { name: /generar pedido/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('no se pudo guardar');
    // La garantía negativa: ni el CCI ni el número de cuenta aparecen en
    // ningún lado del documento cuando el pedido no quedó registrado.
    expect(screen.queryByText(/CCI/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/3082499683/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generar pedido/i })).toBeInTheDocument();
  });

  it('muestra el método guardado en el pedido, no el elegido en el formulario', async () => {
    // El usuario elige Yape, pero createOrder reutiliza un pendiente de depósito.
    mockState.createOrderImpl = () => Promise.resolve({ id: 'o-1', code: 'INM-26-A1B2C3', amount_pen: 249, method: 'deposit' });
    montar();

    await userEvent.click(screen.getByRole('radio', { name: /yape/i }));
    await userEvent.click(screen.getByRole('button', { name: /generar pedido/i }));

    // El código aparece dos veces en el markup real (el título grande y de
    // nuevo dentro de "pon el código X en el concepto"), así que
    // findByText fallaría por ambigüedad — findAllByText es lo correcto acá.
    expect(await screen.findAllByText('INM-26-A1B2C3')).not.toHaveLength(0);
    expect(screen.getByText('CCI')).toBeInTheDocument(); // datos de depósito, no de Yape
  });
});
