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
