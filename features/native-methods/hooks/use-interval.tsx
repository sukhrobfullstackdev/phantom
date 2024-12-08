import { useEffect, useState } from 'react';

const useInterval = (callback: () => void | Promise<void>, delay: number | null) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (delay) {
      const timer = setTimeout(async () => {
        await callback();
        setTime(prev => prev + 1);
      }, delay);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [time, delay]);
};

export { useInterval };
