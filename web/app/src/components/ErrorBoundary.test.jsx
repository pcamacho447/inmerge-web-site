import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary.jsx';

function ProblemChild({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test crash in component');
  }
  return <div>Contenido Seguro</div>;
}

describe('ErrorBoundary Component', () => {
  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Contenido Seguro')).toBeInTheDocument();
  });

  it('renders fallback alert UI when child throws an error', () => {
    // Suppress console.error in test output for intentional error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Interrupción Temporal del Módulo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();

    spy.mockRestore();
  });
});
