import { useEffect, useRef, useState } from 'react';

export const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting;
      setIsInView(isVisible);
      
      if (isVisible && !hasBeenViewed) {
        setHasBeenViewed(true);
        if (options.onEnterView) {
          options.onEnterView();
        }
      }
    }, {
      threshold: 0.5,
      ...options
    });

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options, hasBeenViewed]);

  return [elementRef, isInView];
};
