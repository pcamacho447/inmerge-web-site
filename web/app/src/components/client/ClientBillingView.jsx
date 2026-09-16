import { useState, useEffect } from 'react';
import { INMERGE_BANK_ACCOUNTS, ORDER_STATUS_CONFIG, uploadOrderVoucher } from '../../lib/billing.js';
import { formatPEN } from '../../lib/formatPEN.js';

export default function ClientBillingView({ organization, orders, _loading, saving, onSaveOrganization, user, isEn, content }) {
  const bDict = content?.ACCOUNT_CONTENT?.billing || {};

  const [form, setForm] = useState({
    billingType: 'ruc',
    legalName: '',
    taxId: '',
    billingEmail: user?.email || '',
    billingAddress: '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [uploadingOrderId, setUploadingOrderId] = useState(null);
  const [uploadError, setUploadError] = useState(null);

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
            {isEn
              ? bDict.officialAccountsTitle || 'Official Bank Accounts for Wire Transfers'
              : 'Cuentas Bancarias Oficiales para Transferencias'}
          </h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
          {isEn
            ? bDict.officialAccountsDesc ||
              'Inmerge processes domestic payments exclusively via direct bank transfer in PEN. For international corporate contracts, wire transfer (SWIFT) applies.'
            : 'Inmerge procesa pagos exclusivamente mediante Transferencia Bancaria Directa a nuestras cuentas corrientes empresariales en moneda nacional (PEN).'}
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
                  {isEn ? 'Holder:' : 'Titular:'} <strong>{acc.holder}</strong>
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
                {copiedIndex === idx
                  ? isEn
                    ? '✓ Interbank CCI Copied'
                    : '✓ CCI Copiado al portapapeles'
                  : isEn
                    ? '📋 Copy Interbank CCI'
                    : '📋 Copiar CCI Interbancario'}
              </button>
            </div>
          ))}
        </div>

        {/* Tarjeta Informativa de Transferencias Internacionales (SWIFT / MSA) */}
        <div
          style={{
            background: 'rgba(216, 168, 78, 0.12)',
            border: '1px solid rgba(216, 168, 78, 0.35)',
            borderRadius: 6,
            padding: '14px 18px',
            marginTop: 18,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>🌐</span>
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: 4,
                letterSpacing: 0.5,
              }}
            >
              {bDict.internationalNoticeTitle || 'CLIENTES CORPORATIVOS INTERNACIONALES'}
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>
              {bDict.internationalNoticeDesc ||
                'Para entidades internacionales que operan fuera del Perú, los pagos se coordinan mediante transferencia institucional internacional (código SWIFT) o acuerdos de servicio (MSA) en USD/EUR previa coordinación.'}
            </p>
          </div>
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
            {isEn ? bDict.legalEntityTitle || '2. Fiscal Details & Legal Entity' : 'Datos Fiscales & Razón Social para Facturación'}
          </h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px' }}>
          {isEn
            ? 'Configure billing details for the issuance of electronic invoices corresponding to your projects.'
            : 'Configura los datos fiscales para la emisión de Facturas o Boletas electrónicas correspondientes a tus proyectos.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                {isEn ? 'Invoice Type *' : 'Tipo de Comprobante *'}
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
                <option value="ruc">{isEn ? 'Tax Invoice (with RUC / Tax ID)' : 'Factura Electrónica (con RUC)'}</option>
                <option value="dni">{isEn ? 'Personal Receipt (with DNI / ID)' : 'Boleta de Venta (con DNI)'}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                {form.billingType === 'ruc'
                  ? isEn
                    ? 'RUC / Tax ID (11 digits) *'
                    : 'RUC (11 dígitos) *'
                  : isEn
                    ? 'DNI / Personal ID *'
                    : 'DNI / Documento *'}
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
                placeholder={form.billingType === 'ruc' ? '20XXXXXXXXX' : isEn ? 'Personal ID' : 'XXXXXXXX'}
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
                {isEn ? bDict.legalNameLabel || 'Company / Organization Legal Name *' : 'Razón Social / Nombre Completo *'}
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
                {isEn ? bDict.billingEmailLabel || 'Invoicing Email *' : 'Correo Electrónico de Facturación *'}
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
              {isEn ? bDict.billingAddressLabel || 'Fiscal Address (Optional)' : 'Dirección Fiscal (Opcional)'}
            </label>
            <input
              type="text"
              value={form.billingAddress}
              onChange={(e) => {
                setIsDirty(true);
                setForm({ ...form, billingAddress: e.target.value });
              }}
              placeholder={isEn ? '123 Tech Boulevard, Suite 400' : 'Av. Javier Prado Este 1234, San Isidro, Lima'}
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
              {saving
                ? isEn
                  ? 'Saving details...'
                  : 'Guardando datos...'
                : isEn
                  ? bDict.saveBtn || 'Save Billing Details'
                  : 'Guardar Información Fiscal'}
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
            {isEn ? 'Service Orders History' : 'Historial de Órdenes de Servicio'} ({orders.length})
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
            {isEn
              ? 'No service orders registered yet. When a technical proposal or milestone is agreed upon, your order with payment code will be generated.'
              : 'No tienes órdenes de servicio registradas. Al acordar una propuesta técnica o hito, se generará tu orden con el código correlativo de pago.'}
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
                      {ord.plan || (isEn ? 'Engineering Consulting Service' : 'Servicio de Consultoría de Ingeniería')}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      {isEn ? 'Payment Method: ' : 'Medio de Pago: '}
                      <strong>{isEn ? 'Direct Bank Transfer' : 'Transferencia Bancaria Directa'}</strong>
                      {ord.notes && <span> • {ord.notes}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 700, color: 'var(--terracotta)' }}>
                        S/ {formatPEN(ord.amount_pen)}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {new Date(ord.created_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', {
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
                          {isEn ? '⏳ Voucher under review' : '⏳ Voucher en Revisión'}
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
                          {isEn ? '✓ Voucher Reconciled' : '✓ Voucher Conciliado'}
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
                          {isEn ? '⚠️ Voucher Rejected' : '⚠️ Voucher Rechazado'}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <label
                            style={{
                              fontSize: 11,
                              fontFamily: "'IBM Plex Mono', monospace",
                              padding: '4px 10px',
                              background: uploadingOrderId === ord.id ? 'var(--muted)' : 'var(--terracotta)',
                              color: '#fff',
                              borderRadius: 4,
                              cursor: uploadingOrderId === ord.id ? 'wait' : 'pointer',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {uploadingOrderId === ord.id
                              ? isEn
                                ? '⏳ Uploading...'
                                : '⏳ Subiendo...'
                              : isEn
                                ? '📎 Upload Voucher'
                                : '📎 Subir Voucher'}
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                              disabled={uploadingOrderId === ord.id}
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file && user?.id) {
                                  setUploadError(null);
                                  setUploadingOrderId(ord.id);
                                  try {
                                    await uploadOrderVoucher({ orderId: ord.id, file, userId: user.id });
                                    if (typeof onSaveOrganization === 'function') {
                                      // Trigger reload if available
                                    }
                                  } catch (upErr) {
                                    console.error('Error al subir voucher:', upErr);
                                    setUploadError({
                                      orderId: ord.id,
                                      message: upErr.message || (isEn ? 'Error uploading voucher.' : 'Error al subir el comprobante.'),
                                    });
                                  } finally {
                                    setUploadingOrderId(null);
                                  }
                                }
                              }}
                            />
                          </label>
                          {uploadError?.orderId === ord.id && (
                            <span style={{ fontSize: 11, color: 'var(--terracotta)', maxWidth: 280, textAlign: 'right' }}>
                              ⚠️ {uploadError.message}
                            </span>
                          )}
                        </div>
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
