import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectFeed from './ProjectFeed.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';
import { PROJECTS_DATA } from '../data/projectsData.js';

describe('ProjectFeed Component', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'es');

    window.IntersectionObserver = vi.fn().mockImplementation(function () {
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <LanguageProvider>
          <ProjectFeed projects={PROJECTS_DATA} {...props} />
        </LanguageProvider>
      </MemoryRouter>,
    );
  };

  it('renders section header, project rows and social proof block', () => {
    renderComponent();

    // Section header
    expect(screen.getByRole('region', { name: /Portafolio de Proyectos/i })).toBeInTheDocument();
    expect(screen.getByText(/Sistemas Empresariales & Plataformas Web Destacadas/i)).toBeInTheDocument();

    // All projects rendered
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();

    // Social proof block
    expect(screen.getByRole('region', { name: /Prueba Social/i })).toBeInTheDocument();
    expect(screen.getAllByText(/99.99%/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/< 0.8s/i).length).toBeGreaterThan(0);
  });
});
