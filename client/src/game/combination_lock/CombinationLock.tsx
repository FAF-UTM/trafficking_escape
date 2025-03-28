import React, { useState, useEffect } from 'react';
import './CombinationLock.css';

interface CombinationLockProps {
  onComplete: () => void;
}

const CombinationLock: React.FC<CombinationLockProps> = ({ onComplete }) => {
  const correctCode = '7351';
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState('');
  // Stage can be "intro", "puzzle", or "success"
  const [stage, setStage] = useState<'intro' | 'puzzle' | 'success'>('intro');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalText, setModalText] = useState('');

  // Opens a modal with an optional image and message
  const openModal = (img: string, text: string) => {
    setModalImage(img);
    setModalText(text);
    setModalVisible(true);
  };

  // Closes the modal
  const closeModal = () => {
    setModalVisible(false);
    setModalImage('');
    setModalText('');
  };

  // Append a digit when a keypad button is pressed (limit to 4 digits)
  const handleButtonClick = (value: string) => {
    if (enteredCode.length < 4) {
      setEnteredCode((prev) => prev + value);
      setError('');
    }
  };

  // Clear the entered code
  const handleClear = () => {
    setEnteredCode('');
    setError('');
  };

  // Verify the entered code when the user presses "Enter"
  const handleSubmit = () => {
    if (enteredCode === correctCode) {
      setStage('success');
    } else {
      setError('The code seems off. Re-examine the clues and try again!');
      setEnteredCode('');
    }
  };

  // When the user clicks on the hidden clue zone, display a cryptic clue
  const handleClueClick = () => {
    openModal(
      '/assets/who_to_trust/trafficking_escape_clue.png',
      "A faded note on the wall whispers: 'Remember the numbers: 7, 3, 5, 1 — they hold the key to your freedom.'"
    );
  };

  // When stage becomes success, automatically trigger onComplete after a delay
  useEffect(() => {
    if (stage === 'success') {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <div className="enhanced-escape-container">
      {/* Intro Scene */}
      {stage === 'intro' && (
        <div className="intro-screen fade-in">
          <h2 className="intro-title">Trafficking Escape: The Locked Door</h2>
          <p className="intro-text">
            You find yourself confined in a dim, abandoned room—a stark reminder
            of exploitation. In the distance, a heavy door stands between you
            and the hope of freedom. Embedded on the door is a combination lock,
            its numbers shrouded in mystery.
          </p>
          <p className="intro-text">
            A nearly faded note clings to the wall. It hints at a secret
            sequence. Will you trust your instincts and decode the clue to
            escape?
          </p>
          <button className="intro-button" onClick={() => setStage('puzzle')}>
            Begin Your Escape
          </button>
        </div>
      )}

      {/* Puzzle Stage */}
      {stage === 'puzzle' && (
        <div className="puzzle-stage fade-in">
          {/* Hidden Clue Zone */}
          <div className="clue-zone" onClick={handleClueClick}>
            <img
              className="clue-zone-icon"
              src="/assets/who_to_trust/clue-icon.png"
              alt="clue"
            />
          </div>
          {/* Code Display */}
          <div className="display-code">{enteredCode.padEnd(4, '_')}</div>
          {error && <div className="error-message">{error}</div>}
          {/* Numeric Keypad */}
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
            <button
              className="keypad-button keypad-button-option"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              className="keypad-button"
              onClick={() => handleButtonClick('0')}
            >
              0
            </button>
            <button
              className="keypad-button keypad-button-option"
              onClick={handleSubmit}
            >
              Enter
            </button>
          </div>
        </div>
      )}

      {/* Success Scene */}
      {stage === 'success' && (
        <div className="success-screen fade-in">
          <h2 className="success-title">The Door Unlocks...</h2>
          <p className="success-text">
            With a resonant click, the lock yields. The door creaks open,
            ushering in a ray of hope and the promise of freedom.
          </p>
          <div className="success-animation">
            {/* This animated element can depict the door slowly swinging open */}
          </div>
        </div>
      )}

      {/* Modal overlay for clues and additional info */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalImage && <img src={modalImage} alt="clue" />}
            <div className="pixel-text">{modalText}</div>
            <div className="pixel-text">(Click outside to close)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinationLock;
