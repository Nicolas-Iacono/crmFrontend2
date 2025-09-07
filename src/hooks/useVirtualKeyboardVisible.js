import { useState, useEffect } from 'react';

export const useVirtualKeyboardVisible = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        // Heuristic to determine if the keyboard is visible
        const isKeyboardVisible = window.innerHeight > window.visualViewport.height + 150; 
        setIsVisible(isKeyboardVisible);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      handleResize(); // Initial check
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return isVisible;
};
