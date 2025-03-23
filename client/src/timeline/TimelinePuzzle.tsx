// src/timeline/TimelinePuzzle.tsx
import React, { useState } from 'react';
import { puzzleLevels, PuzzleCard } from './puzzleData';
import './TimelinePuzzle.css';

const TimelinePuzzle: React.FC = () => {
  // Track the current level (0-based index in puzzleLevels array)
  const [currentLevel, setCurrentLevel] = useState(0);

  // Utility: Shuffle array function
  function shuffleArray(arr: PuzzleCard[]): PuzzleCard[] {
    return arr
      .map(item => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  // State for available cards (those not yet placed in dropzones)
  const [cardPositions, setCardPositions] = useState<PuzzleCard[]>(
    shuffleArray([...puzzleLevels[currentLevel].cards])
  );

  // State for dropzones (null if empty, or a PuzzleCard if filled)
  const count = puzzleLevels[currentLevel].cards.length;
  const [dropzones, setDropzones] = useState<(PuzzleCard | null)[]>(
    Array(count).fill(null)
  );

  // DRAG EVENTS
  const handleDragStart = (e: React.DragEvent, card: PuzzleCard) => {
    e.dataTransfer.setData('application/my-card', JSON.stringify(card));
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Enable dropping
    e.preventDefault();
  };

  // Drop on one of the placeholders
  const handleDropOnDropzone = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/my-card');
    const card: PuzzleCard = JSON.parse(data);
    // If the dropzone is already occupied, do nothing
    if (dropzones[dropIndex] !== null) return;
    // Remove the card from the available cards
    setCardPositions(prev => prev.filter(c => c.id !== card.id));
    // Place the card in the dropzone
    const newDropzones = [...dropzones];
    newDropzones[dropIndex] = card;
    setDropzones(newDropzones);
  };

  // Drop back onto the cards container
  const handleDropOnCardsArea = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/my-card');
    const card: PuzzleCard = JSON.parse(data);
    // Remove from dropzones if present
    setDropzones(prev => prev.map(dz => (dz && dz.id === card.id ? null : dz)));
    // Add back to cardPositions only if it's not already there
    setCardPositions(prev => (prev.some(c => c.id === card.id) ? prev : [...prev, card]));
  };

  // Check solution: if any dropzone is empty or a card is out of place, reset the puzzle
  const checkSolution = () => {
    if (dropzones.some(dz => dz === null)) {
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

  // Reset the puzzle; if isManual is true, don't show alert
  const resetPuzzle = (isManual: boolean = false) => {
    if (!isManual) {
      alert('Incorrect order. Try again!');
    }
    const count = puzzleLevels[currentLevel].cards.length;
    setCardPositions(shuffleArray([...puzzleLevels[currentLevel].cards]));
    setDropzones(Array(count).fill(null));
  };

  // Advance to the next level, or finish if the last level is completed
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
        {cardPositions.map(card => (
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
        <button onClick={() => resetPuzzle(true)}>Reset</button>
      </div>
    </div>
  );
};

export default TimelinePuzzle;