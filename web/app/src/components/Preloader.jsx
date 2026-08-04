export default function Preloader({ done }) {
  return (
    <div
      className="preloader-overlay"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: done ? 0 : 1,
        pointerEvents: done ? 'none' : 'auto',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ position: 'absolute', top: -58, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '16px solid var(--gold)',
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '16px solid var(--terracotta)',
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '16px solid var(--gold)',
            }}
          />
        </div>
        <div
          className="preloader-mark"
          style={{
            width: 180,
            height: 180,
            background: 'var(--terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 132,
              height: 132,
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(-45deg)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 52 }}>
                <div className="preloader-bar" style={{ width: 9, height: 20, background: 'var(--terracotta)', animationDelay: '0s' }} />
                <div className="preloader-bar" style={{ width: 9, height: 34, background: 'var(--gold)', animationDelay: '0.15s' }} />
                <div className="preloader-bar" style={{ width: 9, height: 24, background: 'var(--ink)', animationDelay: '0.3s' }} />
                <div className="preloader-bar" style={{ width: 9, height: 46, background: 'var(--ochre)', animationDelay: '0.45s' }} />
                <div className="preloader-bar" style={{ width: 9, height: 30, background: 'var(--terracotta)', animationDelay: '0.6s' }} />
              </div>
              <div style={{ width: 66, height: 2, background: 'var(--ink)' }} />
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: -58, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '16px solid var(--terracotta)',
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '16px solid var(--gold)',
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '16px solid var(--terracotta)',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: 'var(--gold)', fontWeight: 600 }}>INMERGE</div>
          <div className="preloader-dot" style={{ width: 5, height: 5, background: 'var(--gold)', borderRadius: '50%' }} />
          <div
            className="preloader-dot"
            style={{ width: 5, height: 5, background: 'var(--gold)', borderRadius: '50%', animationDelay: '0.2s' }}
          />
          <div
            className="preloader-dot"
            style={{ width: 5, height: 5, background: 'var(--gold)', borderRadius: '50%', animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  );
}
