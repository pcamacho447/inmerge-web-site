import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Adds `.is-visible` to [data-reveal] elements as they scroll into view —
// index.css keeps them at opacity 0 until then.
export default function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      if (typeof document !== 'undefined') {
        document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      }
      return;
    }

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
