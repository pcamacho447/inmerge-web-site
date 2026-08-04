import { describe, expect, it } from 'vitest';
import { hasAccess, isSubscriptionActive } from './auth.jsx';

const PREMIUM = { id: 'r-premium', tier: 'premium' };
const GRATIS = { id: 'r-free', tier: 'free' };

const enUnMes = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
const haceUnMes = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

describe('isSubscriptionActive', () => {
  it('acepta una suscripción activa cuyo periodo no venció', () => {
    expect(isSubscriptionActive({ status: 'active', currentPeriodEnd: enUnMes })).toBe(true);
  });

  it('rechaza una suscripción activa cuyo periodo ya venció', () => {
    expect(isSubscriptionActive({ status: 'active', currentPeriodEnd: haceUnMes })).toBe(false);
  });

  it('rechaza una suscripción cancelada aunque el periodo siga vigente', () => {
    expect(isSubscriptionActive({ status: 'canceled', currentPeriodEnd: enUnMes })).toBe(false);
  });

  it('rechaza la ausencia de suscripción', () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });
});

describe('hasAccess', () => {
  it('deja pasar los reportes gratuitos sin sesión', () => {
    expect(hasAccess(null, GRATIS)).toBe(true);
  });

  it('bloquea premium sin sesión', () => {
    expect(hasAccess(null, PREMIUM)).toBe(false);
  });

  it('deja pasar premium con compra directa', () => {
    expect(hasAccess({ purchases: ['r-premium'], subscription: null }, PREMIUM)).toBe(true);
  });

  // Espeja la rama de suscripción de has_access() en 0004: sin esto, un pago
  // manual otorgaría acceso permanente.
  it('bloquea premium cuando la suscripción venció', () => {
    const user = { purchases: [], subscription: { plan: 'monthly', status: 'active', currentPeriodEnd: haceUnMes } };
    expect(hasAccess(user, PREMIUM)).toBe(false);
  });

  it('deja pasar premium con suscripción vigente', () => {
    const user = { purchases: [], subscription: { plan: 'monthly', status: 'active', currentPeriodEnd: enUnMes } };
    expect(hasAccess(user, PREMIUM)).toBe(true);
  });
});
