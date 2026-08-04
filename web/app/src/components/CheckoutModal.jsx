import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOverlay from '../hooks/useOverlay.js';
import { useAuth } from '../lib/auth.jsx';
import { DEMO_MODE } from '../lib/demoMode.js';
import { createOrder, ORDER_METHODS } from '../lib/orders.js';
import { BANK_ACCOUNT, BILLING_ENTITY, VERIFICATION_SLA, YAPE_PLIN } from '../data/bankDetails.js';
import { waLink, waVoucherMessage } from '../data/content.js';

// `kind`: 'report' | 'subscription'. `item` es una fila de `reports` o de
// `plans`; ambas traen el precio en `price_pen`.
export default function CheckoutModal({ kind, item, onClose }) {
  const { user, subscribe, purchaseReport, refreshUser } = useAuth();
  const navigate = useNavigate();
  const modalRef = useOverlay(true, onClose);
  const [step, setStep] = useState('form'); // 'form' | 'instructions' | 'demo-success'
  const [method, setMethod] = useState(ORDER_METHODS.DEPOSIT);
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const price = item.price_pen;
  const periodSuffix = kind === 'subscription' ? ` / ${item.period}` : '';
  const title = kind === 'subscription' ? item.name : item.title;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      onClose();
      navigate('/registro', { state: { redirectTo: window.location.pathname } });
      return;
    }

    if (DEMO_MODE) {
      if (kind === 'subscription') subscribe(item.id);
      else purchaseReport(item.id);
      setStep('demo-success');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const created = await createOrder({ kind, itemId: item.id, method });
      setOrder(created);
      await refreshUser();
      setStep('instructions');
    } catch (err) {
      // Se queda en 'form' a propósito: nunca entregues datos bancarios por un
      // pedido que no quedó registrado.
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const labelStyle = { fontSize: 11, letterSpacing: 1.5, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 10 };
  const titleStyle = { fontFamily: "'Spectral',serif", fontWeight: 600, fontSize: 22, marginBottom: 6, lineHeight: 1.3 };
  const buttonStyle = {
    background: 'var(--terracotta)',
    color: 'var(--bg)',
    textAlign: 'center',
    borderRadius: 3,
    padding: 14,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans',sans-serif",
    cursor: 'pointer',
    width: '100%',
    border: 'none',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(36,26,18,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{
          background: 'var(--bg)',
          borderRadius: 4,
          maxWidth: 440,
          width: '100%',
          padding: 40,
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="icon-btn-hover"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        >
          <span style={{ position: 'relative', width: 14, height: 14 }}>
            <div style={{ width: 16, height: 2, background: 'var(--ink)', transform: 'rotate(45deg)', position: 'absolute', top: 6 }} />
            <div style={{ width: 16, height: 2, background: 'var(--ink)', transform: 'rotate(-45deg)', position: 'absolute', top: 6 }} />
          </span>
        </button>

        <div
          style={{
            background: 'var(--cream2)',
            borderRadius: 3,
            padding: '8px 12px',
            fontSize: 11,
            letterSpacing: 0.5,
            color: 'var(--muted)',
            marginBottom: 20,
          }}
        >
          {DEMO_MODE
            ? 'Vista previa de producto — este pago es una simulación, no se cobra nada.'
            : `Activación manual: verificamos tu depósito y habilitamos el acceso en ${VERIFICATION_SLA}.`}
        </div>

        {step === 'demo-success' && (
          <>
            <div style={{ width: 14, height: 14, background: 'var(--green)', transform: 'rotate(45deg)', marginBottom: 20 }} />
            <div style={titleStyle}>Listo (simulado).</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              {kind === 'subscription'
                ? `Tu cuenta de vista previa ahora tiene acceso premium (${item.name}).`
                : `"${item.title}" se agregó a tus reportes en esta vista previa.`}
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/cuenta');
              }}
              className="btn-hover"
              style={buttonStyle}
            >
              Ver mi cuenta
            </button>
          </>
        )}

        {step === 'instructions' && order && (
          <>
            <div style={labelStyle}>PEDIDO GENERADO</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 26, marginBottom: 6 }}>{order.code}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Deposita <strong style={{ color: 'var(--ink)' }}>S/ {order.amount_pen}</strong> y pon el código{' '}
              <strong style={{ color: 'var(--ink)' }}>{order.code}</strong> en el concepto. Es lo que nos permite reconocer tu pago.
            </div>

            {method === ORDER_METHODS.DEPOSIT ? (
              <dl style={{ margin: '0 0 24px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', fontSize: 13 }}>
                <dt style={{ color: 'var(--muted)' }}>Banco</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{BANK_ACCOUNT.bank}</dd>
                <dt style={{ color: 'var(--muted)' }}>Tipo</dt>
                <dd style={{ margin: 0 }}>{BANK_ACCOUNT.accountType}</dd>
                <dt style={{ color: 'var(--muted)' }}>Número</dt>
                <dd style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace" }}>{BANK_ACCOUNT.number}</dd>
                <dt style={{ color: 'var(--muted)' }}>CCI</dt>
                <dd style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace" }}>{BANK_ACCOUNT.cci}</dd>
                <dt style={{ color: 'var(--muted)' }}>Titular</dt>
                <dd style={{ margin: 0 }}>{BANK_ACCOUNT.holder}</dd>
              </dl>
            ) : (
              <dl style={{ margin: '0 0 24px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', fontSize: 13 }}>
                <dt style={{ color: 'var(--muted)' }}>Yape / Plin</dt>
                <dd style={{ margin: 0, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>{YAPE_PLIN.phone}</dd>
                <dt style={{ color: 'var(--muted)' }}>A nombre de</dt>
                <dd style={{ margin: 0 }}>{YAPE_PLIN.holder}</dd>
              </dl>
            )}

            {/* Aplica a los dos métodos: pagues por transferencia o por Yape, el
                comprobante lo emite la misma empresa. Va separado del titular de
                la cuenta porque no son la misma entidad. */}
            {BILLING_ENTITY.legalName && BILLING_ENTITY.taxId && (
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: 16,
                  marginBottom: 24,
                  fontSize: 12,
                  color: 'var(--muted)',
                  lineHeight: 1.6,
                }}
              >
                Facturamos como <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{BILLING_ENTITY.legalName}</strong> — RUC{' '}
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: 'var(--ink)' }}>{BILLING_ENTITY.taxId}</span>. Si necesitas
                factura, dinos al mandar la constancia.
              </div>
            )}

            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Ya depositaste? Mándanos la constancia por WhatsApp — el mensaje va listo con tu código, solo <strong>adjunta la foto</strong>
              .
            </div>
            <a
              href={waLink(waVoucherMessage(order))}
              target="_blank"
              rel="noreferrer"
              className="btn-hover"
              style={{ ...buttonStyle, display: 'block' }}
            >
              Enviar constancia por WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/cuenta');
              }}
              className="btn-outline-hover"
              style={{ ...buttonStyle, background: 'none', border: '1px solid var(--border)', color: 'var(--ink)', marginTop: 12 }}
            >
              Ver el estado en mi cuenta
            </button>
          </>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            <div style={labelStyle}>{kind === 'subscription' ? 'SUSCRIPCIÓN' : 'COMPRA DE REPORTE'}</div>
            <div style={titleStyle}>{title}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, color: 'var(--muted)', marginBottom: 24 }}>
              S/ {price}
              <span style={{ fontSize: 12 }}>{periodSuffix}</span>
            </div>

            {!user && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Necesitas una cuenta para continuar — te llevamos a registrarte.
              </div>
            )}

            {user && !DEMO_MODE && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Cómo vas a pagar</div>
                {[
                  { value: ORDER_METHODS.DEPOSIT, label: 'Depósito o transferencia bancaria' },
                  { value: ORDER_METHODS.YAPE_PLIN, label: 'Yape o Plin' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="row-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      marginBottom: 8,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="metodo"
                      value={option.value}
                      checked={method === option.value}
                      onChange={() => setMethod(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            )}

            {error && <div style={{ fontSize: 13, color: 'var(--terracotta)', marginBottom: 16, lineHeight: 1.6 }}>{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-hover"
              style={{ ...buttonStyle, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {!user
                ? 'Crear cuenta para continuar'
                : submitting
                  ? 'Generando pedido…'
                  : DEMO_MODE
                    ? 'Confirmar (simulado)'
                    : 'Generar pedido'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
