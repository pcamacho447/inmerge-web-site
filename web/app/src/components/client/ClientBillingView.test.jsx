import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientBillingView from './ClientBillingView.jsx';

describe('ClientBillingView Component', () => {
  const mockOrg = {
    billing_type: 'ruc',
    legal_name: 'Minera Los Andes S.A.C.',
    tax_id: '20123456789',
    billing_email: 'contabilidad@minera.pe',
    billing_address: 'Av. Las Begonias 450, San Isidro',
  };

  const mockOrders = [
    {
      id: 'ord-1',
      code: 'INM-2026-0001',
      plan: 'Auditoría Técnica de Base de Datos y AWS',
      amount_pen: 8500,
      method: 'transferencia_bancaria',
      status: 'pending',
      created_at: '2026-09-10T10:00:00Z',
    },
    {
      id: 'ord-2',
      code: 'INM-2026-0002',
      plan: 'Desarrollo de Microservicios Cloud',
      amount_pen: 12000,
      method: 'transferencia_bancaria',
      status: 'approved',
      created_at: '2026-08-15T10:00:00Z',
    },
  ];

  it('renders official Inmerge bank accounts for bank transfers exclusively', () => {
    render(
      <ClientBillingView
        organization={mockOrg}
        orders={mockOrders}
        loading={false}
        saving={false}
        onSaveOrganization={vi.fn()}
        user={{ email: 'cliente@empresa.pe' }}
      />
    );

    expect(screen.getByText(/Cuentas Bancarias Oficiales para Transferencias/i)).toBeInTheDocument();
    expect(screen.getByText(/BCP \(Banco de Crédito del Perú\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Interbank/i)).toBeInTheDocument();
    expect(screen.getByText(/BBVA Perú/i)).toBeInTheDocument();
  });

  it('renders the tax data form pre-filled and the list of service orders', () => {
    render(
      <ClientBillingView
        organization={mockOrg}
        orders={mockOrders}
        loading={false}
        saving={false}
        onSaveOrganization={vi.fn()}
        user={{ email: 'cliente@empresa.pe' }}
      />
    );

    expect(screen.getByDisplayValue('Minera Los Andes S.A.C.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20123456789')).toBeInTheDocument();

    expect(screen.getByText('INM-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('INM-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('S/ 8,500')).toBeInTheDocument();
    expect(screen.getByText('S/ 12,000')).toBeInTheDocument();
  });
});
