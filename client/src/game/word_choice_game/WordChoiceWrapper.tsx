import React from 'react';
import { useNavigate } from 'react-router-dom';
import WordChoiceGame from './WordChoiceGame.tsx';

const WordChoiceWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to next scene or puzzle
    navigate('/chat');
  };

  return <WordChoiceGame onComplete={handleComplete} />;
};

export default WordChoiceWrapper;
