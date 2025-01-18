import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Level3: React.FC = () => {
    const navigate = useNavigate();
    const [shovelFound, setShovelFound] = useState(false);
    const [keyFound, setKeyFound] = useState(false);
    const [inventory, setInventory] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState('');
    const [modalText, setModalText] = useState('');

    const openModal = (img: string, text: string) => {
        setModalImage(img);
        setModalText(text);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalImage('');
        setModalText('');
    };

    const handleShedClick = () => {
        if (!shovelFound) {
            setShovelFound(true);
            setInventory((prev) => [...prev, 'shovel']);
            openModal('/assets/shovel.png', 'You found a shovel!');
        }
    };

    const handleMoundClick = () => {
        if (!keyFound && selectedItem === 'shovel') {
            setKeyFound(true);
            setInventory((prev) => [...prev, 'courtyard-key']);
            openModal('/assets/courtyard-key.png', 'You found a hidden key!');
        }
    };

    const handleGateClick = () => {
        if (selectedItem === 'courtyard-key') {
            alert('You unlocked the gate. You’ve escaped captivity!');
            navigate('/chat'); // Redirect to chat
        }
    };

    const handleSelectInventoryItem = (item: string) => {
        setSelectedItem((prev) => (prev === item ? null : item));
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
            <div className="inventory-container">
                {inventory.map((item, idx) => (
                    <div
                        key={idx}
                        className={`inventory-item ${selectedItem === item ? 'selected' : ''}`}
                        onClick={() => handleSelectInventoryItem(item)}
                    >
                        <img src={`/assets/${item}.png`} alt={item} />
                    </div>
                ))}
            </div>

            {/* Tool shed clickable */}
            <div
                className="clickable-zone"
                style={{ left: '10%', top: '50%', width: '10%', height: '20%' }}
                onClick={handleShedClick}
            />

            {/* Mound of dirt clickable */}
            <div
                className="clickable-zone"
                style={{ left: '50%', top: '70%', width: '10%', height: '10%' }}
                onClick={handleMoundClick}
            />

            {/* Gate clickable */}
            <div
                className="clickable-zone"
                style={{ left: '80%', top: '30%', width: '10%', height: '40%' }}
                onClick={handleGateClick}
            />

            {modalVisible && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={modalImage} alt="found item" />
                        <div className="pixel-text">{modalText}</div>
                        <div className="pixel-text">(Click outside to close)</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Level3;
