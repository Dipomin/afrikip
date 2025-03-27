import { useEffect } from 'react';

export const usePreventCopyPaste = () => {
  useEffect(() => {
    const preventCopyPaste = (e: Event) => {
      e.preventDefault();
    };

    const events = ['cut', 'copy', 'paste', 'contextmenu'];

    events.forEach(event => {
      document.documentElement.addEventListener(event, preventCopyPaste);
    });

    return () => {
      events.forEach(event => {
        document.documentElement.removeEventListener(event, preventCopyPaste);
      });
    };
  }, []);
};