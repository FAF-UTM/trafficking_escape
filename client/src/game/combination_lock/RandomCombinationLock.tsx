import React, { useState, useEffect } from 'react';
import './RandomCombinationLock.css';

/**
 * Represents a single combination lock level,
 * with its own code, background, clue, storyline, etc.
 */
interface CombinationLockLevel {
  id: number;
  code: string;
  background: string;
  clueImage: string;
  introTitle: string;
  introText: string;
  clueText: string;
  successText: string;
}

/**
 * Provide an array of possible levels. Feel free to add or modify these.
 */
const levels: CombinationLockLevel[] = [
  {
    id: 1,
    code: '7351',
    background: '/assets/bg_level1.png',
    clueImage: '/assets/clue_level1.png',
    introTitle: 'Trafficking Escape: Rusty Basement',
    introText: `You awaken in a cramped, rusted basement. 
                A heavy steel door stands in your way. 
                A tattered note on the floor suggests a code... 
                but the numbers are smeared.`,
    clueText: `A grimy scrap of paper reads: "Look beyond the rust. 
               7, 3, 5, 1 will guide you."`,
    successText: `A dull click echoes as the lock disengages. 
                  Light pours through the door’s edges—your chance at freedom.`,
  },
  {
    id: 2,
    code: '2468',
    background: '/assets/bg_level2.png',
    clueImage: '/assets/clue_level2.png',
    introTitle: 'Trafficking Escape: Deserted Warehouse',
    introText: `Dust swirls around you in an abandoned warehouse. 
                Faint footprints lead to a bolted door. 
                A whisper of a clue is scrawled on a toppled crate.`,
    clueText: `Etched in shaky handwriting: "2,4,6,8. 
               Don’t trust what you see—trust what you’ve heard."`,
    successText: `The metal latch slides open with a creak. 
                  The warehouse exit stands ajar, promising safety.`,
  },
  {
    id: 3,
    code: '9999',
    background: '/assets/bg_level3.png',
    clueImage: '/assets/clue_level3.png',
    introTitle: 'Trafficking Escape: Hidden Cell',
    introText: `A flickering lightbulb reveals concrete walls. 
                You notice a locked hatch leading upward. 
                You recall hearing someone mention "nines" in a hushed tone.`,
    clueText: `On the wall: "Trust the repeated digit—9999 is your salvation."`,
    successText: `A loud thud signals the hatch unlocking. 
                  The path to daylight beckons above.`,
  },
];

interface RandomCombinationLockProps {
  onComplete: () => void;
}

/**
 * A combination lock minigame that randomly selects one of multiple levels
 * each time the user navigates here. The puzzle flow: intro -> puzzle -> success.
 */
const RandomCombinationLock: React.FC<RandomCombinationLockProps> = ({
  onComplete,
}) => {
  // Stage can be "intro", "puzzle", or "success"
  const [stage, setStage] = useState<'intro' | 'puzzle' | 'success'>('intro');

  // Pick a random level on mount
  const [level] = useState<CombinationLockLevel>(() => {
    const randomIndex = Math.floor(Math.random() * levels.length);
    return levels[randomIndex];
  });

  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState('');

  // Modal state for the clue pop-up
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (stage === 'success') {
      // Wait a few seconds, then call onComplete
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  const handleButtonClick = (value: string) => {
    if (enteredCode.length < 4) {
      setEnteredCode((prev) => prev + value);
      setError('');
    }
  };

  const handleClear = () => {
    setEnteredCode('');
    setError('');
  };

  const handleSubmit = () => {
    if (enteredCode === level.code) {
      setStage('success');
    } else {
      setError('Incorrect code. Check your clue again!');
      setEnteredCode('');
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <div
      className="random-lock-container"
      style={{ backgroundImage: `url(${level.background})` }}
    >
      {/* Intro Scene */}
      {stage === 'intro' && (
        <div className="intro-screen fade-in">
          <h2 className="intro-title">{level.introTitle}</h2>
          <p className="intro-text">{level.introText}</p>
          <button className="intro-button" onClick={() => setStage('puzzle')}>
            Begin Puzzle
          </button>
        </div>
      )}

      {/* Puzzle Stage */}
      {stage === 'puzzle' && (
        <div className="puzzle-stage fade-in">
          {/* Hidden Clue Zone */}
          <div
            className="clue-zone"
            onClick={openModal}
            title="Click for a clue"
          />
          {/* Display for the entered code */}
          <div className="display-code">{enteredCode.padEnd(4, '_')}</div>
          {error && <div className="error-message">{error}</div>}

          {/* Keypad */}
          <div className="keypad-container">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                className="keypad-button bounce"
                onClick={() => handleButtonClick(num)}
              >
                {num}
              </button>
            ))}
            <button className="keypad-button" onClick={handleClear}>
              Clear
            </button>
            <button
              className="keypad-button"
              onClick={() => handleButtonClick('0')}
            >
              0
            </button>
            <button className="keypad-button" onClick={handleSubmit}>
              Enter
            </button>
          </div>
        </div>
      )}

      {/* Success Scene */}
      {stage === 'success' && (
        <div className="success-screen fade-in">
          <h2 className="success-title">Unlocked!</h2>
          <p className="success-text">{level.successText}</p>
          <div className="success-animation" />
        </div>
      )}

      {/* Clue Modal */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={level.clueImage} alt="Clue" />
            <div className="pixel-text">{level.clueText}</div>
            <div className="pixel-text">(Click outside to close)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomCombinationLock;
