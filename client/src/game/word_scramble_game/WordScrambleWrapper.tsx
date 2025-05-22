import React from 'react';
import { useNavigate } from 'react-router-dom';
import WordScrambleGame from './WordScrambleGame.tsx';

const WordScrambleWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to next scene or puzzle
    navigate('/chat');
  };

  return <WordScrambleGame onComplete={handleComplete} />;
};

export default WordScrambleWrapper;
