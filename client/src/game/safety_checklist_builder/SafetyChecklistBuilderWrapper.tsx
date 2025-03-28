import React from 'react';
import { useNavigate } from 'react-router-dom';

import SafetyChecklistBuilder from './SafetyChecklistBuilder.tsx';

const SafetyChecklistBuilderWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to next scene or puzzle
    navigate('/chat');
  };

  return <SafetyChecklistBuilder onComplete={handleComplete} />;
};

export default SafetyChecklistBuilderWrapper;
