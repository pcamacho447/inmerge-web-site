import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentPreviewDrawer from './DocumentPreviewDrawer.jsx';

describe('DocumentPreviewDrawer', () => {
  const mockDoc = {
    title: 'Especificación de API',
    fileType: 'REST',
    version: 'v1.2',
    content: 'POST /api/v1/audit - Registra eventos forenses.',
    notes: 'Aprobado por arquitectura.',
    author: 'Winston Architect',
  };

  it('renders drawer when isOpen is true', () => {
    render(<DocumentPreviewDrawer isOpen={true} onClose={vi.fn()} document={mockDoc} />);

    expect(screen.getByText('Especificación de API')).toBeInTheDocument();
    expect(screen.getByText(/POST \/api\/v1\/audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Autor: Winston Architect/i)).toBeInTheDocument();
  });

  it('calls onClose when clicking close button or pressing Escape', () => {
    const onClose = vi.fn();
    render(<DocumentPreviewDrawer isOpen={true} onClose={onClose} document={mockDoc} />);

    const closeBtn = screen.getByRole('button', { name: /✕ Cerrar/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
