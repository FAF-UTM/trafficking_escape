import React, { useState, useEffect } from 'react';

interface Level2Props {
  onComplete: () => void; // Callback to move on to the next level
}

const Level2: React.FC<Level2Props> = ({ onComplete }) => {
  // Puzzle states
  const [crowbarFound, setCrowbarFound] = useState(false);
  const [wireCutterFound, setWireCutterFound] = useState(false);
  const [noteFound, setNoteFound] = useState(false);
  const [electricityOff, setElectricityOff] = useState(false);
  const [doorUnlocked, setDoorUnlocked] = useState(false);

  // Inventory
  const [inventory, setInventory] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Modal logic
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalText, setModalText] = useState('');

  // Code input dialog
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');

  /* -----------------------
   *  Utility: Modal & Inventory
   * ----------------------- */

  // Opens a modal with an image and text
  const openModal = (img: string, text: string) => {
    setModalImage(img);
    setModalText(text);
    setModalVisible(true);
  };

  const closeModal = () => {
    // Clear the image/text
    setModalImage('');
    setModalText('');
    setModalVisible(false);
  };

  // Handle selecting/deselecting an item in inventory
  const handleSelectItem = (item: string) => {
    if (selectedItem === item) {
      // Deselect if clicked again
      setSelectedItem(null);
      return;
    }
    setSelectedItem(item);

    // If user selects the note from inventory, show it again
    if (item === 'note2') {
      openModal('/assets/note2.png', 'The note reads: "2451"');
    }
  };

  /* -----------------------
   *  Puzzle / Hotspots
   * ----------------------- */

  // 1. Papers → pick up a note
  const handlePapersClick = () => {
    if (!noteFound) {
      setNoteFound(true);
      setInventory((prev) => [...prev, 'note2']);
      openModal('/assets/note2.png', 'You found a note! It says: "2451"');
    }
  };

  // 2. Crates → crowbar
  const handleCratesClick = () => {
    if (!crowbarFound) {
      setCrowbarFound(true);
      setInventory((prev) => [...prev, 'crowbar']);
      openModal('/assets/crowbar.png', 'You found a crowbar!');
    }
  };

  // 3. Chest → wire cutters (need crowbar)
  const handleChestClick = () => {
    if (!wireCutterFound && selectedItem === 'crowbar') {
      setWireCutterFound(true);
      setInventory((prev) => [...prev, 'wirecutter']);
      openModal('/assets/wirecutter.png', 'You found wire cutters!');
    }
  };

  // 4. Cables → turn electricity off (need wire cutters)
  const handleCablesClick = () => {
    if (!electricityOff && selectedItem === 'wirecutter') {
      setElectricityOff(true);
      openModal('', 'You cut the cables! The door lock is offline.');
    }
  };

  // 5. Door → either code input if electricity is on, or auto-unlock if off
  const handleDoorClick = () => {
    if (electricityOff) {
      // If power is off, lock is disabled
      setDoorUnlocked(true);
      openModal(
        '',
        'The door is unlocked with the electricity off! (Click outside to continue...)'
      );
    } else {
      // Show code input if electricity is on
      setShowCodeDialog(true);
    }
  };

  /* -----------------------
   *  Code Dialog
   * ----------------------- */
  const handleCloseCodeDialog = () => {
    setShowCodeDialog(false);
    setEnteredCode('');
  };

  const handleSubmitCode = () => {
    if (enteredCode === '2451') {
      // Correct code → unlock door
      setDoorUnlocked(true);
      setShowCodeDialog(false);
      setEnteredCode('');
      openModal(
        '',
        'Correct code! The door is unlocked. (Click outside to continue...)'
      );
    } else {
      // Wrong code
      alert('Wrong code! Try again.');
    }
  };

  /* -----------------------
   *  Advancing to Next Level
   * ----------------------- */
  useEffect(() => {
    // Once the modal is closed AND doorUnlocked is true, move on
    if (!modalVisible && doorUnlocked) {
      onComplete();
    }
  }, [modalVisible, doorUnlocked, onComplete]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/assets/background-level2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      {/* Inventory in top-right corner */}
      <div className="inventory-container">
        {inventory.map((item, idx) => (
          <div
            key={idx}
            className={`inventory-item ${selectedItem === item ? 'selected' : ''}`}
            onClick={() => handleSelectItem(item)}
          >
            <img src={`/assets/${item}.png`} alt={item} />
          </div>
        ))}
      </div>

      {/* Clickable hotspots */}
      <div
        className="clickable-zone"
        style={{ left: '55%', top: '90%', width: '15%', height: '5%' }}
        onClick={handlePapersClick}
        title="Scattered Papers"
      />
      <div
        className="clickable-zone"
        style={{ left: '17%', top: '55%', width: '14%', height: '21%' }}
        onClick={handleCratesClick}
        title="Crates"
      />
      <div
        className="clickable-zone"
        style={{ left: '76%', top: '42%', width: '15%', height: '35%' }}
        onClick={handleChestClick}
        title="Chest"
      />
      <div
        className="clickable-zone"
        style={{ left: '8%', top: '1%', width: '13%', height: '50%' }}
        onClick={handleCablesClick}
        title="Cables"
      />
      <div
        className="clickable-zone"
        style={{ left: '41%', top: '20%', width: '22%', height: '54%' }}
        onClick={handleDoorClick}
        title="Office Door"
      />

      {/* MODAL for found items or messages */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalImage && <img src={modalImage} alt="item" />}
            <div className="pixel-text">{modalText}</div>
            <div className="pixel-text">(Click outside to close)</div>
          </div>
        </div>
      )}

      {/* Code Dialog */}
      {showCodeDialog && (
        <div className="modal-overlay" onClick={handleCloseCodeDialog}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pixel-text">Enter 4-digit code:</div>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              maxLength={4}
              style={{
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '16px',
                width: '80px',
                marginTop: '10px',
                textAlign: 'center',
              }}
            />
            <br />
            <button
              onClick={handleSubmitCode}
              style={{
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '14px',
                margin: '10px',
              }}
            >
              Submit
            </button>
            <button
              onClick={handleCloseCodeDialog}
              style={{
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Level2;
