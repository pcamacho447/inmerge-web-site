import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Inicio from './Inicio.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';

describe('Inicio Page (Cinematic Hero & Strategic Pillars)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, 'es');
  });

  it('renders the cinematic hero section with h1 and strategic badge in Spanish', () => {
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

    expect(screen.getByText(/AUDITORÍA · DESARROLLO CLOUD · CIENCIA DE DATOS/i)).toBeInTheDocument();
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

    expect(screen.getByText(/AUDITING · CLOUD DEVELOPMENT · DATA SCIENCE/i)).toBeInTheDocument();
  });

  it('renders the case studies showcase directly after the hero without redundant pillar cards', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <Inicio />
        </LanguageProvider>
      </MemoryRouter>,
    );

    // Verify redundant standalone pillars section is removed from Home
    expect(screen.queryByText(/ESTRATEGIAS/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Nuestros Pilares$/i, level: 2 })).not.toBeInTheDocument();

    // Verify Case Studies & Engineering Architecture Showcase is rendered
    expect(screen.getByText(/CASOS DE ESTUDIO · ARQUITECTURA FORENSE/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingeniería en Producción: Evidencia técnica y resultados auditables/i)).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: /índice de casos de estudio técnicos/i })).toBeInTheDocument();
  });

  it('renders the final CTA banner with TDR and WhatsApp action buttons', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LanguageProvider>
          <Inicio />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Iniciemos una evaluación técnica de tus sistemas y datos/i)).toBeInTheDocument();

    const tdrLink = screen.getByRole('link', { name: /Solicitar Términos de Referencia \(TDR\)/i });
    expect(tdrLink).toBeInTheDocument();
    expect(tdrLink).toHaveAttribute('href', '/contacto');

    const waLink = screen.getByRole('link', { name: /Escribir a WhatsApp/i });
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute('target', '_blank');
  });
});
