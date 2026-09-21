import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Inicio from './Inicio.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';

describe('Inicio Page (Atrium Gateway & Typewriter Hero)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, 'es');
  });

  it('renders the cinematic atrium hero section with typewriter h1 and coordinates in Spanish, removing cursor upon completion', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <Inicio />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Ingeniería de software,\s*auditoría de sistemas\s*e inteligencia de datos/i,
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/08°06′S 79°01′W · LIMA, PERÚ · CONSULTORÍA DE INGENIERÍA/i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText('|')).not.toBeInTheDocument();
      },
      { timeout: 3500 },
    );
  });

  it('renders bilingual hero headline and badge when loaded on /en path', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    render(
      <MemoryRouter initialEntries={['/en']}>
        <LanguageProvider>
          <Inicio />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Software engineering,\s*systems auditing\s*& data intelligence/i,
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/08°06′S 79°01′W · LIMA, PERU · ENGINEERING CONSULTANCY/i)).toBeInTheDocument();
  });

  it('renders the 3 architectural exhibition portals without redundant carousels or marketing banners', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <Inicio />
        </LanguageProvider>
      </MemoryRouter>,
    );

    // Verify redundant carousels and marketing CTAs are removed from Home
    expect(screen.queryByText(/CASOS DE ESTUDIO · ARQUITECTURA FORENSE/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Nuestros Pilares$/i, level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByText(/Iniciemos una evaluación técnica de tus sistemas y datos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Consultoría senior directa/i)).not.toBeInTheDocument();

    // Verify the 3 Architectural Portals
    const navPortals = screen.getByRole('navigation', { name: /Salas de Exhibición/i });
    expect(navPortals).toBeInTheDocument();

    // Portal 01: Servicios
    const servicesPortal = screen.getByRole('link', { name: /01 \/ SERVICIOS.*Monografía & Prototipos 1:1/i });
    expect(servicesPortal).toBeInTheDocument();
    expect(servicesPortal).toHaveAttribute('href', '/servicios');

    // Portal 02: Nosotros
    const aboutPortal = screen.getByRole('link', { name: /02 \/ NOSOTROS.*Manifiesto & Directores/i });
    expect(aboutPortal).toBeInTheDocument();
    expect(aboutPortal).toHaveAttribute('href', '/nosotros');

    // Portal 03: Contacto
    const contactPortal = screen.getByRole('link', { name: /03 \/ CONTACTO.*Términos de Referencia/i });
    expect(contactPortal).toBeInTheDocument();
    expect(contactPortal).toHaveAttribute('href', '/contacto');
  });

  it('renders localized portals when loaded on /en path', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    render(
      <MemoryRouter initialEntries={['/en']}>
        <LanguageProvider>
          <Inicio />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const navPortals = screen.getByRole('navigation', { name: /Exhibition Portals/i });
    expect(navPortals).toBeInTheDocument();

    const servicesPortal = screen.getByRole('link', { name: /01 \/ SERVICES.*Monograph & 1:1 Prototypes/i });
    expect(servicesPortal).toBeInTheDocument();
    expect(servicesPortal).toHaveAttribute('href', '/en/services');

    const aboutPortal = screen.getByRole('link', { name: /02 \/ ABOUT.*Manifesto & Directors/i });
    expect(aboutPortal).toBeInTheDocument();
    expect(aboutPortal).toHaveAttribute('href', '/en/about');

    const contactPortal = screen.getByRole('link', { name: /03 \/ CONTACT.*Proposals & Technical Scope/i });
    expect(contactPortal).toBeInTheDocument();
    expect(contactPortal).toHaveAttribute('href', '/en/contact');
  });
});
