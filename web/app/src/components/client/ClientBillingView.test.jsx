import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      />,
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
      />,
    );

    expect(screen.getByDisplayValue('Minera Los Andes S.A.C.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20123456789')).toBeInTheDocument();

    expect(screen.getByText('INM-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('INM-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('S/ 8,500')).toBeInTheDocument();
    expect(screen.getByText('S/ 12,000')).toBeInTheDocument();
  });

  it('handles RUC input sanitization removing non-numeric characters and submits form', async () => {
    const handleSave = vi.fn().mockResolvedValue({ id: 'org-1' });

    render(
      <ClientBillingView
        organization={null}
        orders={[]}
        loading={false}
        saving={false}
        onSaveOrganization={handleSave}
        user={{ email: 'gerencia@tech.pe' }}
      />,
    );

    const rucInput = screen.getByPlaceholderText('20XXXXXXXXX');
    const legalNameInput = screen.getByPlaceholderText(/e\.g\. Inversiones/i);
    const emailInput = screen.getByPlaceholderText('finanzas@empresa.pe');

    fireEvent.change(rucInput, { target: { value: '2060ABC123456789' } });
    expect(rucInput.value).toBe('20601234567'); // Solo números

    fireEvent.change(legalNameInput, { target: { value: 'Data Core SAC' } });
    fireEvent.change(emailInput, { target: { value: 'finanzas@datacore.pe' } });

    const submitBtn = screen.getByRole('button', { name: /Guardar Información Fiscal/i });
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        legalName: 'Data Core SAC',
        taxId: '20601234567',
        billingEmail: 'finanzas@datacore.pe',
      }),
    );
  });

  it('renders editorial skeleton loader when loading is true', () => {
    render(
      <ClientBillingView
        organization={null}
        orders={[]}
        loading={true}
        saving={false}
        onSaveOrganization={vi.fn()}
        user={{ email: 'cliente@empresa.pe' }}
      />,
    );

    const skeleton = screen.getByTestId('client-billing-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    // Los campos de formulario reales no deben estar visibles mientras carga
    expect(screen.queryByPlaceholderText('20XXXXXXXXX')).not.toBeInTheDocument();
  });

  it('supports international corporate Tax ID / EIN / VAT input and sanitization', async () => {
    const handleSave = vi.fn().mockResolvedValue({ id: 'org-intl' });

    render(
      <ClientBillingView
        organization={null}
        orders={[]}
        loading={false}
        saving={false}
        onSaveOrganization={handleSave}
        user={{ email: 'finance@acme-global.com' }}
        isEn={true}
      />,
    );

    // Cambiar tipo de comprobante a Tax ID corporativo internacional
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'tax_id' } });

    // El placeholder cambia para orientar al cliente internacional
    const taxInput = screen.getByPlaceholderText('e.g. US-123456789 or GB999999973');
    expect(taxInput).toBeInTheDocument();

    // Permite caracteres alfanuméricos y guiones, pero filtra caracteres especiales
    fireEvent.change(taxInput, { target: { value: 'US-987654321@#' } });
    expect(taxInput.value).toBe('US-987654321');

    const legalNameInput = screen.getByPlaceholderText(/e\.g\. Inversiones/i);
    fireEvent.change(legalNameInput, { target: { value: 'Acme Global LLC' } });

    const submitBtn = screen.getByRole('button', { name: /Guardar Información Fiscal|Save Billing Details/i });
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        billingType: 'tax_id',
        legalName: 'Acme Global LLC',
        taxId: 'US-987654321',
        billingEmail: 'finance@acme-global.com',
      }),
    );
  });
});
