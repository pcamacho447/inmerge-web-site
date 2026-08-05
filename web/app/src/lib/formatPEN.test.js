import { describe, expect, it } from 'vitest';
import { formatPEN } from './formatPEN.js';

describe('formatPEN', () => {
  it('no muestra céntimos para un precio entero', () => {
    expect(formatPEN(2390)).toBe('2,390');
    expect(formatPEN(180)).toBe('180');
  });

  it('muestra céntimos exactos cuando el precio no es entero', () => {
    // Caso real que approve_order() exige matchear con is distinct from:
    // redondear a "200" haría que el cliente pague un monto distinto al que
    // registró su pedido.
    expect(formatPEN(199.9)).toBe('199.90');
  });

  it('redondea la representación de un entero disfrazado de decimal (2390.00)', () => {
    // PostgREST manda numeric(10,2) como número JS: 2390.00 llega como 2390.
    expect(formatPEN(2390.0)).toBe('2,390');
  });

  it('devuelve — para null (antes devolvía "0", porque Number(null) es 0)', () => {
    expect(formatPEN(null)).toBe('—');
  });

  it('devuelve — para undefined', () => {
    expect(formatPEN(undefined)).toBe('—');
  });

  it('devuelve — para un valor no numérico', () => {
    expect(formatPEN('no-es-un-numero')).toBe('—');
  });
});
