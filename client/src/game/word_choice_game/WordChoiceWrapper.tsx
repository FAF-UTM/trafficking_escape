import React, { useEffect, useRef } from 'react';
import { sendBeaconJson } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import WordChoiceGame from './WordChoiceGame.tsx';

const WordChoiceWrapper: React.FC = () => {
  const navigate = useNavigate();
  const startRef = useRef<number>(Date.now());

  const postSession = (totalSeconds: number) => {
    const payload = { gameName: 'WordChoice', totalSeconds };
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
    navigate(-1);
  };

  return <WordChoiceGame onComplete={handleComplete} />;
};

export default WordChoiceWrapper;
