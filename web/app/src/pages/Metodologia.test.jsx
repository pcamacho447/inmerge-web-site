import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Metodologia from './Metodologia.jsx';

describe('Metodologia Page', () => {
  it('renders the header and the 4 methodology stages', () => {
    render(
      <MemoryRouter>
        <Metodologia />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Ingeniería rigurosa, auditoría estricta y datos reproducibles/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Auditoría & Diagnóstico Inicial')).toBeInTheDocument();
    expect(screen.getByText('Validación, Certificación & Despliegue')).toBeInTheDocument();
  });

  it('switches to Stack tab and shows StackTabs component', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Metodologia />
      </MemoryRouter>,
    );

    // Switch to Stack tab
    const stackTab = screen.getByRole('tab', { name: /Stack Tecnológico/i });
    await user.click(stackTab);

    // Initial tab is Cloud & DevOps
    expect(screen.getByText('Amazon Web Services (AWS)')).toBeInTheDocument();

    // Click on Ciencia de Datos tab
    const dataTab = screen.getByRole('tab', { name: /Ciencia de Datos & IA/i });
    await user.click(dataTab);

    expect(screen.getByText('Apache Airflow / Orchestration')).toBeInTheDocument();
  });

  it('renders the ManifestoCarousel with engineering assurance content', () => {
    render(
      <MemoryRouter>
        <Metodologia />
      </MemoryRouter>,
    );

    // ManifestoCarousel renders as carousel region
    const carousel = screen.getByRole('region', { name: /Manifiesto de Ingeniería Inmerge/i });
    expect(carousel).toBeInTheDocument();
  });
});
