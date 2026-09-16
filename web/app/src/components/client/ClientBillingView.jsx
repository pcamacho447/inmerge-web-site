import { useState, useEffect } from 'react';
import { INMERGE_BANK_ACCOUNTS, ORDER_STATUS_CONFIG, uploadOrderVoucher } from '../../lib/billing.js';
import { formatPEN } from '../../lib/formatPEN.js';

export default function ClientBillingView({ organization, orders, loading, saving, onSaveOrganization, user }) {
  const [form, setForm] = useState({
    billingType: 'ruc',
    legalName: '',
    taxId: '',
    billingEmail: user?.email || '',
    billingAddress: '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (organization && !isDirty) {
      setForm({
        billingType: organization.billing_type || 'ruc',
        legalName: organization.legal_name || '',
        taxId: organization.tax_id || '',
        billingEmail: organization.billing_email || user?.email || '',
        billingAddress: organization.billing_address || '',
      });
    }
  }, [organization, user, isDirty]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSaveOrganization(form);
    setIsDirty(false);
  };

  const handleCopy = (text, idx) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedIndex(idx);
          setTimeout(() => setCopiedIndex(null), 2500);
        })
        .catch(() => {
          // Fallback silencioso si el portapapeles está restringido
        });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* 1. Cuentas Bancarias Oficiales (Transferencias Exclusivas) */}
      <div
        style={{
          background: 'var(--cream2)',
          borderRadius: 8,
          padding: '24px clamp(16px, 4vw, 28px)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>🏦</span>
          <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: 0, fontWeight: 700 }}>
            Cuentas Bancarias Oficiales para Transferencias
          </h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
          Inmerge procesa pagos exclusivamente mediante <strong>Transferencia Bancaria Directa</strong> a nuestras cuentas corrientes
          empresariales en moneda nacional (PEN).
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {INMERGE_BANK_ACCOUNTS.map((acc, idx) => (
            <div
              key={acc.bank}
              style={{
                background: '#fff',
                padding: '16px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 2 }}>{acc.bank}</div>
                <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--terracotta)', marginBottom: 10 }}>
                  {acc.accountType}
                </div>

                <div style={{ fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--muted)' }}>Cta: </span>
                  <strong style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{acc.accountNumber}</strong>
                </div>
                <div style={{ fontSize: 12, marginBottom: 10 }}>
                  <span style={{ color: 'var(--muted)' }}>CCI: </span>
                  <strong style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{acc.cci}</strong>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Titular: <strong>{acc.holder}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(acc.cci, idx)}
                style={{
                  marginTop: 14,
                  background: copiedIndex === idx ? 'rgba(46,117,89,0.15)' : 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: copiedIndex === idx ? '#2E7559' : 'var(--ink)',
                  borderRadius: 4,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {copiedIndex === idx ? '✓ CCI Copiado al portapapeles' : '📋 Copiar CCI Interbancario'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Formulario de Datos Fiscales de la Organización */}
      <div
        style={{
          background: 'var(--cream2)',
          borderRadius: 8,
          padding: '24px clamp(16px, 4vw, 28px)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>🏢</span>
          <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: 0, fontWeight: 700 }}>
            Datos Fiscales & Razón Social para Facturación
          </h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px' }}>
          Configura los datos fiscales para la emisión de Facturas o Boletas electrónicas correspondientes a tus proyectos.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                Tipo de Comprobante *
              </label>
              <select
                value={form.billingType}
                onChange={(e) => {
                  setIsDirty(true);
                  setForm({ ...form, billingType: e.target.value });
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: '#fff',
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                <option value="ruc">Factura Electrónica (con RUC)</option>
                <option value="dni">Boleta de Venta (con DNI)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                {form.billingType === 'ruc' ? 'RUC (11 dígitos) *' : 'DNI / Documento *'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={form.billingType === 'ruc' ? 11 : 12}
                value={form.taxId}
                onChange={(e) => {
                  setIsDirty(true);
                  const maxLen = form.billingType === 'ruc' ? 11 : 12;
                  const sanitized = e.target.value.replace(/\D/g, '').slice(0, maxLen);
                  setForm({ ...form, taxId: sanitized });
                }}
                placeholder={form.billingType === 'ruc' ? '20XXXXXXXXX' : 'XXXXXXXX'}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                Razón Social / Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={form.legalName}
                onChange={(e) => {
                  setIsDirty(true);
                  setForm({ ...form, legalName: e.target.value });
                }}
                placeholder="e.g. Inversiones & Tecnología del Perú S.A.C."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                Correo Electrónico de Facturación *
              </label>
              <input
                type="email"
                required
                value={form.billingEmail}
                onChange={(e) => {
                  setIsDirty(true);
                  setForm({ ...form, billingEmail: e.target.value });
                }}
                placeholder="finanzas@empresa.pe"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
              Dirección Fiscal (Opcional)
            </label>
            <input
              type="text"
              value={form.billingAddress}
              onChange={(e) => {
                setIsDirty(true);
                setForm({ ...form, billingAddress: e.target.value });
              }}
              placeholder="Av. Javier Prado Este 1234, San Isidro, Lima"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="btn-accent"
              style={{
                background: 'var(--terracotta)',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
              }}
            >
              {saving ? 'Guardando datos...' : 'Guardar Información Fiscal'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Historial de Órdenes de Servicio */}
      <div
        style={{
          background: 'var(--cream2)',
          borderRadius: 8,
          padding: '24px clamp(16px, 4vw, 28px)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: 0, fontWeight: 700 }}>
            Historial de Órdenes de Servicio ({orders.length})
          </h3>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              padding: 24,
              background: '#fff',
              borderRadius: 6,
              border: '1px dashed var(--border)',
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: 13,
            }}
          >
            No tienes órdenes de servicio registradas. Al acordar una propuesta técnica o hito, se generará tu orden con el código
            correlativo de pago.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((ord) => {
              const cfg = ORDER_STATUS_CONFIG[ord.status] || ORDER_STATUS_CONFIG.pending;

              return (
                <div
                  key={ord.id}
                  style={{
                    background: '#fff',
                    borderRadius: 6,
                    padding: '16px 20px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          fontWeight: 700,
                        }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
                        {ord.code}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
                      {ord.plan || 'Servicio de Consultoría de Ingeniería'}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      Medio de Pago: <strong>Transferencia Bancaria Directa</strong>
                      {ord.notes && <span> • {ord.notes}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 700, color: 'var(--terracotta)' }}>
                        S/ {formatPEN(ord.amount_pen)}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {new Date(ord.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          localeMatcher: 'best fit',
                        })}
                      </div>
                    </div>

                    {/* Gestión de Comprobante / Voucher Bancario */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ord.voucher_status === 'uploaded' ? (
                        <span
                          style={{
                            fontSize: 11,
                            background: 'rgba(216, 168, 78, 0.15)',
                            color: 'var(--gold, #C68A3D)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontWeight: 600,
                            border: '1px solid rgba(216, 168, 78, 0.3)',
                          }}
                        >
                          ⏳ Voucher en Revisión
                        </span>
                      ) : ord.voucher_status === 'verified' ? (
                        <span
                          style={{
                            fontSize: 11,
                            background: 'rgba(74, 156, 106, 0.12)',
                            color: 'var(--green, #4A9C6A)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontWeight: 600,
                            border: '1px solid rgba(74, 156, 106, 0.3)',
                          }}
                        >
                          ✓ Voucher Conciliado
                        </span>
                      ) : ord.voucher_status === 'rejected' ? (
                        <span
                          style={{
                            fontSize: 11,
                            background: 'rgba(168, 71, 43, 0.15)',
                            color: 'var(--terracotta)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontWeight: 600,
                            border: '1px solid rgba(168, 71, 43, 0.3)',
                          }}
                        >
                          ⚠️ Voucher Rechazado
                        </span>
                      ) : (
                        <label
                          style={{
                            fontSize: 11,
                            fontFamily: "'IBM Plex Mono', monospace",
                            padding: '4px 10px',
                            background: 'var(--terracotta)',
                            color: '#fff',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          📎 Subir Voucher
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && user?.id) {
                                try {
                                  await uploadOrderVoucher({ orderId: ord.id, file, userId: user.id });
                                  if (typeof onSaveOrganization === 'function') {
                                    // Trigger reload if available
                                  }
                                } catch (upErr) {
                                  console.error('Error al subir voucher:', upErr);
                                }
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
