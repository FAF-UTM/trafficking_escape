import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TrueFalseFlashCards from './TrueFalseFlashCards.tsx';

const TrueFalseFlashCardsWrapper: React.FC = () => {
  const navigate = useNavigate();
  const startRef = useRef<number>(Date.now());

  const postSession = (totalSeconds: number) => {
    const base =
      import.meta.env.VITE_BACKEND ||
      `${window.location.protocol}//${window.location.hostname}:8080`;
    const url = `${base}/api/v1/gameplay`;
    const payload = { gameName: 'TrueFalseFlashCards', totalSeconds };
    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });
    if (!navigator.sendBeacon || !navigator.sendBeacon(url, blob)) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
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

  return <TrueFalseFlashCards onComplete={handleComplete} />;
};

export default TrueFalseFlashCardsWrapper;
