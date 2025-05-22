import React, { useState } from 'react';
import './WordScrambleGame.css';

interface Puzzle {
  id: number;
  jumbled: string;
  answer: string;
  fact: string;
}

const puzzles: Puzzle[] = [
  {
    id: 1,
    jumbled: 'PLEH', // Unscrambles to "HELP"
    answer: 'HELP',
    fact: 'Recognizing when you need help is the first step to safety.',
  },
  {
    id: 2,
    jumbled: 'AESF', // Unscrambles to "SAFE"
    answer: 'SAFE',
    fact: 'Being safe means planning and staying aware of your surroundings.',
  },
  {
    id: 3,
    jumbled: 'TXEI', // Unscrambles to "EXIT"
    answer: 'EXIT',
    fact: 'Knowing your exit strategy can make all the difference in an emergency.',
  },
  {
    id: 4,
    jumbled: 'TARP', // Unscrambles to "TRAP"
    answer: 'TRAP',
    fact: 'Identifying red flags helps you avoid dangerous traps.',
  },
];

type Stage = 'intro' | 'puzzle' | 'feedback' | 'end';

interface WordScrambleGameProps {
  onComplete: () => void;
}

const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentPuzzle = puzzles[currentIndex];

  const handleStart = () => {
    setStage('puzzle');
  };

  const handleSubmit = () => {
    if (userGuess.trim().toUpperCase() === currentPuzzle.answer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setStage('feedback');
  };

  const handleNext = () => {
    if (currentIndex === puzzles.length - 1) {
      setStage('end');
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserGuess('');
      setIsCorrect(null);
      setStage('puzzle');
    }
  };

  return (
    <div className="word-scramble-container">
      {/* Intro Stage */}
      {stage === 'intro' && (
        <div className="intro-screen fade-in">
          <h2 className="intro-title">Word Scramble Challenge</h2>
          <p className="intro-text">
            In the midst of chaos, your sharp mind is your best tool. Unscramble
            the hidden words to uncover safety tips and stay alert.
          </p>
          <button className="intro-button" onClick={handleStart}>
            Begin Challenge
          </button>
        </div>
      )}

      {/* Puzzle Stage */}
      {stage === 'puzzle' && (
        <div className="puzzle-screen fade-in">
          <h2 className="puzzle-title">Unscramble the Word</h2>
          <div className="jumbled-word">{currentPuzzle.jumbled}</div>
          <input
            type="text"
            className="guess-input"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="Type your answer here"
          />
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}

      {/* Feedback Stage */}
      {stage === 'feedback' && (
        <div className="feedback-screen fade-in">
          {isCorrect ? (
            <h3 className="feedback-title correct">Correct!</h3>
          ) : (
            <h3 className="feedback-title incorrect">Incorrect!</h3>
          )}
          <p className="feedback-text">
            {isCorrect
              ? currentPuzzle.fact
              : `The correct answer was "${currentPuzzle.answer}". Remember: ${currentPuzzle.fact}`}
          </p>
          <button className="next-button" onClick={handleNext}>
            {currentIndex === puzzles.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      )}

      {/* End Stage */}
      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">Challenge Complete!</h2>
          <p className="end-text">
            Great job! Your ability to decipher clues is a vital skill in
            staying safe. Keep your mind sharp and always be prepared.
          </p>
          <button className="end-button" onClick={onComplete}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
};

export default WordScrambleGame;
