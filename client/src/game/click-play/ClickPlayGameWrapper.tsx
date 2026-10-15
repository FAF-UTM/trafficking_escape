import React, { useEffect } from 'react';
import { sendBeaconJson } from '../../lib/api';
import ClickPlayGame from './ClickPlayGame.tsx';
import { useNavigate } from 'react-router-dom';

const ClickPlayGameWrapper: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const start = Date.now();
    return () => {
      const totalSeconds = Math.max(0, Math.round((Date.now() - start) / 1000));
      const payload = { gameName: 'ClickPuzzle', totalSeconds };
      sendBeaconJson('/api/v1/gameplay', payload);
    };
  }, []);

  const handleComplete = async () => {
    navigate(-1);
  };

  return <ClickPlayGame onComplete={handleComplete} />;
};

export default ClickPlayGameWrapper;
