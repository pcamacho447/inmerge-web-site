import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectSpecModal from './ProjectSpecModal.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';
import { PROJECTS_DATA } from '../data/projectsData.js';

describe('ProjectSpecModal Component — Technical Sheet Lightbox', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'es');
  });

  const sampleProject = PROJECTS_DATA[0]; // audit-fintech-db

  const renderComponent = (props = {}) =>
    render(
      <MemoryRouter>
        <LanguageProvider>
          <ProjectSpecModal isOpen={true} onClose={vi.fn()} project={sampleProject} onOpenAssistant={vi.fn()} {...props} />
        </LanguageProvider>
      </MemoryRouter>,
    );

  it('renders technical sheet modal with title, specs and delivery conditions', () => {
    renderComponent();

    // Verify modal is accessible dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Verify category code and title
    expect(screen.getByText(/INM-CAT-2026.01/i)).toBeInTheDocument();
    expect(screen.getByText(/Saneamiento y Auditoría Forense de Base de Datos de 18M Registros/i)).toBeInTheDocument();

    // Verify technical specifications section and em-dash items
    expect(screen.getByText(/ESPECIFICACIONES TÉCNICAS/i)).toBeInTheDocument();
    expect(screen.getByText(/React 18 \/ Vite con 0 kB bloat/i)).toBeInTheDocument();
    expect(screen.getByText(/Core Web Vitals/i)).toBeInTheDocument();

    // Verify delivery & SLA conditions
    expect(screen.getByText(/CONDICIONES DE ENTREGA & SLA/i)).toBeInTheDocument();
    expect(screen.getByText(/Código fuente completo en Git/i)).toBeInTheDocument();
    expect(screen.getByText(/30 días/i)).toBeInTheDocument();
  });

  it('allows toggling between PEN and USD currency live', () => {
    renderComponent();

    // Default currency is PEN
    expect(screen.getByText(/S\/ 2,400 PEN/i)).toBeInTheDocument();

    // Toggle to USD
    const usdBtn = screen.getByRole('radio', { name: 'USD' });
    fireEvent.click(usdBtn);

    expect(screen.getByText(/\$650 USD/i)).toBeInTheDocument();

    // Toggle back to PEN
    const penBtn = screen.getByRole('radio', { name: 'PEN' });
    fireEvent.click(penBtn);

    expect(screen.getByText(/S\/ 2,400 PEN/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked or Escape key is pressed', () => {
    const handleClose = vi.fn();
    renderComponent({ onClose: handleClose });

    // Click close button
    const closeBtn = screen.getByRole('button', { name: /Cerrar ficha técnica/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('renders WhatsApp quote link and Alaec AI consultation trigger', () => {
    const handleOpenAssistant = vi.fn();
    const handleClose = vi.fn();
    renderComponent({
      onOpenAssistant: handleOpenAssistant,
      onClose: handleClose,
    });

    // WhatsApp link
    const waLink = screen.getByRole('link', { name: /Cotizar esta Solución vía WhatsApp/i });
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute('href');
    expect(waLink.getAttribute('href')).toContain('INM-CAT-2026.01');

    // Alaec AI consultation
    const aiBtn = screen.getByRole('button', { name: /Consultar con Alaec \(IA\)/i });
    fireEvent.click(aiBtn);

    expect(handleClose).toHaveBeenCalled();
    expect(handleOpenAssistant).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.stringContaining('INM-CAT-2026.01'),
      }),
    );
  });

  it('returns null when isOpen is false', () => {
    renderComponent({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
