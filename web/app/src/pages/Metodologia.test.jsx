import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Metodologia from './Metodologia.jsx';

describe('Metodologia Page (Legacy Forward to Nosotros)', () => {
  it('renders the cinematic hero header as it forwards to Nosotros', () => {
    render(
      <MemoryRouter>
        <Metodologia />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /Somos una firma boutique especializada en ingeniería de software/i,
      }),
    ).toBeInTheDocument();
  });
});
