import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import useReveal from './useReveal.js';

// Regression test for the "los reportes no cargan" bug: since Phase B2 the
// report catalog arrives from Supabase, so cards mount well after useReveal's
// effect ran. The old implementation took a single querySelectorAll snapshot,
// so those cards were never observed and stayed at opacity 0 forever (index.css
// hides [data-reveal] until `.is-visible` lands). They were in the DOM with
// their real titles, which is why it read as a data-loading failure.
//
// jsdom has no IntersectionObserver, so this stub records what gets observed
// and lets a test fire intersection by hand. What matters here is *whether an
// element was observed at all* — that is precisely what regressed.
class IntersectionObserverStub {
  static instances = [];

  constructor(callback) {
    this.callback = callback;
    this.observed = new Set();
    IntersectionObserverStub.instances.push(this);
  }

  observe(el) {
    this.observed.add(el);
  }

  unobserve(el) {
    this.observed.delete(el);
  }

  disconnect() {
    this.observed.clear();
  }
}

function observedTexts() {
  return IntersectionObserverStub.instances.flatMap((instance) => [...instance.observed].map((el) => el.textContent));
}

// Simulates the element scrolling into view, through whichever observer holds it.
function scrollIntoView(el) {
  const owner = IntersectionObserverStub.instances.find((instance) => instance.observed.has(el));
  if (!owner) throw new Error(`Nobody is observing "${el.textContent}" — it can never be revealed.`);
  owner.callback([{ target: el, isIntersecting: true }], owner);
}

// Stands in for Reportes.jsx: a static heading present on first paint, plus
// cards that only exist once the fetch resolves.
function CatalogPage({ items }) {
  useReveal();
  return (
    <div>
      <h1 data-reveal="">Reportes premium</h1>
      {items.map((title) => (
        <article key={title} data-reveal="">
          {title}
        </article>
      ))}
    </div>
  );
}

describe('useReveal', () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    globalThis.IntersectionObserver = IntersectionObserverStub;
    IntersectionObserverStub.instances = [];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('observes elements already in the DOM on first paint', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CatalogPage items={[]} />
        </MemoryRouter>,
      );
    });

    expect(observedTexts()).toContain('Reportes premium');
  });

  it('observes elements that mount later, once async data arrives', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CatalogPage items={[]} />
        </MemoryRouter>,
      );
    });

    // The fetch resolves and the catalog renders.
    await act(async () => {
      root.render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CatalogPage items={['Seguimiento trimestral', 'Radiografía de contratistas']} />
        </MemoryRouter>,
      );
    });

    expect(observedTexts()).toContain('Seguimiento trimestral');
    expect(observedTexts()).toContain('Radiografía de contratistas');
  });

  it('reveals a late-mounting card when it scrolls into view', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CatalogPage items={[]} />
        </MemoryRouter>,
      );
    });
    await act(async () => {
      root.render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CatalogPage items={['Seguimiento trimestral']} />
        </MemoryRouter>,
      );
    });

    const card = container.querySelector('article');
    expect(card.classList.contains('is-visible')).toBe(false);

    act(() => scrollIntoView(card));

    expect(card.classList.contains('is-visible')).toBe(true);
  });
});
