export default function Footer({ borderTop = false }) {
  return (
    <footer
      style={{
        padding: '48px clamp(20px,5vw,40px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        maxWidth: 1240,
        margin: '0 auto',
        borderTop: borderTop ? '1px solid var(--border)' : undefined,
      }}
    >
      <div style={{ fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 14, letterSpacing: 1 }}>INMERGE — 2026</div>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>inmerge3@gmail.com · Lima, Perú</div>
    </footer>
  );
}
