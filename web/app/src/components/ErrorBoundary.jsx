import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Inmerge ErrorBoundary capturó una excepción:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            maxWidth: 640,
            margin: '64px auto',
            padding: '32px 24px',
            background: 'var(--cream2)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            textAlign: 'center',
          }}
          role="alert"
        >
          <div
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 24,
              fontWeight: 600,
              color: 'var(--terracotta)',
              marginBottom: 12,
            }}
          >
            Interrupción Temporal del Módulo
          </div>
          <p
            style={{
              fontSize: 15,
              color: 'var(--muted)',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Ocurrió un error inesperado al renderizar esta sección. El resto de la plataforma continúa funcionando con normalidad.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-accent"
              style={{
                background: 'var(--terracotta)',
                color: '#f3eada',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 2,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              Reintentar
            </button>
            <a
              href="/"
              className="btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 20px',
                border: '1px solid var(--ink)',
                color: 'var(--ink)',
                borderRadius: 2,
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              Ir al Inicio
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
