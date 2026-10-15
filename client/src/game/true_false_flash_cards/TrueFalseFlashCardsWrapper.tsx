import React, { useEffect, useRef } from 'react';
import { sendBeaconJson } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import MinigameChrome from '../../components/shell/MinigameChrome';
import TrueFalseFlashCards from './TrueFalseFlashCards.tsx';

const TrueFalseFlashCardsWrapper: React.FC = () => {
  const navigate = useNavigate();
  const startRef = useRef<number>(Date.now());

  const postSession = (totalSeconds: number) => {
    const payload = { gameName: 'TrueFalseFlashCards', totalSeconds };
    sendBeaconJson('/api/v1/gameplay', payload);
  };

  useEffect(() => {
    startRef.current = Date.now();
    return () => {
      const totalSeconds = Math.max(
        0,
        Math.round((Date.now() - startRef.current) / 1000)
      );
      postSession(totalSeconds);
    };
  }, []);

  const handleComplete = async () => {
    const totalSeconds = Math.max(
      0,
      Math.round((Date.now() - startRef.current) / 1000)
    );
    postSession(totalSeconds);
    navigate('/mini-games');
  };

  const handleExit = () => {
    navigate('/mini-games');
  };

  return (
    <MinigameChrome onExit={handleExit}>
      <TrueFalseFlashCards onComplete={handleComplete} />
    </MinigameChrome>
  );
};

export default TrueFalseFlashCardsWrapper;
