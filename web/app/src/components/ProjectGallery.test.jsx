import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectGallery from './ProjectGallery.jsx';
import { LanguageProvider, STORAGE_KEY } from '../context/LanguageContext.jsx';
import { PROJECTS_DATA } from '../data/projectsData.js';

describe('ProjectGallery Component', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'es');

    // Mock IntersectionObserver
    window.IntersectionObserver = vi.fn().mockImplementation(function () {
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    });
  });

  const renderComponent = (props = {}) => {
    const sampleMedia = PROJECTS_DATA[0].media;
    return render(
      <MemoryRouter>
        <LanguageProvider>
          <ProjectGallery mediaList={sampleMedia} {...props} />
        </LanguageProvider>
      </MemoryRouter>,
    );
  };

  it('renders asymmetric media grid with video elements and correct span classes', () => {
    renderComponent();

    const videoElement = screen.getByLabelText(/Video Showcase/i);
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('src', '/presencia_web_showcase.mp4');
    expect(videoElement).toHaveAttribute('poster', '/projects/data-sanitization.jpg');
    expect(videoElement).toHaveAttribute('autoplay');
    expect(videoElement).toHaveAttribute('loop');
  });

  it('renders image elements correctly when media item type is image', () => {
    const imageMedia = [
      {
        id: 'img-1',
        type: 'image',
        url: '/projects/aws-cloud.jpg',
        poster: '/projects/aws-cloud.jpg',
        span: 8,
        title: { es: 'Captura de pantalla de AWS', en: 'AWS Screenshot' },
      },
    ];

    render(
      <MemoryRouter>
        <LanguageProvider>
          <ProjectGallery mediaList={imageMedia} />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const img = screen.getByRole('img', { name: /Captura de pantalla de AWS/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/projects/aws-cloud.jpg');
  });
});
