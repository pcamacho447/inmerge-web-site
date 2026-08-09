import { describe, expect, it } from 'vitest';
import { PALETTE, brandPage, coverPage } from './brandPage.mjs';

describe('brandPage', () => {
  it('pone el título en el encabezado corrido y en el cuerpo', () => {
    const html = brandPage({ title: 'Tres Limas fiscales', kicker: 'INVESTIGACIÓN', runningHead: 'TRES LIMAS', bodyHtml: '<p>hola</p>' });
    expect(html).toContain('Tres Limas fiscales');
    expect(html).toContain('TRES LIMAS');
    expect(html).toContain('<p>hola</p>');
  });

  it('cierra el documento y declara UTF-8, porque el copy lleva tildes', () => {
    const html = brandPage({ title: 'Ó', kicker: 'K', runningHead: 'R', bodyHtml: '' });
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('charset="utf-8"');
    expect(html.trimEnd()).toMatch(/<\/html>$/);
  });

  it('escapa el HTML del título para que un & no rompa el documento', () => {
    const html = brandPage({ title: 'Gasto & deuda', kicker: 'K', runningHead: 'R', bodyHtml: '' });
    expect(html).toContain('Gasto &amp; deuda');
    expect(html).not.toContain('Gasto & deuda');
  });

  it('no escapa el cuerpo, que ya viene como HTML', () => {
    const html = brandPage({ title: 'T', kicker: 'K', runningHead: 'R', bodyHtml: '<strong>82.6%</strong>' });
    expect(html).toContain('<strong>82.6%</strong>');
  });

  it('usa la paleta y no hex sueltos', () => {
    expect(PALETTE.terracotta).toBe('#A8472B');
    expect(PALETTE.bg).toBe('#F3EADA');
    expect(brandPage({ title: 'T', kicker: 'K', runningHead: 'R', bodyHtml: '' })).toContain('#A8472B');
  });

  it('la portada mide 1200x630, que es lo que exige og:image', () => {
    const html = coverPage({ title: 'De dónde viene la plata', subtitle: 'La recaudación propia', keyFigure: '34.9%' });
    expect(html).toContain('1200px');
    expect(html).toContain('630px');
    expect(html).toContain('34.9%');
  });

  it('la portada se sostiene sin cifra clave', () => {
    const html = coverPage({ title: 'Un informe sin cifra', subtitle: 'Bajada', keyFigure: null });
    expect(html).toContain('Un informe sin cifra');
    expect(html).not.toContain('null');
  });
});
