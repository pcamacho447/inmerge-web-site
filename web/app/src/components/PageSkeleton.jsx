export default function PageSkeleton() {
  return (
    <div
      style={{
        maxWidth: 1160,
        margin: '0 auto',
        padding: '48px 24px 80px',
        minHeight: '60vh',
      }}
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido..."
    >
      {/* Header Tag Skeleton */}
      <div
        className="skeleton-box"
        style={{
          width: 140,
          height: 14,
          marginBottom: 16,
        }}
      />

      {/* Title Skeleton */}
      <div
        className="skeleton-box"
        style={{
          width: 'min(580px, 85%)',
          height: 40,
          marginBottom: 16,
          borderRadius: 2,
        }}
      />

      {/* Subtitle / Description Skeleton */}
      <div
        className="skeleton-box"
        style={{
          width: 'min(720px, 95%)',
          height: 18,
          marginBottom: 40,
          borderRadius: 2,
        }}
      />

      {/* Cards Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginTop: 32,
        }}
      >
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            style={{
              background: 'var(--cream2)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              minHeight: 200,
            }}
          >
            <div className="skeleton-box" style={{ width: 80, height: 12 }} />
            <div className="skeleton-box" style={{ width: '80%', height: 24 }} />
            <div className="skeleton-box" style={{ width: '100%', height: 14 }} />
            <div className="skeleton-box" style={{ width: '90%', height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
