import React, { useState } from 'react';
import Level1 from './levels/Level1';
import Level2 from './levels/Level2';
import Level3 from './levels/Level3';
import './ClickPlayGame.css';
import { useTranslation } from 'react-i18next';

interface ClickPlayGameProps {
  onComplete: () => void;
}

const ClickPlayGame: React.FC<ClickPlayGameProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showIntro, setShowIntro] = useState(true);
  const { t } = useTranslation();

  const handleLevelComplete = () => {
    setCurrentLevel((prev) => prev + 1);
  };

  const closeIntro = () => setShowIntro(false);

  return (
    <div className="click-play-container">
      {showIntro && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000,
          }}
          onClick={closeIntro}
        >
          <div
            className="modal-content intro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pixel-text">{t('clickPuzzle.introTitle')}</div>
            <div className="pixel-text">{t('clickPuzzle.introText')}</div>
            <div className="pixel-text">{t('clickPuzzle.howToPlay')}</div>
            <div className="pixel-text">{t('clickPuzzle.objective')}</div>
            <div className="pixel-text">{t('clickPuzzle.tapStart')}</div>
          </div>
        </div>
      )}

      {currentLevel === 1 && <Level1 onComplete={handleLevelComplete} />}
      {currentLevel === 2 && <Level2 onComplete={handleLevelComplete} />}
      {currentLevel === 3 && <Level3 onComplete={onComplete} />}
    </div>
  );
};

export default ClickPlayGame;
