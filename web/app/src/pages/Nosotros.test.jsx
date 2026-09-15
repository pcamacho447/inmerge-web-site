import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Nosotros from './Nosotros.jsx';

describe('Nosotros Page (Unified with Metodología & Misión/Visión)', () => {
  it('renders the header and core manifest', () => {
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Ingeniería rigurosa, auditoría estricta y datos reproducibles/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('LA FIRMA // INMERGE')).toBeInTheDocument();
    expect(screen.getByText(/Garantía de Verdad Operativa/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingeniería sin Cajas Negras/i)).toBeInTheDocument();
    expect(screen.getByText(/Referencia Técnica Regional/i)).toBeInTheDocument();
  });

  it('renders the 4 methodology stages', () => {
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    expect(screen.getByText('El Método Inmerge en 4 etapas')).toBeInTheDocument();
    expect(screen.getByText('Auditoría & Diagnóstico Inicial')).toBeInTheDocument();
    expect(screen.getByText('Validación, Certificación & Despliegue')).toBeInTheDocument();
  });

  it('renders and allows interacting with the StackTabs component', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    // Initial tab is Cloud & DevOps
    expect(screen.getByText('Amazon Web Services (AWS)')).toBeInTheDocument();

    // Click on Ciencia de Datos tab
    const dataTab = screen.getByRole('tab', { name: /Ciencia de Datos & IA/i });
    await user.click(dataTab);

    expect(screen.getByText('Apache Airflow / Orchestration')).toBeInTheDocument();
  });

  it('renders architecture diagram, assurance principles, and senior roles', () => {
    render(
      <MemoryRouter>
        <Nosotros />
      </MemoryRouter>,
    );

    expect(screen.getByText(/ARQUITECTURA DE FLUJO & AUDITORÍA/i)).toBeInTheDocument();
    expect(screen.getByText(/Nuestros 4 Principios de Aseguramiento/i)).toBeInTheDocument();
    expect(screen.getByText(/El Ingeniero & Auditor Estratégico/i)).toBeInTheDocument();
    expect(screen.getByText('Especialistas Senior')).toBeInTheDocument();
    expect(screen.getByText('Cloud & DevOps Architect')).toBeInTheDocument();
  });
});
