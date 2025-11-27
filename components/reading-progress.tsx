import React, { useState, useEffect } from 'react';

interface ReadingProgressProps {
  target: React.RefObject<HTMLElement>;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({ target }) => {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateReadingProgress = () => {
      if (!target.current) return;

      const element = target.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const windowScrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      if (windowScrollTop === 0) {
        setReadingProgress(0);
        return;
      }

      if (windowScrollTop > totalHeight) {
        setReadingProgress(100);
        return;
      }

      setReadingProgress((windowScrollTop / totalHeight) * 100);
    };

    window.addEventListener('scroll', updateReadingProgress);
    updateReadingProgress();

    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, [target]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;
