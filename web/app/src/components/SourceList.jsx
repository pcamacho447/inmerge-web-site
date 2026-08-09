// Las fuentes, con enlace donde exista. Es lo que separa "confía en mí" de
// "compruébalo", así que una fuente sin enlace se muestra igual: el nombre
// siempre, el enlace cuando lo hay.
export default function SourceList({ sources }) {
  if (!Array.isArray(sources) || sources.length === 0) return null;
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 48 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.4, color: 'var(--muted)', marginBottom: 12 }}>FUENTES</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map((s, i) => (
          <li key={i} style={{ fontSize: 14, lineHeight: 1.6 }}>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-hover"
                style={{ color: 'var(--terracotta)', fontWeight: 500 }}
              >
                {s.nombre}
              </a>
            ) : (
              <span style={{ color: 'var(--ink)' }}>{s.nombre}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
