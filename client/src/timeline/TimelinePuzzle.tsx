import React, { useState } from 'react';
import { puzzleLevels, PuzzleCard } from './puzzleData';
import './TimelinePuzzle.css';

const TimelinePuzzle: React.FC = () => {
  // Track the current level (0-based index in puzzleLevels array)
  const [currentLevel, setCurrentLevel] = useState(0);

  // Shuffle function
  function shuffleArray(arr: PuzzleCard[]): PuzzleCard[] {
    return arr
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  // State for cards that are not in dropzones
  const [cardPositions, setCardPositions] = useState<PuzzleCard[]>(
    shuffleArray([...puzzleLevels[currentLevel].cards])
  );

  // State for dropzones (null if empty, or a PuzzleCard if filled)
  const dropzoneCount = puzzleLevels[currentLevel].cards.length;
  const [dropzones, setDropzones] = useState<(PuzzleCard | null)[]>(
    Array(dropzoneCount).fill(null)
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

    // Remove card from the "cardPositions" area
    setCardPositions((prev) => prev.filter((c) => c.id !== card.id));

    // Place card in dropzones
    const newDropzones = [...dropzones];
    newDropzones[dropIndex] = card;
    setDropzones(newDropzones);
  };

  // Drop back onto the "cards container"
  const handleDropOnCardsArea = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/my-card');
    const card: PuzzleCard = JSON.parse(data);

    // Remove from dropzones, if present
    setDropzones((prev) =>
      prev.map((dz) => (dz && dz.id === card.id ? null : dz))
    );

    // Add back to cardPositions
    setCardPositions((prev) => [...prev, card]);
  };

  // Checking correctness
  const checkSolution = () => {
    // If any dropzone is empty, automatically fail
    if (dropzones.some((dz) => dz === null)) {
      resetPuzzle();
      return;
    }
    // Check the correctIndex of each card in each dropzone
    for (let i = 0; i < dropzones.length; i++) {
      const card = dropzones[i];
      if (!card || card.correctIndex !== i) {
        resetPuzzle();
        return;
      }
    }
    // If all correct
    nextLevel();
  };

  // Reset puzzle if incorrect
  const resetPuzzle = () => {
    alert('Incorrect order. Try again!');
    setCardPositions(shuffleArray([...puzzleLevels[currentLevel].cards]));
    setDropzones(Array(dropzoneCount).fill(null));
  };

  // Move to next level or finish
  const nextLevel = () => {
    if (currentLevel + 1 < puzzleLevels.length) {
      alert('Correct! Moving to next level...');
      const next = currentLevel + 1;
      setCurrentLevel(next);
      setCardPositions(shuffleArray([...puzzleLevels[next].cards]));
      setDropzones(Array(puzzleLevels[next].cards.length).fill(null));
    } else {
      alert('All levels complete! Returning home...');
      // Example: redirect or do something else
      // e.g. navigate('/')
    }
  };

  return (
    <div className="puzzle-container">
      <div className="puzzle-header">
        <h2>Timeline Puzzle (Level {puzzleLevels[currentLevel].levelNumber})</h2>
        <p>{puzzleLevels[currentLevel].levelDescription}</p>
      </div>

      {/* Cards container - user can drop cards back here */}
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
            {/* Text overlay if needed */}
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