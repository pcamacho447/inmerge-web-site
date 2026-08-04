// Stands in for a real report cover image (none exist yet). Carries role="img" +
// aria-label so it's announced to assistive tech the same way a finished <img alt="...">
// would be, instead of being read as plain decorative text. Swap for a real <img> with
// this same label as alt text once cover photography/design exists.
export default function ImagePlaceholder({ label }) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--cream2)',
        backgroundImage: 'repeating-linear-gradient(135deg, var(--border) 0 2px, transparent 2px 14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border)',
        borderRadius: 4,
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
        {label}
      </span>
    </div>
  );
}
