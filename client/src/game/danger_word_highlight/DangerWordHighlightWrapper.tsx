import React from 'react';
import { useNavigate } from 'react-router-dom';
import DangerWordHighlight from './DangerWordHighlight.tsx';

const DangerWordHighlightWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to next scene or puzzle
    navigate('/chat');
  };

  return <DangerWordHighlight onComplete={handleComplete} />;
};

export default DangerWordHighlightWrapper;
