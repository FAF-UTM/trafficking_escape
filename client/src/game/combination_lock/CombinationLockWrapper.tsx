import React from 'react';
import CombinationLock from './CombinationLock';
import { useNavigate } from 'react-router-dom';

const CombinationLockWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to next scene or puzzle
    navigate('/chat');
  };

  return <CombinationLock onComplete={handleComplete} />;
};

export default CombinationLockWrapper;
