import React, { useState } from 'react';
import { puzzleLevels, PuzzleCard } from './puzzleData';
import './TimelinePuzzle.css';
import { useAudio } from '../../context/AudioContext';

interface TimelinePuzzleProps {
  onComplete?: () => void;
}

const TimelinePuzzle: React.FC<TimelinePuzzleProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const { playClick } = useAudio();

  function shuffleArray(arr: PuzzleCard[]): PuzzleCard[] {
    return arr
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  const [cardPositions, setCardPositions] = useState<PuzzleCard[]>(
    shuffleArray([...puzzleLevels[currentLevel].cards])
  );
  const dropzoneCount = puzzleLevels[currentLevel].cards.length;
  const [dropzones, setDropzones] = useState<(PuzzleCard | null)[]>(
    Array(dropzoneCount).fill(null)
  );

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
    setCardPositions((prev) => prev.filter((c) => c.id !== card.id));
    const newDropzones = [...dropzones];
    newDropzones[dropIndex] = card;
    setDropzones(newDropzones);
  };

  const handleDropOnCardsArea = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/my-card');
    const card: PuzzleCard = JSON.parse(data);
    setDropzones((prev) =>
      prev.map((dz) => (dz && dz.id === card.id ? null : dz))
    );
    setCardPositions((prev) =>
      prev.some((c) => c.id === card.id) ? prev : [...prev, card]
    );
  };

  const checkSolution = () => {
    if (dropzones.some((dz) => dz === null)) {
      resetPuzzle(false);
      return;
    }
    for (let i = 0; i < dropzones.length; i++) {
      const card = dropzones[i];
      if (!card || card.correctIndex !== i) {
        resetPuzzle(false);
        return;
      }
    }
    nextLevel();
  };

  const resetPuzzle = (isManual: boolean = false) => {
    if (!isManual) {
      alert('Incorrect order. Try again!');
    }
    const count = puzzleLevels[currentLevel].cards.length;
    setCardPositions(shuffleArray([...puzzleLevels[currentLevel].cards]));
    setDropzones(Array(count).fill(null));
  };

  const nextLevel = () => {
    if (currentLevel + 1 < puzzleLevels.length) {
      alert('Correct! Moving to next level...');
      const next = currentLevel + 1;
      setCurrentLevel(next);
      setCardPositions(shuffleArray([...puzzleLevels[next].cards]));
      setDropzones(Array(puzzleLevels[next].cards.length).fill(null));
    } else {
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="puzzle-container">
      <div className="puzzle-header">
        <h2>
          Timeline Puzzle (Level {puzzleLevels[currentLevel].levelNumber})
        </h2>
        <p>{puzzleLevels[currentLevel].levelDescription}</p>
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
            style={{
              background: `url(${card.image}) center/cover no-repeat`,
            }}
          >
            <div className="card-text-overlay">{card.text}</div>
          </div>
        ))}
      </div>

      <div className="dropzone-container">
        {dropzones.map((dz, index) => (
          <div
            key={index}
            className={`dropzone ${dz ? 'filled' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnDropzone(e, index)}
          >
            {dz && (
              <div
                className="card"
                style={{
                  background: `url(${dz.image}) center/cover no-repeat`,
                }}
              >
                <div className="card-text-overlay">{dz.text}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="action-buttons-container">
        <div className="action-button" onClick={() => {playClick(3); resetPuzzle(true);}}>
          Reset
        </div>
        <div className="action-button" onClick={() => {
          playClick(3);
          checkSolution();
        }}>
          Check
        </div>
      </div>
    </div>
  );
};

export default TimelinePuzzle;
