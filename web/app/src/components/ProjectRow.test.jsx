import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectRow from './ProjectRow.jsx';
import { LanguageProvider } from '../context/LanguageContext.jsx';

const mockProject = {
  id: 'audit-fintech-db',
  number: '01',
  catNumber: 'INM-CAT-2026.01',
  client: {
    es: 'Grupo Financiero & Servicios Corporativos',
    en: 'Financial & Corporate Services Group',
  },
  industry: {
    es: 'Servicios Financieros & Banca',
    en: 'Financial Services & Banking',
  },
  title: {
    es: 'Saneamiento y Auditoría Forense de Base de Datos de 18M Registros',
    en: 'Forensic Audit & Data Sanitization for 18M Records Database',
  },
  summary: {
    es: 'Auditoría integral de calidad y desduplicación.',
    en: 'Comprehensive quality audit and deduplication.',
  },
  stack: ['PostgreSQL', 'Python', 'React 18'],
  metrics: [
    { value: '18.4M', label: { es: 'Registros auditados', en: 'Records audited' } },
    { value: '99.99%', label: { es: 'Integridad de datos', en: 'Data integrity' } },
  ],
  videoUrl: '/presencia_web_showcase.mp4',
  posterUrl: '/projects/data-sanitization.jpg',
};

function renderRow(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/servicios']}>
      <LanguageProvider>
        <ProjectRow project={mockProject} {...props} />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('ProjectRow Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock HTMLMediaElement methods in jsdom
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it('renders project metadata, client, title, stack tags and action button', () => {
    renderRow();

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('Grupo Financiero & Servicios Corporativos')).toBeInTheDocument();
    expect(screen.getByText('Saneamiento y Auditoría Forense de Base de Datos de 18M Registros')).toBeInTheDocument();
    expect(screen.getByText('[INM-CAT-2026.01]')).toBeInTheDocument();
    expect(screen.getByText('[POSTGRESQL]')).toBeInTheDocument();
    expect(screen.getByText('18.4M')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver ficha técnica de/i })).toBeInTheDocument();
  });

  it('renders video element stopped at start with valid poster and no autoPlay', () => {
    const { container } = renderRow();

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/presencia_web_showcase.mp4');
    expect(video).toHaveAttribute('poster', '/projects/video_showcase_frame0.jpg');
    expect(video).toHaveAttribute('preload', 'auto');
    expect(video).not.toHaveAttribute('autoplay');
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute('loop');
  });

  it('calls video.play on mouseEnter (hover) and video.pause on mouseLeave', () => {
    const { container } = renderRow();
    const mediaContainer = container.querySelector('.project-index-col-media');
    const video = container.querySelector('video');

    expect(video).toBeInTheDocument();

    // Hover in -> play
    fireEvent.mouseEnter(mediaContainer);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();

    // Hover out -> pause
    fireEvent.mouseLeave(mediaContainer);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('toggles video playback on media click and keyboard Enter/Space', () => {
    const { container } = renderRow();
    const mediaContainer = container.querySelector('.project-index-col-media');
    const video = container.querySelector('video');

    Object.defineProperty(video, 'paused', {
      writable: true,
      value: true,
    });

    // Click to play
    fireEvent.click(mediaContainer);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();

    // When playing, click to pause
    video.paused = false;
    fireEvent.click(mediaContainer);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();

    // Keyboard Space to toggle
    video.paused = true;
    fireEvent.keyDown(mediaContainer, { key: ' ' });
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('calls onOpenSpec when clicking the action button', () => {
    const onOpenSpec = vi.fn();
    renderRow({ onOpenSpec });

    const btn = screen.getByRole('button', { name: /Ver ficha técnica de/i });
    fireEvent.click(btn);

    expect(onOpenSpec).toHaveBeenCalledTimes(1);
    expect(onOpenSpec).toHaveBeenCalledWith(mockProject);
  });

  it('displays fallback static poster cleanly when video triggers error', () => {
    const { container } = renderRow();
    const video = container.querySelector('video');

    // Simulate error event on video
    fireEvent.error(video);

    // Video should be replaced by fallback static image
    const fallbackImg = container.querySelector('.project-media-poster-static');
    expect(fallbackImg).toBeInTheDocument();
    expect(fallbackImg).toHaveAttribute('src', '/projects/video_showcase_frame0.jpg');
  });
});
