import { useState } from 'react';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Footer from '../components/Footer.jsx';
import QuickEstimator from '../components/QuickEstimator.jsx';
import LLMAssistantModal from '../components/LLMAssistantModal.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Servicios() {
  useReveal();
  const { isEn } = useLanguage();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantContext, setAssistantContext] = useState(null);

  const handleOpenAssistant = (ctx = null) => {
    setAssistantContext(ctx);
    setIsAssistantOpen(true);
  };

  useDocumentHead({
    title: isEn ? 'Services — Inmerge · Auditing, Cloud Development & Data Science' : 'Servicios — Inmerge · Auditoría, Desarrollo & Datos',
    description: isEn
      ? 'Specialized engineering solutions in Technical Auditing, Cloud Systems Architecture (AWS), and Applied Data Science with Machine Learning.'
      : 'Soluciones especializadas en Auditoría Técnica, Desarrollo de Software en la Nube (AWS) y Ciencia de Datos con Machine Learning.',
    path: isEn ? '/en/services' : '/servicios',
  });

  return (
    <>
      {/* Full-Canvas Curatorial Pavilion — Monumental Horizontal Exhibition */}
      <div className="services-curatorial-canvas">
        <QuickEstimator initialPillar="web_pages" onOpenLLMAssistant={(ctx) => handleOpenAssistant(ctx)} />
      </div>

      {/* Floating AI Assistant Trigger Button — Alaec */}
      <button
        type="button"
        className="floating-assistant-btn"
        onClick={() => handleOpenAssistant()}
        aria-label={isEn ? 'Open Alaec AI Assistant' : 'Abrir Asistente IA Alaec'}
      >
        <span className="alaec-pulse-dot" aria-hidden="true" />
        <span className="alaec-trigger-name">Alaec</span>
        <span className="alaec-trigger-badge">AI</span>
      </button>

      {/* Interactive LLM Assistant Modal */}
      <LLMAssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} initialContext={assistantContext} />

      <Footer />
    </>
  );
}
