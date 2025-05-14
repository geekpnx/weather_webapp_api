// Create a new file usePreventPullToRefresh.ts
import { useEffect } from 'react';

export const usePreventPullToRefresh = (isOpen: boolean) => {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isOpen && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.body.style.overscrollBehaviorY = 'contain';
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      return () => {
        document.body.style.overscrollBehaviorY = '';
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isOpen]);
};