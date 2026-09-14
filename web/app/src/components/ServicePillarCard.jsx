import { Link } from 'react-router-dom';
import { waLink } from '../data/content.js';

export default function ServicePillarCard({ pillar }) {
  const whatsappUrl = waLink(
    `Hola Inmerge, me interesa consultar sobre el pilar de ${pillar.title}. ¿Podemos agendar una reunión preliminar?`,
  );

  return (
    <div
      style={{
        background: 'var(--cream2)',
        border: '1px solid var(--border)',
        padding: 'clamp(28px, 4vw, 40px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease',
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
              color: 'var(--terracotta)',
              letterSpacing: 2,
            }}
          >
            PILAR {pillar.number}
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

        {/* Title & Tagline */}
        <h3
          style={{
            fontFamily: "'Spectral', serif",
            fontSize: 'clamp(24px, 3.2vw, 32px)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: 'var(--ink)',
            margin: '0 0 10px 0',
          }}
        >
          {pillar.title}
        </h3>

        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--terracotta)',
            marginBottom: 16,
          }}
        >
          {pillar.subtitle}
        </div>

        <p
          style={{
            color: 'var(--muted)',
            fontSize: 15,
            lineHeight: 1.65,
            margin: '0 0 24px 0',
          }}
        >
          {pillar.desc}
        </p>
      </div>

      {/* Action CTA */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginTop: 20,
          borderTop: '1px solid var(--border)',
          paddingTop: 20,
        }}
      >
        <Link
          to={`/servicios#${pillar.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--ink)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--ink)',
            paddingBottom: 2,
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
          className="hover-underline-link"
        >
          <span>Ver servicios detallados</span>
          <span aria-hidden="true">→</span>
        </Link>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--terracotta)',
            color: '#F3EADA',
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 14px',
            textDecoration: 'none',
            transition: 'opacity 0.2s ease',
          }}
          className="btn-accent"
        >
          <span>Consultar</span>
        </a>
      </div>
    </div>
  );
}
