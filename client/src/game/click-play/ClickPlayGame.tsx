import React, { useState } from 'react';
import Level1 from './levels/Level1';
import Level2 from './levels/Level2';
import Level3 from './levels/Level3';
import './ClickPlayGame.css';

const ClickPlayGame: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(1);

  const handleLevelComplete = () => {
    setCurrentLevel((prev) => prev + 1);
  };

  return (
    <div className="click-play-container">
      {currentLevel === 1 && <Level1 onComplete={handleLevelComplete} />}
      {currentLevel === 2 && <Level2 onComplete={handleLevelComplete} />}
      {currentLevel === 3 && <Level3 />}
    </div>
  );
};

export default ClickPlayGame;
