import React from 'react';
import { useNavigate } from 'react-router-dom';
import TrueFalseFlashCards from './TrueFalseFlashCards.tsx';

const TrueFalseFlashCardsWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to next scene or puzzle
    navigate('/chat');
  };

  return <TrueFalseFlashCards onComplete={handleComplete} />;
};

export default TrueFalseFlashCardsWrapper;
