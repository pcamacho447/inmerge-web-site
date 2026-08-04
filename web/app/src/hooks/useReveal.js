import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Adds `.is-visible` to [data-reveal] elements as they scroll into view —
// index.css keeps them at opacity 0 until then.
//
// A single querySelectorAll snapshot is NOT enough: since Phase B2 the report
// catalog arrives from Supabase, so Reportes/Cuenta mount their cards after
// the fetch resolves — well after this effect runs. Those late elements were
// never observed and stayed invisible forever, which read as "the reports
// don't load" even though the rows were in the DOM with their real titles.
// The MutationObserver below picks up whatever appears later, so async content
// reveals like everything else. Note that `prefers-reduced-motion` forces
// opacity 1 in index.css, which masks this class of bug entirely — don't rely
// on a reduced-motion machine to catch it. See useReveal.test.jsx.
export default function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const intersection = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            intersection.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    // Observing an element twice is a no-op, so overlapping calls are safe.
    function observeTree(node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches('[data-reveal]:not(.is-visible)')) intersection.observe(node);
      node.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => intersection.observe(el));
    }

    observeTree(document.body);

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(observeTree));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      intersection.disconnect();
    };
  }, [pathname]);
}
