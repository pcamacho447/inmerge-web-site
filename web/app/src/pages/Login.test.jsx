import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';
import * as authLib from '../lib/auth.jsx';

vi.mock('../lib/auth.jsx', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'client' } }),
        })),
      })),
    })),
  },
}));

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    authLib.useAuth.mockReturnValue({
      login: mockLogin,
      user: null,
    });
  });

  it('renders correctly in Spanish when at /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /Iniciar sesión/i }) || screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tucorreo@empresa.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Regístrate' })).toHaveAttribute('href', '/registro');
  });

  it('renders correctly in English when at /en/login with compliant autocomplete attributes', () => {
    render(
      <MemoryRouter initialEntries={['/en/login']}>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.email@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('your.email@company.com');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(emailInput).toHaveAttribute('autocomplete', 'username');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/en/register');
    expect(screen.getByText(/International Client Portal:/i)).toBeInTheDocument();
  });

  it('displays localized error message on invalid credentials in English', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid login credentials'));

    render(
      <MemoryRouter initialEntries={['/en/login']}>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('your.email@company.com'), {
      target: { value: 'test@company.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password\./i)).toBeInTheDocument();
    });
  });
});
