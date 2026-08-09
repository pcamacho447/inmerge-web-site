// La cifra clave: un número grande en Spectral con su explicación debajo.
// Es la expresión más directa de "cada cifra, con su fuente a la vista", y la
// pieza principal de la página de reporte.
//
// Devuelve null si no hay cifra. Ningún reporte queda roto por no tenerla —
// la sección simplemente no se renderiza.
export default function KeyFigure({ figure, label }) {
  if (!figure) return null;
  return (
    <div style={{ borderTop: '2px solid var(--gold)', paddingTop: 28, marginBottom: 48 }}>
      <div
        style={{
          fontFamily: "'Spectral',serif",
          fontWeight: 700,
          fontSize: 'clamp(56px,11vw,104px)',
          lineHeight: 1,
          color: 'var(--terracotta)',
          marginBottom: 16,
        }}
      >
        {figure}
      </div>
      {label && <div style={{ fontSize: 'clamp(16px,2.2vw,20px)', lineHeight: 1.5, color: 'var(--ink)', maxWidth: '46ch' }}>{label}</div>}
    </div>
  );
}
