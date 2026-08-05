import { useState } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import useDocumentHead from '../hooks/useDocumentHead.js';
import Frieze from '../components/Frieze.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import { useAuth, isSubscriptionActive } from '../lib/auth.jsx';
import usePlans from '../hooks/usePlans.js';
import useReports from '../hooks/useReports.js';
import { formatPEN } from '../lib/formatPEN.js';

export default function Planes() {
  useReveal();
  useDocumentHead({
    title: 'Planes y Precios — Inmerge',
    description: 'Suscríbete a los reportes premium de Inmerge, o compra reportes individuales sin suscripción.',
    path: '/planes',
  });
  const { user } = useAuth();
  const { plans } = usePlans();
  const { reports } = useReports();
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const isActiveSubscriber = isSubscriptionActive(user?.subscription);

  // "desde S/ X" sale del mínimo real de la BD, que es lo que el trigger de
  // pedidos va a cobrar. Un número hardcodeado acá podría discrepar.
  const premiumPrices = reports.filter((r) => r.tier === 'premium' && r.price_pen).map((r) => Number(r.price_pen));
  const desdePrecio = premiumPrices.length ? Math.min(...premiumPrices) : null;

  return (
    <>
      <div style={{ padding: '100px clamp(20px,5vw,40px) 60px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 24 }}>
          PLANES Y PRECIOS
        </div>
        <div
          style={{
            fontFamily: "'Spectral',serif",
            fontWeight: 700,
            fontSize: 'clamp(40px,7vw,84px)',
            lineHeight: 1,
            letterSpacing: -1,
            maxWidth: 900,
          }}
        >
          El mismo método, más profundidad.
        </div>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 600, lineHeight: 1.7, marginTop: 28 }}>
          Los reportes públicos siguen siendo gratuitos. La suscripción premium suma series de seguimiento y análisis más granulares — o
          compra un reporte premium suelto, sin comprometerte a nada recurrente.
        </p>
      </div>

      <Frieze border="#A8472B" upColor="#D8A84E" downColor="#C68A3D" medallionBg="#A8472B" medallionBorder="#F3EADA" />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px clamp(20px,5vw,40px) 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32 }}>
          <div
            data-reveal=""
            className="card-hover"
            style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 40, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>GRATIS</div>
            <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 40, marginBottom: 4 }}>S/ 0</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>Sin cuenta necesaria</div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 32,
                flex: 1,
              }}
            >
              {['Reportes públicos completos', 'Análisis narrativos de datos peruanos', 'Sin límite de descargas'].map((f) => (
                <li key={f} style={{ fontSize: 14, color: 'var(--ink)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      background: 'var(--terracotta)',
                      transform: 'rotate(45deg)',
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/reportes"
              className="btn-outline-hover"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                textAlign: 'center',
                borderRadius: 3,
                padding: 14,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Ver reportes gratuitos
            </Link>
          </div>

          {plans.map((plan) => {
            const isCurrentPlan = isActiveSubscriber && user.subscription.plan === plan.id;
            return (
              <div
                key={plan.id}
                data-reveal=""
                className="card-hover"
                style={{
                  border: plan.badge ? '2px solid var(--terracotta)' : '1px solid var(--border)',
                  borderRadius: 4,
                  padding: 40,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: 40,
                      background: 'var(--terracotta)',
                      color: 'var(--bg)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      padding: '6px 14px',
                      borderRadius: 20,
                    }}
                  >
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 12 }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: "'Spectral',serif", fontWeight: 700, fontSize: 40, marginBottom: 4 }}>
                  S/ {formatPEN(plan.price_pen)}{' '}
                  <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--muted)' }}>/ {plan.period}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>{plan.description}</div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginBottom: 32,
                    flex: 1,
                  }}
                >
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, color: 'var(--ink)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          background: 'var(--terracotta)',
                          transform: 'rotate(45deg)',
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={isCurrentPlan}
                  onClick={() => setCheckoutPlan(plan)}
                  className={isCurrentPlan ? undefined : 'btn-hover'}
                  style={{
                    background: isCurrentPlan ? 'var(--border)' : 'var(--terracotta)',
                    color: isCurrentPlan ? 'var(--muted)' : 'var(--bg)',
                    textAlign: 'center',
                    borderRadius: 3,
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "'IBM Plex Sans',sans-serif",
                    cursor: isCurrentPlan ? 'default' : 'pointer',
                    border: 'none',
                  }}
                >
                  {isCurrentPlan ? 'Tu plan actual' : 'Suscribirme'}
                </button>
              </div>
            );
          })}
        </div>

        {desdePrecio !== null && (
          <div data-reveal="" style={{ textAlign: 'center', marginTop: 48, fontSize: 14, color: 'var(--muted)' }}>
            ¿Prefieres no suscribirte? Los reportes premium también se pueden comprar individualmente desde S/ {desdePrecio} en la{' '}
            <Link to="/reportes" className="link-hover" style={{ fontWeight: 600 }}>
              página de Reportes
            </Link>
            .
          </div>
        )}
      </div>

      <Frieze border="#D8A84E" upColor="#C68A3D" downColor="#A8472B" medallionBg="#D8A84E" medallionBorder="#241A12" />

      <Footer />

      {checkoutPlan && <CheckoutModal kind="subscription" item={checkoutPlan} onClose={() => setCheckoutPlan(null)} />}
    </>
  );
}
