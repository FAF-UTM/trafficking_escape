import React from 'react';
import { useNavigate } from 'react-router-dom';
import WhoToTrustGame from './WhoToTrustGame.tsx';

const WhoToTrustGameWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to next scene or puzzle
    navigate('/chat');
  };

  return <WhoToTrustGame onComplete={handleComplete} />;
};

export default WhoToTrustGameWrapper;
