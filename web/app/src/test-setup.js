import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Global IntersectionObserver mock for jsdom test environment
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// @testing-library/react auto-registers this afterEach only when it detects
// global test-framework functions (globals: true in vite.config.js). This
// project deliberately imports `describe`/`it`/etc. explicitly instead of
// using globals, so without this the DOM from one test leaks into the next —
// e.g. two mounted CheckoutModal instances both matching the same radio role.
afterEach(() => {
  cleanup();
});

// Supresión quirúrgica de logs y advertencias esperadas en pruebas intencionales de fallo
const SILENCED_WARN_PATTERNS = [
  /React Router Future Flag Warning/,
  /\[useRealtimeTeam\] Advertencia de conectividad Realtime/,
  /\[projects\] secure-download Edge Function no disponible/,
  /\[leads\] Bot detectado mediante honeypot/,
];

const SILENCED_ERROR_PATTERNS = [/Test crash in component/, /Error al registrar solicitud TDR en Supabase/];

const SILENCED_LOG_PATTERNS = [/\[leads\] Notificación procesada con éxito por notify-lead-tdr/];

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('Test crash in component') || event.error?.message?.includes('Test crash in component')) {
      event.preventDefault();
    }
  });
}

const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args.map((a) => (typeof a === 'object' ? a?.message || JSON.stringify(a) : String(a))).join(' ');
  if (SILENCED_WARN_PATTERNS.some((p) => p.test(msg))) return;
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  const msg = args.map((a) => (typeof a === 'object' ? a?.message || JSON.stringify(a) : String(a))).join(' ');
  if (SILENCED_ERROR_PATTERNS.some((p) => p.test(msg))) return;
  originalError(...args);
};

const originalLog = console.log;
console.log = (...args) => {
  const msg = args.map((a) => (typeof a === 'object' ? a?.message || JSON.stringify(a) : String(a))).join(' ');
  if (SILENCED_LOG_PATTERNS.some((p) => p.test(msg))) return;
  originalLog(...args);
};
