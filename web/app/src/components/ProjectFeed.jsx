import { useState } from 'react';
import ProjectRow from './ProjectRow.jsx';
import ProjectSocialProof from './ProjectSocialProof.jsx';
import ProjectSpecModal from './ProjectSpecModal.jsx';
import ServicesTailoredCTA from './ServicesTailoredCTA.jsx';
import { PROJECTS_DATA } from '../data/projectsData.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ProjectFeed({ projects = PROJECTS_DATA, onOpenAssistant }) {
  const { isEn } = useLanguage();
  const [selectedSpecProject, setSelectedSpecProject] = useState(null);

  if (!projects || projects.length === 0) return null;

  const handleOpenSpec = (project) => {
    setSelectedSpecProject(project);
  };

  const handleCloseSpec = () => {
    setSelectedSpecProject(null);
  };

  return (
    <section
      className="project-feed-section"
      aria-label={isEn ? 'Engineering Projects & Case Studies' : 'Portafolio de Proyectos e Ingeniería'}
    >
      {/* Editorial Header Banner */}
      <div className="project-feed-header-banner">
        <span className="feed-header-mono">
          {isEn ? '[ PROJECT PORTFOLIO & AUDITED INDEX ]' : '[ PORTAFOLIO DE PROYECTOS & ÍNDICE AUDITADO ]'}
        </span>
        <h2 className="feed-header-title">
          {isEn ? 'Featured Client Systems & Web Platforms' : 'Sistemas Empresariales & Plataformas Web Destacadas'}
        </h2>
        <p className="feed-header-subtitle">
          {isEn
            ? 'Explore our actual delivered web platforms, cloud architectures, and analytics systems built for global standards.'
            : 'Explora plataformas web reales, arquitecturas cloud y motores de analítica construidos bajo estándares internacionales.'}
        </p>
      </div>

      {/* Asymmetric Index Rows Container */}
      <div className="project-feed-rows-container">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} onOpenSpec={handleOpenSpec} />
        ))}
      </div>

      {/* Social Proof Section */}
      <ProjectSocialProof />

      {/* Tailored SOW & Closing CTA */}
      <ServicesTailoredCTA onOpenAssistant={onOpenAssistant} />

      {/* Technical Specification Pop-up Modal */}
      <ProjectSpecModal
        isOpen={Boolean(selectedSpecProject)}
        onClose={handleCloseSpec}
        project={selectedSpecProject}
        onOpenAssistant={onOpenAssistant}
      />
    </section>
  );
}
