import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmojiStoryDecoder from './EmojiStoryDecoder.tsx';

const EmojiStoryDecoderWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to next scene or puzzle
    navigate('/chat');
  };

  return <EmojiStoryDecoder onComplete={handleComplete} />;
};

export default EmojiStoryDecoderWrapper;
