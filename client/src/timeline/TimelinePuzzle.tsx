import React, { useState } from 'react';
import { puzzleLevels, PuzzleCard } from './puzzleData';
import './TimelinePuzzle.css';

const TimelinePuzzle: React.FC = () => {
  // Track the current level (0-based index in puzzleLevels array)
  const [currentLevel, setCurrentLevel] = useState(0);

  // Shuffle function for randomizing card order
  function shuffleArray(arr: PuzzleCard[]): PuzzleCard[] {
    return arr
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  // State for cards not in dropzones
  const [cardPositions, setCardPositions] = useState<PuzzleCard[]>(
    shuffleArray([...puzzleLevels[currentLevel].cards])
  );

  // State for dropzones; each drop slot starts empty (null)
  const dropzoneCount = puzzleLevels[currentLevel].cards.length;
  const [dropzones, setDropzones] = useState<(PuzzleCard | null)[]>(
    Array(dropzoneCount).fill(null)
  );

  // Drag events
  const handleDragStart = (e: React.DragEvent, card: PuzzleCard) => {
    e.dataTransfer.setData('application/my-card', JSON.stringify(card));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop onto a dropzone slot
  const handleDropOnDropzone = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/my-card');
    const card: PuzzleCard = JSON.parse(data);
    if (dropzones[dropIndex] !== null) return;
    setCardPositions((prev) => prev.filter((c) => c.id !== card.id));
    const newDropzones = [...dropzones];
    newDropzones[dropIndex] = card;
    setDropzones(newDropzones);
  };

  // Allow dropping back onto the cards container
  const handleDropOnCardsArea = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/my-card');
    const card: PuzzleCard = JSON.parse(data);
    setDropzones((prev) =>
      prev.map((dz) => (dz?.id === card.id ? null : dz))
    );
    setCardPositions((prev) => [...prev, card]);
  };

  // Check if the solution is correct
  const checkSolution = () => {
    if (dropzones.some((dz) => dz === null)) {
      resetPuzzle();
      return;
    }
    for (let i = 0; i < dropzones.length; i++) {
      const card = dropzones[i];
      if (!card || card.correctIndex !== i) {
        resetPuzzle();
        return;
      }
    }
    nextLevel();
  };

  const resetPuzzle = () => {
    alert('Incorrect order. Try again!');
    setCardPositions(shuffleArray([...puzzleLevels[currentLevel].cards]));
    setDropzones(Array(dropzoneCount).fill(null));
  };

  const nextLevel = () => {
    if (currentLevel + 1 < puzzleLevels.length) {
      alert('Correct! Moving to next level...');
      const next = currentLevel + 1;
      setCurrentLevel(next);
      setCardPositions(shuffleArray([...puzzleLevels[next].cards]));
      setDropzones(Array(puzzleLevels[next].cards.length).fill(null));
    } else {
      alert('All levels complete! Returning home...');
      // e.g. use navigate('/') to redirect
    }
  };

  return (
    <div className="puzzle-container">
      <div className="puzzle-header">
        <h2>Timeline Puzzle (Level {puzzleLevels[currentLevel].levelNumber})</h2>
        <p>{puzzleLevels[currentLevel].levelDescription}</p>
      </div>

      {/* Cards container */}
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

      {/* Dropzones */}
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

      <div style={{ textAlign: 'center' }}>
        <button onClick={checkSolution}>Check</button>
        <button onClick={resetPuzzle}>Reset</button>
      </div>
    </div>
  );
};

export default TimelinePuzzle;