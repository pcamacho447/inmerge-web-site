import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Contacto from './Contacto.jsx';
import * as leadsModule from '../lib/leads.js';

vi.mock('../lib/leads.js', () => ({
  submitLeadTdr: vi.fn(),
}));

describe('Contacto.jsx Page - Anti-Spam & Rate Limiting UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Contacto />
      </BrowserRouter>,
    );

  it('renders the form with required fields and invisible honeypot', () => {
    renderComponent();

    expect(screen.getByText(/COTIZACIÓN & TDR/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción del Requerimiento \/ Alcance \*/i)).toBeInTheDocument();

    const honeypot = screen.getByLabelText(/No completar este campo/i);
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute('tabIndex', '-1');
    expect(honeypot).toHaveAttribute('autoComplete', 'off');
  });

  it('submits lead successfully when valid data is provided', async () => {
    leadsModule.submitLeadTdr.mockResolvedValueOnce({ success: true });
    renderComponent();

    const emailInput = screen.getByLabelText(/Correo Electrónico \*/i);
    const messageInput = screen.getByLabelText(/Descripción del Requerimiento \/ Alcance \*/i);
    const submitBtn = screen.getByRole('button', { name: /Enviar Solicitud de Cotización/i });

    fireEvent.change(emailInput, { target: { value: 'contacto@banco.pe' } });
    fireEvent.change(messageInput, { target: { value: 'Necesitamos auditoría forense de bases de datos.' } });
    fireEvent.click(submitBtn);

    expect(leadsModule.submitLeadTdr).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'contacto@banco.pe',
        message: 'Necesitamos auditoría forense de bases de datos.',
        honeypot: '',
      }),
    );
  });

  it('displays rate limit warning banner when rate limit is exceeded without mailto fallback', async () => {
    const rateLimitErr = new Error('Has superado el límite de 3 solicitudes por hora');
    rateLimitErr.isRateLimited = true;
    rateLimitErr.code = 'RATE_LIMIT_EXCEEDED';
    leadsModule.submitLeadTdr.mockRejectedValueOnce(rateLimitErr);

    renderComponent();

    const emailInput = screen.getByLabelText(/Correo Electrónico \*/i);
    const messageInput = screen.getByLabelText(/Descripción del Requerimiento \/ Alcance \*/i);
    const submitBtn = screen.getByRole('button', { name: /Enviar Solicitud de Cotización/i });

    fireEvent.change(emailInput, { target: { value: 'spammer@empresa.com' } });
    fireEvent.change(messageInput, { target: { value: 'Solicitud repetitiva' } });
    fireEvent.click(submitBtn);

    const alert = await screen.findByText(/Límite de solicitudes de cotización alcanzado/i);
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/Contactar por WhatsApp de Inmediato/i)).toBeInTheDocument();
  });

  it('renders formal email link and assurance SLA badges', () => {
    renderComponent();

    expect(screen.getByText(/Correo Formal/i)).toBeInTheDocument();
    expect(screen.getByText(/COMPROMISOS DE SERVICIO/i)).toBeInTheDocument();
    expect(screen.getByText(/Compromiso de Respuesta/i)).toBeInTheDocument();
    expect(screen.getByText(/Protocolo de Confidencialidad/i)).toBeInTheDocument();
  });
});
