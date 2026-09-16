import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCookieConsent,
  setCookieConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  resetCookieConsent,
  openCookiePreferences,
  COOKIE_CONSENT_KEY,
  EVENT_COOKIE_CONSENT_CHANGED,
  EVENT_OPEN_COOKIE_PREFERENCES,
} from './cookies.js';

describe('cookies.js - Módulo de consentimiento de cookies', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${COOKIE_CONSENT_KEY}=; path=/; max-age=0`;
    vi.restoreAllMocks();
  });

  it('retorna null si el usuario no ha respondido al consentimiento', () => {
    expect(getCookieConsent()).toBeNull();
  });

  it('permite registrar consentimiento personalizado y persiste en localStorage y cookie', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const result = setCookieConsent({ analytics: true, preferences: false });

    expect(result.essential).toBe(true);
    expect(result.analytics).toBe(true);
    expect(result.preferences).toBe(false);
    expect(result.timestamp).toBeDefined();

    const stored = getCookieConsent();
    expect(stored).toEqual(result);
    expect(document.cookie).toContain(COOKIE_CONSENT_KEY);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EVENT_COOKIE_CONSENT_CHANGED,
        detail: result,
      }),
    );
  });

  it('acceptAllCookies() activa todas las categorías de cookies', () => {
    const result = acceptAllCookies();

    expect(result.essential).toBe(true);
    expect(result.analytics).toBe(true);
    expect(result.preferences).toBe(true);

    const stored = getCookieConsent();
    expect(stored.analytics).toBe(true);
    expect(stored.preferences).toBe(true);
  });

  it('rejectOptionalCookies() mantiene solo las esenciales y desactiva opcionales', () => {
    const result = rejectOptionalCookies();

    expect(result.essential).toBe(true);
    expect(result.analytics).toBe(false);
    expect(result.preferences).toBe(false);

    const stored = getCookieConsent();
    expect(stored.analytics).toBe(false);
    expect(stored.preferences).toBe(false);
  });

  it('resetCookieConsent() elimina la persistencia y notifica null', () => {
    setCookieConsent({ analytics: true, preferences: true });
    expect(getCookieConsent()).not.toBeNull();

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    resetCookieConsent();

    expect(getCookieConsent()).toBeNull();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EVENT_COOKIE_CONSENT_CHANGED,
        detail: null,
      }),
    );
  });

  it('openCookiePreferences() despacha el evento global para abrir el modal', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    openCookiePreferences();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EVENT_OPEN_COOKIE_PREFERENCES,
      }),
    );
  });
});
