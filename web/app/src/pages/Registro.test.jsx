import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Registro from './Registro.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';
import * as authLib from '../lib/auth.jsx';

vi.mock('../lib/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

describe('Registro Component', () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    authLib.useAuth.mockReturnValue({
      signup: mockSignup,
      user: null,
    });
  });

  it('renders correctly in Spanish when at /registro', () => {
    render(
      <MemoryRouter initialEntries={['/registro']}>
        <LanguageProvider>
          <Registro />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tucorreo@empresa.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña (mínimo 6 caracteres)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Persona natural' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Empresa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toHaveAttribute('href', '/login');
  });

  it('renders correctly in English when at /en/register with compliant autocomplete attributes', () => {
    render(
      <MemoryRouter initialEntries={['/en/register']}>
        <LanguageProvider>
          <Registro />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('work.email@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password (at least 6 characters)')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Full name');
    const emailInput = screen.getByPlaceholderText('work.email@company.com');
    const passwordInput = screen.getByPlaceholderText('Password (at least 6 characters)');

    expect(nameInput).toHaveAttribute('autocomplete', 'name');
    expect(emailInput).toHaveAttribute('autocomplete', 'username');
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');

    expect(screen.getByRole('button', { name: 'Individual' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Corporate Entity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/en/login');
  });

  it('shows flexible tax ID input when Corporate Entity is selected in English', () => {
    render(
      <MemoryRouter initialEntries={['/en/register']}>
        <LanguageProvider>
          <Registro />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const corporateBtn = screen.getByRole('button', { name: 'Corporate Entity' });
    fireEvent.click(corporateBtn);

    expect(screen.getByPlaceholderText(/e\.g\. US EIN, VAT ID or 11-digit RUC/i)).toBeInTheDocument();
  });
});
