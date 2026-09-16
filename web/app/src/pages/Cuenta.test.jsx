import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cuenta from './Cuenta.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';
import * as authLib from '../lib/auth.jsx';
import * as clientProjectsHook from '../hooks/useClientProjects.js';
import * as billingHook from '../hooks/useOrganizationBilling.js';

vi.mock('../lib/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/useClientProjects.js', () => ({
  default: vi.fn(),
}));

vi.mock('../hooks/useOrganizationBilling.js', () => ({
  default: vi.fn(),
}));

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

describe('Cuenta Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    authLib.useAuth.mockReturnValue({
      user: {
        id: 'client-99',
        email: 'vp.engineering@acme.com',
        fullName: 'Marcus Vance',
        role: 'client',
        isStaff: false,
        isAdmin: false,
      },
      logout: mockLogout,
    });

    clientProjectsHook.default.mockReturnValue({
      projects: [
        {
          id: 'proj-1',
          title: 'AWS Cloud Architecture & ECS Deployment',
          pillar: 'desarrollo',
          status: 'EN_PROGRESO',
          description: 'Enterprise migration to AWS ECS and RDS with zero downtime.',
          milestones: [
            { id: 'm-1', title: 'Infraestructura Terraform', status: 'COMPLETADO', progress: 100 },
          ],
          deliverables: [
            {
              id: 'del-1',
              title: 'AWS Well-Architected Review PDF',
              file_type: 'PDF',
              version: 'v1.0',
            },
          ],
        },
      ],
      loading: false,
      error: null,
      toast: null,
      dismissToast: vi.fn(),
    });

    billingHook.default.mockReturnValue({
      organization: {
        legal_name: 'Acme Global Inc.',
        billing_type: 'ruc',
        tax_id: '98-7654321',
        billing_email: 'finance@acme.com',
        billing_address: '100 Silicon Ave, Suite 300, CA',
      },
      orders: [],
      loading: false,
      saving: false,
      toast: null,
      dismissToast: vi.fn(),
      saveOrganization: vi.fn(),
    });
  });

  it('renders bilingual client portal in English when routed to /en/account', () => {
    render(
      <MemoryRouter initialEntries={['/en/account']}>
        <LanguageProvider>
          <Cuenta />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('EXCLUSIVE CLIENT PORTAL')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Technical Tracking & Deliverables' })).toBeInTheDocument();
    expect(screen.getByText(/Active session:/i)).toBeInTheDocument();
    expect(screen.getByText('vp.engineering@acme.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();

    // Check tabs
    expect(screen.getByText('My Projects & Milestones')).toBeInTheDocument();
    expect(screen.getByText('Invoicing & Bank Accounts')).toBeInTheDocument();
    expect(screen.getByText('Technical Support')).toBeInTheDocument();

    // Check project data
    expect(screen.getByText('AWS Cloud Architecture & ECS Deployment')).toBeInTheDocument();
    expect(screen.getByText('02. Cloud Architecture & AWS')).toBeInTheDocument();
    expect(screen.getByText('📄 Export Summary')).toBeInTheDocument();
    expect(screen.getByText('Calculated Progress')).toBeInTheDocument();
    expect(screen.getByText('Schedule & Executive Milestones')).toBeInTheDocument();
  });

  it('switches to Invoicing & Bank Accounts tab and displays international wire notice', () => {
    render(
      <MemoryRouter initialEntries={['/en/account']}>
        <LanguageProvider>
          <Cuenta />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const billingTab = screen.getByText('Invoicing & Bank Accounts');
    fireEvent.click(billingTab);

    expect(screen.getByText(/INTERNATIONAL CORPORATE CLIENTS/i)).toBeInTheDocument();
    expect(screen.getByText(/institutional wire transfer \(SWIFT\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Billing Details/i })).toBeInTheDocument();
  });

  it('switches to Technical Support tab and displays localized direct contact channels', () => {
    render(
      <MemoryRouter initialEntries={['/en/account']}>
        <LanguageProvider>
          <Cuenta />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const supportTab = screen.getByText('Technical Support');
    fireEvent.click(supportTab);

    expect(screen.getByText('DIRECT MESSAGING CHANNEL')).toBeInTheDocument();
    expect(screen.getByText('Technical On-Duty WhatsApp')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Direct WhatsApp/i })).toBeInTheDocument();
  });
});
