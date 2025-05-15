import { useRef, useEffect } from 'react';

const easeOutQuad = (t: number): number => t * (2 - t);

export const useDragToClose = (isOpen: boolean, onClose: () => void) => {
  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (!isOpen || !dropdownRef.current) return;
    
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    const header = dropdownRef.current.querySelector('.dropdown-header');
    
    if (header && header.contains(target)) {
      e.preventDefault();
      touchStartY.current = touch.clientY;
      isDragging.current = true;
      
      // Reset any existing transforms
      if (dropdownRef.current) {
        dropdownRef.current.style.transition = 'none';
        dropdownRef.current.style.transform = '';
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isOpen || !isDragging.current || !dropdownRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY.current;
    const dropdownHeight = dropdownRef.current.offsetHeight;
    
    if (deltaY > 0) {
      e.preventDefault();
      const dragPercentage = Math.min(deltaY / dropdownHeight, 1);
      const easedPercentage = easeOutQuad(dragPercentage);
      dropdownRef.current.style.transform = `translateY(${easedPercentage * 100}%)`;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isOpen || !dropdownRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStartY.current;
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const closeThreshold = 0.3;
    
    if (deltaY / dropdownHeight > closeThreshold && isDragging.current) {
      dropdownRef.current.style.transition = 'transform 0.2s ease-out';
      dropdownRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => onClose(), 200);
    } else {
      dropdownRef.current.style.transition = 'transform 0.2s ease-out';
      dropdownRef.current.style.transform = '';
    }
    
    isDragging.current = false;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overscrollBehaviorY = 'contain';
    } else {
      document.body.style.overscrollBehaviorY = '';
    }
    
    return () => {
      document.body.style.overscrollBehaviorY = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const passiveOptions = { passive: false };
    
    document.addEventListener('touchstart', handleTouchStart, passiveOptions);
    document.addEventListener('touchmove', handleTouchMove, passiveOptions);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  return { 
    dropdownRef,
    handleTouchStart: (e: TouchEvent) => handleTouchStart(e) 
  };
};