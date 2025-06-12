import React, { useState, useEffect } from 'react';
import { puzzleLevels, PuzzleCard } from './puzzleData';
import './TimelinePuzzle.css';
import { useAudio } from '../../context/AudioContext';

interface TimelinePuzzleProps {
  onComplete?: () => void;
}

const TimelinePuzzle: React.FC<TimelinePuzzleProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const { playClick } = useAudio();

  const [touchDragCard, setTouchDragCard] = useState<PuzzleCard | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isTouchDragging ? 'hidden' : '';
    document.body.style.touchAction = isTouchDragging ? 'none' : '';

    const preventTouchMove = (e: TouchEvent) => {
      if (isTouchDragging) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventTouchMove, { passive: false });

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
      const idx = Array.from(dropzone.parentElement!.children).indexOf(dropzone);
      handleDropOnDropzone(
        { preventDefault: () => {}, dataTransfer: { getData: () => JSON.stringify(touchDragCard) } } as any,
        idx
      );
    } else {
      handleDropOnCardsArea(
        { preventDefault: () => {}, dataTransfer: { getData: () => JSON.stringify(touchDragCard) } } as any
      );
    }

    setIsTouchDragging(false);
    setTouchDragCard(null);
  };

  const handleDragStart = (e: React.DragEvent, card: PuzzleCard) => {
    e.dataTransfer.setData('application/my-card', JSON.stringify(card));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnDropzone = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/my-card');
    const card: PuzzleCard = JSON.parse(data);
    playClick(7);
    if (dropzones[dropIndex] !== null) return;
    setCardPositions(prev => prev.filter(c => c.id !== card.id));
    const newDropzones = [...dropzones];
    newDropzones[dropIndex] = card;
    setDropzones(newDropzones);
  };

  const handleDropOnCardsArea = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/my-card');
    const card: PuzzleCard = JSON.parse(data);
    setDropzones(prev => prev.map(dz => (dz && dz.id === card.id ? null : dz)));
    setCardPositions(prev => prev.some(c => c.id === card.id) ? prev : [...prev, card]);
  };

  function shuffleArray(arr: PuzzleCard[]): PuzzleCard[] {
    return arr.map(item => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  const [cardPositions, setCardPositions] = useState<PuzzleCard[]>(
    shuffleArray([...puzzleLevels[currentLevel].cards])
  );
  const [dropzones, setDropzones] = useState<(PuzzleCard | null)[]>(
    Array(puzzleLevels[currentLevel].cards.length).fill(null)
  );

  const checkSolution = () => {
    if (dropzones.some(dz => dz === null)) return resetPuzzle(false);
    for (let i = 0; i < dropzones.length; i++) {
      if (!dropzones[i] || dropzones[i]!.correctIndex !== i) return resetPuzzle(false);
    }
    nextLevel();
  };

  const resetPuzzle = (manual = false) => {
    if (!manual) alert('Incorrect order. Try again!');
    setCardPositions(shuffleArray([...puzzleLevels[currentLevel].cards]));
    setDropzones(Array(puzzleLevels[currentLevel].cards.length).fill(null));
  };

  const nextLevel = () => {
    if (currentLevel + 1 < puzzleLevels.length) {
      alert('Correct! Moving to next level...');
      const next = currentLevel + 1;
      setCurrentLevel(next);
      setCardPositions(shuffleArray([...puzzleLevels[next].cards]));
      setDropzones(Array(puzzleLevels[next].cards.length).fill(null));
    } else onComplete?.();
  };

  return (
    <div
      className="puzzle-container"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="puzzle-header">
        <h2>Timeline Puzzle (Level {puzzleLevels[currentLevel].levelNumber})</h2>
        <p>{puzzleLevels[currentLevel].levelDescription}</p>
      </div>

      <div className="cards-container" onDragOver={handleDragOver} onDrop={handleDropOnCardsArea}>
        {cardPositions.map(card => (
          <div
            key={card.id}
            className="card"
            draggable
            onDragStart={e => handleDragStart(e, card)}
            onTouchStart={e => handleTouchStart(e, card)}
            style={{ background: `url(${card.image}) center/cover no-repeat` }}
          >
            <div className="card-text-overlay">{card.text}</div>
          </div>
        ))}
      </div>

      <div className="dropzone-container">
        {dropzones.map((dz, idx) => (
          <div
            key={idx}
            className={`dropzone ${dz ? 'filled' : ''}`}
            onDragOver={handleDragOver}
            onDrop={e => handleDropOnDropzone(e, idx)}
          >
            {dz && (
              <div className="card" style={{ background: `url(${dz.image}) center/cover no-repeat` }}>
                <div className="card-text-overlay">{dz.text}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="action-buttons-container">
        <div className="action-button" onClick={() => { playClick(3); resetPuzzle(true); }}>
          Reset
        </div>
        <div className="action-button" onClick={() => { playClick(3); checkSolution(); }}>
          Check
        </div>
      </div>

      {isTouchDragging && touchDragCard && (
        <div className="card touch-drag-ghost" style={{
          background: `url(${touchDragCard.image}) center/cover no-repeat`,
          left: touchPosition.x - 125,
          top: touchPosition.y - 55
        }}>
          <div className="card-text-overlay">{touchDragCard.text}</div>
        </div>
      )}
    </div>
  );
};

export default TimelinePuzzle;
