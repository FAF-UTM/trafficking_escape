import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../../context/AudioContext';

const Level3: React.FC = () => {
  const navigate = useNavigate();

  // Puzzle states
  const [shovelFound, setShovelFound] = useState(false);
  const [handleFound, setHandleFound] = useState(false);
  const [keyFound, setKeyFound] = useState(false);
  const [gateUnlocked, setGateUnlocked] = useState(false);

  // Inventory
  const [inventory, setInventory] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalText, setModalText] = useState('');

  const { playClick } = useAudio();

  // Opens a modal
  const openModal = (img: string, text: string) => {
    setModalImage(img);
    setModalText(text);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalImage('');
    setModalText('');
    setModalVisible(false);
  };

  // Check puzzle completion
  useEffect(() => {
    // If the gate is unlocked AND the modal just closed, go to Home
    if (!modalVisible && gateUnlocked) {
      navigate('/');
    }
  }, [modalVisible, gateUnlocked, navigate]);

  // The rest is the same puzzle logic
  const handleShedClick = () => {
    playClick(8);
    if (!shovelFound) {
      setShovelFound(true);
      setInventory((prev) => {
        const next = [...prev, 'shovel'];
        setSelectedItem('shovel');
        return next;
      });
      openModal('/assets/shovel.png', 'You found a shovel inside the shed!');
    }
  };

  const handleMoundClick = () => {
    playClick(8);
    if (!handleFound && selectedItem === 'shovel') {
      setHandleFound(true);
      setInventory((prev) => {
        const next = [...prev, 'metal-handle'];
        setSelectedItem('metal-handle');
        return next;
      });
      openModal(
        '/assets/metal-handle.png',
        'You dug up a makeshift metal handle!'
      );
    }
  };

  const handleBoxClick = () => {
    playClick(8);
    if (!keyFound && selectedItem === 'metal-handle') {
      setKeyFound(true);
      setInventory((prev) => {
        const next = [...prev, 'final-key'];
        setSelectedItem('final-key');
        return next;
      });
      openModal(
        '/assets/final-key.png',
        'You unlocked the metal box and found a key!'
      );
    }
  };

  const handleGateClick = () => {
    playClick(8);
    if (!gateUnlocked && selectedItem === 'final-key') {
      setGateUnlocked(true);
      openModal(
        '',
        'You opened the gate and escaped the courtyard! (Click outside to continue...)'
      );
    }
  };

  const handleSelectItem = (item: string) => {
    playClick(8);
    if (selectedItem === item) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/assets/background-level3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      {/* Inventory */}
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

      {/* Clickable areas */}
      <div
        className="clickable-zone"
        style={{ left: '72%', top: '70%', width: '8%', height: '20%' }}
        onClick={handleShedClick}
        title="Tool Shed"
      />
      <div
        className="clickable-zone"
        style={{ left: '19%', top: '80%', width: '20%', height: '15%' }}
        onClick={handleMoundClick}
        title="Mound of Dirt"
      />
      <div
        className="clickable-zone"
        style={{ left: '3%', top: '50%', width: '15%', height: '49%' }}
        onClick={handleBoxClick}
        title="Locked Metal Box"
      />
      <div
        className="clickable-zone"
        style={{ left: '35%', top: '49%', width: '22%', height: '30%' }}
        onClick={handleGateClick}
        title="Main Gate"
      />

      {/* Modal */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalImage && <img src={modalImage} alt="found item" />}
            <div className="pixel-text">{modalText}</div>
            <div className="pixel-text">(Click outside to close)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Level3;
