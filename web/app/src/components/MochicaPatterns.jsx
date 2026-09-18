import { useMemo } from 'react';

/**
 * Mochica Pattern Segment Generators
 * Generates exact vector path segments for the 10 Mochica visual principles.
 */

// 1. Línea escalonada (Stepped huaca notch)
export function renderSteppedSegment(x, y, w = 40, h = 16, color = 'currentColor', strokeWidth = 1.5) {
  const halfH = h / 2;
  const quarterW = w / 4;
  return (
    <path
      key={`stepped-${x}-${y}`}
      d={`M ${x} ${y + halfH} h ${quarterW} v ${-halfH} h ${quarterW * 2} v ${halfH} h ${quarterW}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeLinecap="square"
    />
  );
}

// 2. Greca escalonada (Orthogonal labyrinth/signo escalonado)
export function renderGrecaSegment(x, y, w = 40, h = 16, color = 'currentColor', strokeWidth = 1.5) {
  const stepX = w / 6;
  const stepY = h / 3;
  return (
    <path
      key={`greca-${x}-${y}`}
      d={`M ${x} ${y + h} H ${x + stepX * 2} V ${y + stepY} H ${x + stepX * 4} V ${y + stepY * 2} H ${x + stepX * 3} V ${y + h} H ${x + w}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeLinecap="square"
    />
  );
}

// 3. Línea ondulante & serpenteante (Continuous sinusoidal wave)
export function renderWaveSegment(x, y, w = 40, h = 16, color = 'currentColor', strokeWidth = 1.5) {
  const halfW = w / 2;
  const amp = h / 2;
  const midY = y + amp;
  return (
    <path
      key={`wave-${x}-${y}`}
      d={`M ${x} ${midY} C ${x + halfW / 2} ${midY - amp}, ${x + halfW / 2} ${midY + amp}, ${x + halfW} ${midY} C ${x + halfW + halfW / 2} ${midY - amp}, ${x + halfW + halfW / 2} ${midY + amp}, ${x + w} ${midY}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
}

// 4. Línea dentada / quebrada (Pre-Columbian serrated peaks and zig-zags)
export function renderDentatedSegment(x, y, w = 40, h = 16, color = 'currentColor', strokeWidth = 1.5) {
  const peakCount = 4;
  const segmentW = w / peakCount;
  let d = `M ${x} ${y + h}`;
  for (let i = 0; i < peakCount; i++) {
    const startX = x + i * segmentW;
    const midX = startX + segmentW / 2;
    const endX = startX + segmentW;
    d += ` L ${midX} ${y} L ${endX} ${y + h}`;
  }
  return (
    <path
      key={`dentated-${x}-${y}`}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeLinecap="square"
    />
  );
}

// 5. Rombo escalonado ceremonial con medallón solar (Banda geométrica modular)
export function renderRhombusSegment(x, y, w = 40, h = 16, color = 'currentColor', strokeWidth = 1.5) {
  const midX = x + w / 2;
  const midY = y + h / 2;
  const rx = w / 2 - 2;
  const ry = h / 2 - 1;
  return (
    <g key={`rhombus-${x}-${y}`}>
      <path
        d={`M ${midX} ${midY - ry} L ${midX + rx} ${midY} L ${midX} ${midY + ry} L ${midX - rx} ${midY} Z`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <rect
        x={midX - 2.5}
        y={midY - 2.5}
        width={5}
        height={5}
        fill={color}
        transform={`rotate(45 ${midX} ${midY})`}
      />
    </g>
  );
}

// 6. Volutas & espirales orgánicas (Spirals & aquatic curls)
export function renderVoluteSegment(x, y, w = 40, h = 16, color = 'currentColor', strokeWidth = 1.5) {
  const midX = x + w / 2;
  const midY = y + h / 2;
  return (
    <g key={`volute-${x}-${y}`}>
      <path
        d={`M ${x} ${midY} Q ${midX - 4} ${y}, ${midX} ${midY} T ${x + w} ${midY}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <circle cx={midX} cy={midY} r={2} fill={color} />
    </g>
  );
}

const PATTERN_TYPES = ['stepped', 'greca', 'wave', 'dentated', 'rhombus', 'volute'];

/**
 * Pseudo-random deterministic generator based on string or index seed
 */
function getPseudoRandomSequence(count, seed = 42) {
  const sequence = [];
  let s = typeof seed === 'string' ? seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    const typeIndex = Math.floor(rnd * PATTERN_TYPES.length);
    sequence.push(PATTERN_TYPES[typeIndex]);
  }
  return sequence;
}

/**
 * MochicaDivider
 * Procedural continuous border / line divider formed by pseudo-random Mochica geometric segments.
 */
export function MochicaDivider({
  color = 'var(--border)',
  height = 18,
  segmentWidth = 44,
  strokeWidth = 1.5,
  seed = 'inmerge-mochica',
  style = {},
  className = '',
  opacity = 0.85,
  showBaseline = false,
}) {
  const segmentCount = 36;
  const totalWidth = segmentCount * segmentWidth;

  const sequence = useMemo(() => getPseudoRandomSequence(segmentCount, seed), [segmentCount, seed]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        width: '100%',
        overflow: 'hidden',
        lineHeight: 0,
        opacity,
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        style={{ width: '100%', height, minWidth: totalWidth, flexShrink: 0 }}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {showBaseline && (
          <line
            x1="0"
            y1={height - 1}
            x2={totalWidth}
            y2={height - 1}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity="0.5"
          />
        )}
        {sequence.map((type, idx) => {
          const x = idx * segmentWidth;
          const y = 1;
          const usableH = height - 2;

          switch (type) {
            case 'stepped':
              return renderSteppedSegment(x, y, segmentWidth, usableH, color, strokeWidth);
            case 'greca':
              return renderGrecaSegment(x, y, segmentWidth, usableH, color, strokeWidth);
            case 'wave':
              return renderWaveSegment(x, y, segmentWidth, usableH, color, strokeWidth);
            case 'dentated':
              return renderDentatedSegment(x, y, segmentWidth, usableH, color, strokeWidth);
            case 'rhombus':
              return renderRhombusSegment(x, y, segmentWidth, usableH, color, strokeWidth);
            case 'volute':
              return renderVoluteSegment(x, y, segmentWidth, usableH, color, strokeWidth);
            default:
              return renderSteppedSegment(x, y, segmentWidth, usableH, color, strokeWidth);
          }
        })}
      </svg>
    </div>
  );
}

/**
 * MochicaCornerFrame
 * Wraps content with 4 authentic Mochica stepped or greca corner brackets.
 */
export function MochicaCornerFrame({
  children,
  cornerSize = 20,
  color = 'var(--gold)',
  variant = 'stepped', // 'stepped' | 'greca' | 'rhombus'
  style = {},
  className = '',
}) {
  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      {/* Top-Left Corner */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          top: -2,
          left: -2,
          width: cornerSize,
          height: cornerSize,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {variant === 'stepped' ? (
          <path d="M0 16 V8 H8 V0 H24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" />
        ) : (
          <path d="M0 20 V4 H20 V12 H8 V20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" />
        )}
      </svg>

      {/* Top-Right Corner */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: cornerSize,
          height: cornerSize,
          pointerEvents: 'none',
          transform: 'scaleX(-1)',
          zIndex: 2,
        }}
      >
        {variant === 'stepped' ? (
          <path d="M0 16 V8 H8 V0 H24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" />
        ) : (
          <path d="M0 20 V4 H20 V12 H8 V20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" />
        )}
      </svg>

      {/* Bottom-Left Corner */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          bottom: -2,
          left: -2,
          width: cornerSize,
          height: cornerSize,
          pointerEvents: 'none',
          transform: 'scaleY(-1)',
          zIndex: 2,
        }}
      >
        {variant === 'stepped' ? (
          <path d="M0 16 V8 H8 V0 H24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" />
        ) : (
          <path d="M0 20 V4 H20 V12 H8 V20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" />
        )}
      </svg>

      {/* Bottom-Right Corner */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: cornerSize,
          height: cornerSize,
          pointerEvents: 'none',
          transform: 'scale(-1, -1)',
          zIndex: 2,
        }}
      >
        {variant === 'stepped' ? (
          <path d="M0 16 V8 H8 V0 H24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" />
        ) : (
          <path d="M0 20 V4 H20 V12 H8 V20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" />
        )}
      </svg>

      {children}
    </div>
  );
}

/**
 * MochicaWatermark
 * Subtle pre-Columbian geometric background watermark for editorial hero sections and callouts.
 */
export function MochicaWatermark({
  size = 280,
  color = 'var(--gold)',
  opacity = 0.05,
  variant = 'stepped-pyramid',
  style = {},
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        opacity,
        zIndex: 0,
        ...style,
      }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        {variant === 'stepped-pyramid' ? (
          <>
            <path
              d="M20 180 H180 V150 H160 V120 H140 V90 H120 V60 H80 V90 H60 V120 H40 V150 H20 V180 Z"
              stroke={color}
              strokeWidth="3"
            />
            <path
              d="M50 180 H150 V155 H130 V125 H110 V95 H90 V125 H70 V155 H50 V180 Z"
              stroke={color}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <rect x="90" y="30" width="20" height="20" fill={color} opacity="0.3" transform="rotate(45 100 40)" />
          </>
        ) : (
          <>
            <path d="M100 15 L185 100 L100 185 L15 100 Z" stroke={color} strokeWidth="3" />
            <path d="M100 45 L155 100 L100 155 L45 100 Z" stroke={color} strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="100" cy="100" r="14" stroke={color} strokeWidth="2" />
            <rect x="94" y="94" width="12" height="12" fill={color} />
          </>
        )}
      </svg>
    </div>
  );
}

export default MochicaDivider;
