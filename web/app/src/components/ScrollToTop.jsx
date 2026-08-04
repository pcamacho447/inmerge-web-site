import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router v6 doesn't reset scroll position on navigation by default —
// without this, going e.g. Servicios -> Contacto keeps whatever scroll
// position you had on the previous page.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
