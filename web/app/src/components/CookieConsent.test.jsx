import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CookieConsent from './CookieConsent.jsx';
import {
  getCookieConsent,
  setCookieConsent,
  openCookiePreferences,
  COOKIE_CONSENT_KEY,
} from '../lib/cookies.js';

describe('CookieConsent Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${COOKIE_CONSENT_KEY}=; path=/; max-age=0`;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('no se muestra inmediatamente pero aparece tras el retardo si no hay consentimiento', () => {
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>
    );

    expect(screen.queryByRole('region', { name: /aviso de privacidad y cookies/i })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByRole('region', { name: /aviso de privacidad y cookies/i })).toBeInTheDocument();
    expect(screen.getByText('Control de Privacidad y Cookies')).toBeInTheDocument();
  });

  it('no se muestra si el usuario ya registró consentimiento previo', () => {
    setCookieConsent({ analytics: true, preferences: true });

    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.queryByRole('region', { name: /aviso de privacidad y cookies/i })).not.toBeInTheDocument();
  });

  it('permite aceptar todas las cookies desde el banner', () => {
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    const acceptBtn = screen.getByRole('button', { name: /aceptar todas/i });
    fireEvent.click(acceptBtn);

    const consent = getCookieConsent();
    expect(consent.essential).toBe(true);
    expect(consent.analytics).toBe(true);
    expect(consent.preferences).toBe(true);

    expect(screen.queryByRole('region', { name: /aviso de privacidad y cookies/i })).not.toBeInTheDocument();
  });

  it('permite rechazar cookies opcionales (solo esenciales)', () => {
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    const rejectBtn = screen.getByRole('button', { name: /solo esenciales/i });
    fireEvent.click(rejectBtn);

    const consent = getCookieConsent();
    expect(consent.essential).toBe(true);
    expect(consent.analytics).toBe(false);
    expect(consent.preferences).toBe(false);

    expect(screen.queryByRole('region', { name: /aviso de privacidad y cookies/i })).not.toBeInTheDocument();
  });

  it('permite abrir el modal de preferencias, seleccionar categorías y guardar', () => {
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    const customizeBtn = screen.getByRole('button', { name: /personalizar/i });
    fireEvent.click(customizeBtn);

    expect(screen.getByRole('dialog', { name: /preferencias de cookies/i })).toBeInTheDocument();

    const analyticsCheckbox = screen.getByLabelText(/permitir cookies analíticas/i);
    const prefsCheckbox = screen.getByLabelText(/permitir cookies de preferencias/i);

    fireEvent.click(analyticsCheckbox);
    expect(analyticsCheckbox).toBeChecked();

    const saveBtn = screen.getByRole('button', { name: /guardar preferencias/i });
    fireEvent.click(saveBtn);

    const consent = getCookieConsent();
    expect(consent.analytics).toBe(true);
    expect(consent.preferences).toBe(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se abre ante el evento global openCookiePreferences', () => {
    setCookieConsent({ analytics: false, preferences: false });

    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => {
      openCookiePreferences();
    });

    expect(screen.getByRole('dialog', { name: /preferencias de cookies/i })).toBeInTheDocument();
  });
});
