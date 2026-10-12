import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { waLink } from '../data/content.js';

export default function ProjectSpecModal({ isOpen, onClose, project, onOpenAssistant }) {
  const { lang, isEn } = useLanguage();
  const [currency, setCurrency] = useState('PEN');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const title = project.title?.[lang] || project.title?.es || '';
  const description = project.description?.[lang] || project.description?.es || project.summary?.[lang] || '';
  const specs = project.specs?.[lang] || project.specs?.es || [];
  const conditions = project.conditions?.[lang] || project.conditions?.es || [];
  const catNumber = project.catNumber || 'INM-CAT-2026.01';
  const timeline = project.duration?.[lang] || project.duration?.es || (isEn ? '~1 to 2 weeks' : '~1 a 2 semanas');

  const penPrice = project.penBase || 2400;
  const usdPrice = project.usdBase || 650;
  const priceFormatted = currency === 'PEN' ? `S/ ${penPrice.toLocaleString('es-PE')} PEN` : `$${usdPrice.toLocaleString('en-US')} USD`;

  // Pre-filled WhatsApp message
  const waMessage = isEn
    ? `Hello Inmerge, I would like to quote the solution [${catNumber}] ${title}.`
    : `Hola Inmerge, deseo cotizar la solución [${catNumber}] ${title}.`;
  const customWaUrl = `${waLink}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div
      className="spec-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-modal-title"
      aria-describedby="spec-modal-desc"
    >
      <div className="spec-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Monograph Header */}
        <div className="spec-modal-header">
          <span className="spec-modal-mono-cat">
            {catNumber} {'//'} {isEn ? 'TECHNICAL SPECIFICATION' : 'FICHA TÉCNICA'}
          </span>
          <button
            type="button"
            className="spec-modal-close-btn"
            onClick={onClose}
            aria-label={isEn ? 'Close technical sheet' : 'Cerrar ficha técnica'}
          >
            [ ESC / ✕ ]
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="spec-modal-body">
          <h2 id="spec-modal-title" className="spec-modal-title">
            {title}
          </h2>
          <p id="spec-modal-desc" className="spec-modal-description">
            {description}
          </p>

          {/* Technical Specifications */}
          <div className="spec-modal-section">
            <h3 className="spec-section-subtitle">
              <span className="spec-diamond" aria-hidden="true">
                ◆
              </span>{' '}
              {isEn ? 'TECHNICAL SPECIFICATIONS' : 'ESPECIFICACIONES TÉCNICAS'}
            </h3>
            <ul className="spec-items-list">
              {specs.map((item, idx) => (
                <li key={idx} className="spec-item-row">
                  <span className="spec-emdash" aria-hidden="true">
                    —
                  </span>
                  <span className="spec-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery & SLA Conditions */}
          <div className="spec-modal-section">
            <h3 className="spec-section-subtitle">
              <span className="spec-diamond" aria-hidden="true">
                ◆
              </span>{' '}
              {isEn ? 'DELIVERY & SLA CONDITIONS' : 'CONDICIONES DE ENTREGA & SLA'}
            </h3>
            <ul className="spec-items-list">
              {timeline && (
                <li className="spec-item-row">
                  <span className="spec-emdash" aria-hidden="true">
                    —
                  </span>
                  <span className="spec-text">
                    <strong>{isEn ? 'Estimated Timeline: ' : 'Plazo Estimado: '}</strong>
                    {timeline}
                  </span>
                </li>
              )}
              {conditions.map((item, idx) => (
                <li key={idx} className="spec-item-row">
                  <span className="spec-emdash" aria-hidden="true">
                    —
                  </span>
                  <span className="spec-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Baseline Investment Box */}
          <div className="spec-investment-panel">
            <div className="spec-investment-top">
              <span className="spec-investment-label">{isEn ? 'BASELINE INVESTMENT:' : 'INVERSIÓN BASE:'}</span>
              <div className="currency-pill-toggle" role="radiogroup" aria-label={isEn ? 'Currency' : 'Moneda'}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={currency === 'PEN'}
                  className={`currency-btn ${currency === 'PEN' ? 'is-active' : ''}`}
                  onClick={() => setCurrency('PEN')}
                >
                  PEN
                </button>
                <span className="currency-divider" aria-hidden="true">
                  |
                </span>
                <button
                  type="button"
                  role="radio"
                  aria-checked={currency === 'USD'}
                  className={`currency-btn ${currency === 'USD' ? 'is-active' : ''}`}
                  onClick={() => setCurrency('USD')}
                >
                  USD
                </button>
              </div>
            </div>

            <div className="spec-price-amount">{priceFormatted}</div>
            <p className="spec-price-subtext">
              {isEn ? 'Scope calibrated to milestone deliverables' : 'Alcance calibrado por hitos de entrega auditables'}
            </p>
          </div>

          {/* Direct Conversion Actions */}
          <div className="spec-modal-actions">
            <a href={customWaUrl} target="_blank" rel="noopener noreferrer" className="btn-accent spec-action-btn">
              {isEn ? 'Quote this Solution via WhatsApp ↗' : 'Cotizar esta Solución vía WhatsApp ↗'}
            </a>

            <button
              type="button"
              className="btn-outline spec-action-btn"
              onClick={() => {
                onClose();
                if (onOpenAssistant) {
                  onOpenAssistant({
                    context: `${isEn ? 'Solution' : 'Solución'}: ${title} (${catNumber})`,
                    project,
                  });
                }
              }}
            >
              {isEn ? 'Consult with Alaec (AI) →' : 'Consultar con Alaec (IA) →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
