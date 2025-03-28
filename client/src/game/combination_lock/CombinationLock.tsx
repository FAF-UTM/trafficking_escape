import React, { useState } from 'react';
import './CombinationLock.css';

interface CombinationLockProps {
  onComplete: () => void;
}

const CombinationLock: React.FC<CombinationLockProps> = ({ onComplete }) => {
  // Set the correct code (in this example, "7351")
  const correctCode = '7351';

  // State to track the user’s input, error messages, and modal display
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalText, setModalText] = useState('');

  // Opens a modal (used for both clue and success messages)
  const openModal = (img: string, text: string) => {
    setModalImage(img);
    setModalText(text);
    setModalVisible(true);
  };

  // Closes the modal; if the code was correct, triggers onComplete to move on
  const closeModal = () => {
    setModalVisible(false);
    setModalImage('');
    setModalText('');
    if (enteredCode === correctCode) {
      onComplete();
    }
  };

  // When a keypad button is clicked, append the value (if less than 4 digits)
  const handleButtonClick = (value: string) => {
    if (enteredCode.length < 4) {
      setEnteredCode((prev) => prev + value);
      setError('');
    }
  };

  // Clears the current input
  const handleClear = () => {
    setEnteredCode('');
    setError('');
  };

  // Checks the entered code when the user clicks "Enter"
  const handleSubmit = () => {
    if (enteredCode === correctCode) {
      openModal(
        '',
        'Correct code! The door unlocks... (Click outside to continue)'
      );
    } else {
      setError('Incorrect code. Try again!');
      setEnteredCode('');
    }
  };

  // Shows the clue modal when the user clicks the hidden clue zone
  const handleClueClick = () => {
    openModal(
      '/assets/clue.png',
      "A note pinned on the wall reads: 'The time forgotten holds the secret: 7, 3, 5, 1.'"
    );
  };

  return (
    <div className="escape-room-container">
      {/* Hidden Clue Zone – You can optionally add an icon here */}
      <div className="clue-zone" onClick={handleClueClick}>
        {/* Example (optional): <img src="/assets/clue-icon.png" alt="Clue" /> */}
      </div>

      {/* Display for the entered code (shows underscores for missing digits) */}
      <div className="display-code">{enteredCode.padEnd(4, '_')}</div>
      {error && <div className="error-message">{error}</div>}

      {/* Numeric Keypad */}
      <div className="keypad-container">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            className="keypad-button"
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

      {/* Modal overlay for clues and success messages */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalImage && <img src={modalImage} alt="modal content" />}
            <div className="pixel-text">{modalText}</div>
            <div className="pixel-text">(Click outside to close)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinationLock;
