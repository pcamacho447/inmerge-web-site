const COUNT = 16;

export default function Frieze({ bg = '#241A12', border, upColor, downColor, medallionBg, medallionBorder, flip = false }) {
  const units = Array.from({ length: COUNT }, (_, i) => {
    const isMedallion = i % 6 === 3;
    const isUp = flip ? i % 2 !== 0 : i % 2 === 0;
    return { isMedallion, isUp };
  });

  return (
    <div
      aria-hidden="true"
      style={{ background: bg, borderTop: `4px solid ${border}`, borderBottom: `4px solid ${border}`, display: 'flex' }}
    >
      {units.map((u, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>
          {u.isMedallion ? (
            <div
              style={{
                width: 16,
                height: 16,
                background: medallionBg,
                border: `2px solid ${medallionBorder}`,
                transform: 'rotate(45deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 5, height: 5, background: medallionBorder, borderRadius: '50%', transform: 'rotate(-45deg)' }} />
            </div>
          ) : u.isUp ? (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderBottom: `22px solid ${upColor}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderTop: `22px solid ${downColor}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
