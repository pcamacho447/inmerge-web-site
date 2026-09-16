import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage, getEquivalentPath, STORAGE_KEY } from './LanguageContext.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

function ConsumerComponent() {
  const { lang, isEn, switchLanguage, content } = useLanguage();
  const location = useLocation();

  return (
    <div>
      <span data-testid="current-lang">{lang}</span>
      <span data-testid="is-en">{isEn ? 'yes' : 'no'}</span>
      <span data-testid="nav-count">{content.NAV_LINKS.length}</span>
      <span data-testid="pathname">{location.pathname}</span>
      <button onClick={() => switchLanguage('en')}>Set EN</button>
      <button onClick={() => switchLanguage('es')}>Set ES</button>
    </div>
  );
}

describe('LanguageContext & Routing', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'es';
    vi.restoreAllMocks();
  });

  it('correctly detects Spanish when on / and browser is Spanish', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-PE');

    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <ConsumerComponent />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('es');
    expect(screen.getByTestId('is-en').textContent).toBe('no');
    expect(document.documentElement.lang).toBe('es');
  });

  it('gently redirects to /en on first visit if browser language is English', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');

    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <ConsumerComponent />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('is-en').textContent).toBe('yes');
    expect(document.documentElement.lang).toBe('en');
  });

  it('correctly detects English when on /en', () => {
    render(
      <MemoryRouter initialEntries={['/en']}>
        <LanguageProvider>
          <ConsumerComponent />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('is-en').textContent).toBe('yes');
    expect(document.documentElement.lang).toBe('en');
  });

  it('maps bi-directional equivalent paths correctly', () => {
    expect(getEquivalentPath('en', '/')).toBe('/en');
    expect(getEquivalentPath('en', '/servicios')).toBe('/en/services');
    expect(getEquivalentPath('en', '/nosotros')).toBe('/en/about');
    expect(getEquivalentPath('en', '/contacto')).toBe('/en/contact');
    expect(getEquivalentPath('en', '/cookies')).toBe('/en/cookies');

    expect(getEquivalentPath('es', '/en')).toBe('/');
    expect(getEquivalentPath('es', '/en/services')).toBe('/servicios');
    expect(getEquivalentPath('es', '/en/about')).toBe('/nosotros');
    expect(getEquivalentPath('es', '/en/contact')).toBe('/contacto');
    expect(getEquivalentPath('es', '/en/cookies')).toBe('/cookies');
  });

  it('switches language and persists preference in localStorage', () => {
    render(
      <MemoryRouter initialEntries={['/servicios']}>
        <LanguageProvider>
          <ConsumerComponent />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('pathname').textContent).toBe('/servicios');

    fireEvent.click(screen.getByText('Set EN'));

    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
    expect(screen.getByTestId('pathname').textContent).toBe('/en/services');
  });

  it('renders LanguageSwitcher with accessible buttons and active state', () => {
    localStorage.setItem(STORAGE_KEY, 'es');
    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <LanguageSwitcher />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const esBtn = screen.getByRole('button', { name: 'Español' });
    const enBtn = screen.getByRole('button', { name: 'English' });

    expect(esBtn).toHaveAttribute('aria-pressed', 'true');
    expect(enBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(enBtn);

    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
  });

  it('announces language change via accessible role="status" live region', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-PE');
    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <ConsumerComponent />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const announcer = screen.getByTestId('lang-announcer');
    expect(announcer).toHaveAttribute('role', 'status');
    expect(announcer).toHaveAttribute('aria-live', 'polite');

    fireEvent.click(screen.getByText('Set EN'));
    expect(announcer.textContent).toBe('Language switched to English');

    fireEvent.click(screen.getByText('Set ES'));
    expect(announcer.textContent).toBe('Página cambiada a Español');
  });
});
