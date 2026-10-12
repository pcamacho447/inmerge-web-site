import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { waLink } from '../data/content.js';

export default function ServicesTailoredCTA({ onOpenAssistant }) {
  const { isEn } = useLanguage();

  const customWaUrl = `${waLink}?text=${encodeURIComponent(
    isEn
      ? 'Hello Inmerge, I would like to schedule a technical architecture assessment.'
      : 'Hola Inmerge, deseo agendar una evaluación de arquitectura técnica y auditoría.',
  )}`;

  return (
    <section className="services-tailored-cta-section" aria-labelledby="tailored-cta-title">
      <div className="tailored-cta-card">
        <div className="tailored-cta-header">
          <span className="tailored-cta-badge">{isEn ? '[ BESPOKE ARCHITECTURE & AUDIT ]' : '[ ARQUITECTURA & AUDITORÍA A MEDIDA ]'}</span>
          <h2 id="tailored-cta-title" className="tailored-cta-title">
            {isEn ? 'Looking for a custom architecture or technical audit?' : '¿Busca una arquitectura o auditoría técnica a medida?'}
          </h2>
          <p className="tailored-cta-desc">
            {isEn
              ? 'Define your technical scope. Our engineering team will structure an audited SOW proposal, timeline, and investment baseline in less than 24 business hours.'
              : 'Describa el alcance de su desafío tecnológico. Nuestro equipo directivo le entregará un Término de Referencia (TDR), cronograma y estimación presupuestal en menos de 24 horas hábiles.'}
          </p>
        </div>

        <div className="tailored-cta-actions">
          <Link to={isEn ? '/en/contact' : '/contacto'} className="btn-accent tailored-btn">
            {isEn ? 'Configure Technical SOW →' : 'Configurar TDR Técnico →'}
          </Link>

          <button type="button" className="btn-outline tailored-btn" onClick={() => onOpenAssistant?.()}>
            {isEn ? 'Consult with Alaec (AI) →' : 'Consultar con Asistente IA (Alaec) →'}
          </button>

          <a href={customWaUrl} target="_blank" rel="noopener noreferrer" className="tailored-whatsapp-link">
            {isEn ? 'Direct WhatsApp Advisory ↗' : 'Asesoría Directa por WhatsApp ↗'}
          </a>
        </div>
      </div>
    </section>
  );
}
