import { useLanguage } from '../context/LanguageContext.jsx';

function MocheWallRelief({ pillarId, color = 'var(--terracotta)' }) {
  if (pillarId === 'auditoria') {
    // Relieve de pared escalonada con diamantes concéntricos de Chan Chan
    return (
      <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="moche-frieze-svg">
        <g stroke={color} strokeWidth="1.75" opacity="0.85">
          {/* Fila base de grecas escalonadas */}
          <path d="M10 110 H40 V90 H25 V75 H55 V55 H40 V40 H70 V60 H85 V75 H70 V90 H100 V110" fill={color} fillOpacity="0.05" />
          <path d="M140 110 H170 V90 H155 V75 H185 V55 H170 V40 H200 V60 H215 V75 H200 V90 H230 V110" fill={color} fillOpacity="0.05" />
          {/* Diamante central de pared ceremonial */}
          <path d="M120 20 L155 60 L120 100 L85 60 Z" strokeWidth="2" fill={color} fillOpacity="0.08" />
          <path d="M120 35 L140 60 L120 85 L100 60 Z" strokeDasharray="3 2" />
          <rect x="116" y="56" width="8" height="8" fill={color} transform="rotate(45 120 60)" />
          {/* Línea horizontal de friso inferior */}
          <line x1="10" y1="114" x2="230" y2="114" strokeWidth="2" strokeDasharray="6 3" />
        </g>
      </svg>
    );
  }

  if (pillarId === 'desarrollo') {
    // Relieve de pared con grecas entrelazadas y canales estructurales de Huaca del Sol
    return (
      <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="moche-frieze-svg">
        <g stroke={color} strokeWidth="1.75" opacity="0.85">
          {/* Doble greca laberíntica continua */}
          <path d="M15 105 H65 V70 H40 V45 H90 V20 H115 V45 H90 V70 H115 V95 H65" strokeWidth="2" fill={color} fillOpacity="0.06" />
          <path d="M225 105 H175 V70 H200 V45 H150 V20 H125 V45 H150 V70 H125 V95 H175" strokeWidth="2" fill={color} fillOpacity="0.06" />
          {/* Medallones esquineros de adobe */}
          <rect x="18" y="22" width="10" height="10" fill={color} opacity="0.5" transform="rotate(45 23 27)" />
          <rect x="212" y="22" width="10" height="10" fill={color} opacity="0.5" transform="rotate(45 217 27)" />
          <line x1="10" y1="114" x2="230" y2="114" strokeWidth="2" strokeDasharray="6 3" />
        </g>
      </svg>
    );
  }

  // Pilar 03: Datos & IA — Relieve de pared con celosía triangular y Chakana de Huaca de la Luna
  return (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="moche-frieze-svg">
      <g stroke={color} strokeWidth="1.75" opacity="0.85">
        {/* Celosía triangular rítmica */}
        <path d="M15 105 L45 40 L75 105 M75 105 L105 40 L135 105 M135 105 L165 40 L195 105 M195 105 L225 40" strokeWidth="2" />
        <path d="M45 40 L75 75 L105 40 M105 40 L135 75 L165 40 M165 40 L195 75 L225 40" strokeDasharray="3 2" />
        {/* Rombos flotantes en los vértices */}
        <rect x="41" y="22" width="8" height="8" fill={color} fillOpacity="0.6" transform="rotate(45 45 26)" />
        <rect x="101" y="22" width="8" height="8" fill={color} fillOpacity="0.6" transform="rotate(45 105 26)" />
        <rect x="161" y="22" width="8" height="8" fill={color} fillOpacity="0.6" transform="rotate(45 165 26)" />
        <line x1="10" y1="114" x2="230" y2="114" strokeWidth="2" strokeDasharray="6 3" />
      </g>
    </svg>
  );
}

export default function ServicePillarCard({ pillar }) {
  const { isEn } = useLanguage();

  const pillarColor = pillar.id === 'auditoria' ? 'var(--terracotta)' : pillar.id === 'desarrollo' ? 'var(--gold)' : 'var(--ochre)';

  return (
    <div
      style={{
        background: 'transparent',
        border: 'none',
        padding: '0 0 16px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="pillar-card-interactive"
    >
      <div>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            borderBottom: '1px solid var(--border)',
            paddingBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              color: pillarColor,
              letterSpacing: 2,
            }}
          >
            {isEn ? 'PILLAR' : 'PILAR'} {pillar.number}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            {pillar.badge}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h3
          style={{
            fontFamily: "'Spectral', serif",
            fontSize: 'clamp(24px, 2.5vw, 30px)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: 'var(--ink)',
            margin: '0 0 8px 0',
          }}
        >
          {pillar.title}
        </h3>

        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: pillarColor,
            marginBottom: 8,
          }}
        >
          {pillar.subtitle}
        </div>

        {/* Formas de pared Mochica */}
        <MocheWallRelief pillarId={pillar.id} color={pillarColor} />
      </div>
    </div>
  );
}
