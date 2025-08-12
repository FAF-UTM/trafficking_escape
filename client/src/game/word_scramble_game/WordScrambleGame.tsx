import React, { useEffect, useMemo, useState } from 'react';
import './WordScrambleGame.css';

interface Puzzle {
  id: number;
  answer: string;
  fact: string;
  context: string;
}

type Stage = 'intro' | 'puzzle' | 'feedback' | 'end';

interface WordScrambleGameProps {
  onComplete: () => void;
}

const allPuzzles: Puzzle[] = [
  {
    id: 1,
    answer: 'SECRETS',
    context: 'A new chat says: “Keep this just between us.”',
    fact: 'Secrecy protects predators. Mary should avoid secrets with strangers and tell a trusted adult.',
  },
  {
    id: 2,
    answer: 'GROOM',
    context: 'They move to a private app and ask for a “quick pic.”',
    fact: 'That pattern is grooming. Refuse, block, and tell a trusted adult immediately.',
  },
  {
    id: 3,
    answer: 'SCOUT',
    context: '“I’m a model scout, no cap. Meet tonight.”',
    fact: 'Real opportunities don’t pressure minors over DMs. Verify with adults and report.',
  },
  {
    id: 4,
    answer: 'BLOCK',
    context: 'They ignore Mary’s boundary and keep pushing.',
    fact: 'Trust your instincts. Block persistent pressure and protect yourself.',
  },
  {
    id: 5,
    answer: 'REPORT',
    context: 'The account asks for location and offers a ride.',
    fact: 'Requests for live location + rides are isolation tactics. Report and involve adults.',
  },
  {
    id: 6,
    answer: 'LURES',
    context: '“Free gifts if you meet now.”',
    fact: 'Gifts + urgency are classic lures. Refuse and tell a trusted adult.',
  },
  {
    id: 7,
    answer: 'SAFETY',
    context: 'Mary feels uncomfortable as the chat escalates.',
    fact: 'Safety first. Stop the chat, block, and tell a parent/teacher right away.',
  },
  {
    id: 8,
    answer: 'EXIT',
    context: 'Mary needs to leave a risky situation fast.',
    fact: 'Having an exit plan and support network keeps Mary safer.',
  },
];

function shuffleString(value: string): string {
  const arr = value.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const jumbled = arr.join('');
  // Avoid unchanged shuffle
  return jumbled.toUpperCase() === value.toUpperCase()
    ? shuffleString(value)
    : jumbled;
}

const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Pick 4 puzzles randomly and precompute their jumbled forms per run
  const puzzles = useMemo(() => {
    const selected = [...allPuzzles]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    return selected.map(
      (p) => ({ ...p, jumbled: shuffleString(p.answer) }) as any
    );
  }, []);

  const currentPuzzle = puzzles[currentIndex] as unknown as Puzzle & {
    jumbled: string;
  };

  const handleStart = () => setStage('puzzle');

  const handleSubmit = () => {
    const normalized = userGuess.trim().toUpperCase();
    setIsCorrect(normalized === currentPuzzle.answer.toUpperCase());
    setStage('feedback');
  };

  const handleNext = () => {
    if (currentIndex === puzzles.length - 1) {
      setStage('end');
    } else {
      setCurrentIndex((i) => i + 1);
      setUserGuess('');
      setIsCorrect(null);
      setStage('puzzle');
    }
  };

  return (
    <div className="word-scramble-container">
      {/* How to play modal */}
      {stage === 'intro' && (
        <div className="modal-overlay" onClick={handleStart}>
          <div
            className="modal-content intro"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="intro-title">How to play</h2>
            <p className="intro-text">
              Mary is chatting online. Each round shows a scrambled safety word
              and a short scenario. Unscramble the word to reveal the safest
              idea.
            </p>
            <p className="intro-text">
              These words highlight red flags (secrecy, lures, grooming) and
              actions (block, report, exit). (Click outside to start)
            </p>
          </div>
        </div>
      )}

      {/* Puzzle Stage */}
      {stage === 'puzzle' && (
        <div className="puzzle-screen fade-in">
          <h2 className="puzzle-title">Unscramble the Word</h2>
          <div className="context-text">{currentPuzzle.context}</div>
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
            {currentIndex === 3 ? 'Finish' : 'Next'}
          </button>
        </div>
      )}

      {/* End Stage */}
      {stage === 'end' && (
        <div className="end-screen fade-in">
          <h2 className="end-title">Challenge Complete!</h2>
          <p className="end-text">
            Great job! Recognizing red flags and acting fast (block, report,
            exit) keeps Mary safer.
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
