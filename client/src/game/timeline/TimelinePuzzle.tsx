import React, { useState, useEffect } from 'react';
import { puzzleLevels, PuzzleCard } from './puzzleData';
import './TimelinePuzzle.css';
import { useAudio } from '../../context/AudioContext';
import { useTranslation } from 'react-i18next';

interface TimelinePuzzleProps {
  onComplete?: () => void;
}

const TimelinePuzzle: React.FC<TimelinePuzzleProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const { playClick } = useAudio();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const closeIntro = () => setShowIntro(false);

  const openModal = (text: string) => {
    setModalText(text);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalText('');
  };

  const [touchDragCard, setTouchDragCard] = useState<PuzzleCard | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isTouchDragging ? 'hidden' : '';
    document.body.style.touchAction = isTouchDragging ? 'none' : '';
    const preventTouchMove = (e: TouchEvent) => {
      if (isTouchDragging) e.preventDefault();
    };
    document.addEventListener('touchmove', preventTouchMove, {
      passive: false,
    });
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [isTouchDragging]);

  const handleTouchStart = (e: React.TouchEvent, card: PuzzleCard) => {
    e.preventDefault();
    setTouchDragCard(card);
    setTouchPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setIsTouchDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDragging) return;
    e.preventDefault();
    setTouchPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDragging || !touchDragCard) {
      setIsTouchDragging(false);
      return;
    }
    e.preventDefault();
    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropzone = elem?.closest('.dropzone') as HTMLElement | null;
    if (dropzone) {
      const idx = Array.from(dropzone.parentElement!.children).indexOf(
        dropzone
      );
      handleDropOnDropzone(
        {
          preventDefault: () => {},
          dataTransfer: { getData: () => JSON.stringify(touchDragCard) },
        } as any,
        idx
      );
    } else {
      handleDropOnCardsArea({
        preventDefault: () => {},
        dataTransfer: { getData: () => JSON.stringify(touchDragCard) },
      } as any);
    }
    setIsTouchDragging(false);
    setTouchDragCard(null);
  };

  const handleDragStart = (e: React.DragEvent, card: PuzzleCard) =>
    e.dataTransfer.setData('application/my-card', JSON.stringify(card));
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDropOnDropzone = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const card: PuzzleCard = JSON.parse(
      e.dataTransfer.getData('application/my-card')
    );
    playClick(7);
    if (dropzones[dropIndex]) return;
    setCardPositions((prev) => prev.filter((c) => c.id !== card.id));
    setDropzones((prev) => {
      const nz = [...prev];
      nz[dropIndex] = card;
      return nz;
    });
  };
  const handleDropOnCardsArea = (e: React.DragEvent) => {
    e.preventDefault();
    const card: PuzzleCard = JSON.parse(
      e.dataTransfer.getData('application/my-card')
    );
    setDropzones((prev) =>
      prev.map((dz) => (dz && dz.id === card.id ? null : dz))
    );
    setCardPositions((prev) =>
      prev.some((c) => c.id === card.id) ? prev : [...prev, card]
    );
  };
  const shuffleArray = (arr: PuzzleCard[]) =>
    arr
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);

  const [cardPositions, setCardPositions] = useState<PuzzleCard[]>(
    shuffleArray([...puzzleLevels[currentLevel].cards])
  );
  const [dropzones, setDropzones] = useState<(PuzzleCard | null)[]>(
    Array(puzzleLevels[currentLevel].cards.length).fill(null)
  );

  const checkSolution = () => {
    let allFilled = true;
    let allCorrect = true;

    for (let i = 0; i < dropzones.length; i++) {
      const dz = dropzones[i];
      if (!dz) {
        allFilled = false;
        allCorrect = false;
      } else if (dz.correctIndex !== i) {
        allCorrect = false;
      }
    }

    if (allFilled && allCorrect) {
      nextLevel();
      return;
    }

    // Partially reset: keep correctly placed cards, return only incorrect ones to the pool
    openModal(t('timelinePuzzle.incorrect'));

    const incorrectCards: PuzzleCard[] = [];
    const newDropzones = dropzones.map((dz, idx) => {
      if (dz && dz.correctIndex !== idx) {
        incorrectCards.push(dz);
        return null;
      }
      return dz;
    });

    setDropzones(newDropzones);
    setCardPositions((prev) => {
      const existing = new Set(prev.map((c) => c.id));
      const toAdd = incorrectCards.filter((c) => !existing.has(c.id));
      return [...prev, ...toAdd];
    });
  };
  const resetPuzzle = (manual = false) => {
    if (!manual) openModal(t('timelinePuzzle.incorrect'));
    setCardPositions(shuffleArray([...puzzleLevels[currentLevel].cards]));
    setDropzones(Array(puzzleLevels[currentLevel].cards.length).fill(null));
  };
  const nextLevel = () => {
    if (currentLevel + 1 < puzzleLevels.length) {
      setPendingLevel(currentLevel + 1);
      openModal(t('timelinePuzzle.correct'));
    } else onComplete?.();
  };
  useEffect(() => {
    if (!modalVisible && pendingLevel !== null) {
      const next = pendingLevel;
      setPendingLevel(null);
      setCurrentLevel(next);
      setCardPositions(shuffleArray([...puzzleLevels[next].cards]));
      setDropzones(Array(puzzleLevels[next].cards.length).fill(null));
    }
  }, [modalVisible, pendingLevel]);

  const level = puzzleLevels[currentLevel];

  return (
    <div
      className="puzzle-container"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
            <div className="pixel-text">{t('timelinePuzzle.introTitle')}</div>
            <div className="pixel-text">{t('timelinePuzzle.introText')}</div>
            <div className="pixel-text">{t('timelinePuzzle.tapStart')}</div>
          </div>
        </div>
      )}

      <div className="puzzle-header">
        <h2>{t('timelinePuzzle.title', { level: level.levelNumber })}</h2>
        <p>{t(level.descriptionKey)}</p>
      </div>

      <div
        className="cards-container"
        onDragOver={handleDragOver}
        onDrop={handleDropOnCardsArea}
      >
        {cardPositions.map((card) => (
          <div
            key={card.id}
            className="card"
            draggable
            onDragStart={(e) => handleDragStart(e, card)}
            onTouchStart={(e) => handleTouchStart(e, card)}
            style={{ background: `url(${card.image}) center/cover no-repeat` }}
          >
            <div className="card-text-overlay">{t(card.textKey)}</div>
          </div>
        ))}
      </div>

      <div className="dropzone-container">
        {dropzones.map((dz, idx) => (
          <div
            key={idx}
            className={`dropzone ${dz ? 'filled' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnDropzone(e, idx)}
          >
            {dz && (
              <div
                className="card"
                style={{
                  background: `url(${dz.image}) center/cover no-repeat`,
                }}
              >
                <div className="card-text-overlay">{t(dz.textKey)}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="action-buttons-container">
        <div
          className="action-button"
          onClick={() => {
            playClick(3);
            resetPuzzle(true);
          }}
        >
          {t('timelinePuzzle.reset')}
        </div>
        <div
          className="action-button"
          onClick={() => {
            playClick(3);
            checkSolution();
          }}
        >
          {t('timelinePuzzle.check')}
        </div>
      </div>

      {isTouchDragging && touchDragCard && (
        <div
          className="card touch-drag-ghost"
          style={{
            background: `url(${touchDragCard.image}) center/cover no-repeat`,
            left: touchPosition.x - 125,
            top: touchPosition.y - 55,
          }}
        >
          <div className="card-text-overlay">{t(touchDragCard.textKey)}</div>
        </div>
      )}

      {modalVisible && (
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
          onClick={closeModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pixel-text">{modalText}</div>
            <div className="pixel-text">{t('timelinePuzzle.tapContinue')}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePuzzle;
