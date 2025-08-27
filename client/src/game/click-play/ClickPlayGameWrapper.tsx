import React, { useEffect } from 'react';
import ClickPlayGame from './ClickPlayGame.tsx';
import { useNavigate } from 'react-router-dom';

const ClickPlayGameWrapper: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const start = Date.now();
    return () => {
      const totalSeconds = Math.max(0, Math.round((Date.now() - start) / 1000));
      const url = `${import.meta.env.VITE_BACKEND}/api/v1/gameplay`;
      const payload = { gameName: 'ClickPuzzle', totalSeconds };
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (!navigator.sendBeacon || !navigator.sendBeacon(url, blob)) {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    };
  }, []);

  const handleComplete = async () => {
    navigate(-1);
  };

  return <ClickPlayGame onComplete={handleComplete} />;
};

export default ClickPlayGameWrapper;


