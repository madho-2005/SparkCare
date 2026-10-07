import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop - Centralized global route-change scroll restoration component.
 * Automatically scrolls window and main layout viewport to (0, 0) on every route/location transition.
 */
export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If a hash anchor is present (e.g. #faq), scroll into view if target element exists
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
        return;
      }
    }

    // Reset primary browser window and document viewport
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }

    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }

    // Reset isolated main layout scroll container (e.g. DashboardLayout admin outlet)
    const mainContainer = document.querySelector('main.overflow-y-auto');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
      mainContainer.scrollLeft = 0;
    }
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
