import React, { useEffect, useRef } from 'react';
import { sendBeaconJson } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

import SafetyChecklistBuilder from './SafetyChecklistBuilder.tsx';

const SafetyChecklistBuilderWrapper: React.FC = () => {
  const navigate = useNavigate();
  const startRef = useRef<number>(Date.now());

  const postSession = (totalSeconds: number) => {
    const payload = { gameName: 'SafetyChecklistBuilder', totalSeconds };
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

  return <SafetyChecklistBuilder onComplete={handleComplete} />;
};

export default SafetyChecklistBuilderWrapper;
