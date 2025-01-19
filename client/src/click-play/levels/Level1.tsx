import React, { useState, useEffect } from 'react';

interface Level1Props {
    onComplete: () => void;
}

const Level1: React.FC<Level1Props> = ({ onComplete }) => {
    const [fileFound, setFileFound] = useState(false);
    const [keyFound, setKeyFound] = useState(false);

    const [inventory, setInventory] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // Modal logic
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState('');
    const [modalText, setModalText] = useState('');

    // Track if door is unlocked
    const [doorUnlocked, setDoorUnlocked] = useState(false);

    // Opens a modal with an image and text
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

    // Floorboard logic
    const handleFloorboardClick = () => {
        if (!fileFound) {
            setFileFound(true);
            setInventory((prev) => [...prev, 'file']);
            openModal('/assets/file.png', 'You found a file!');
        }
    };

    // Cupboard logic
    const handleCupboardClick = () => {
        if (!keyFound && selectedItem === 'file') {
            setKeyFound(true);
            setInventory((prev) => [...prev, 'key']);
            openModal('/assets/key.png', 'You found a key!');
        }
    };

    // Door logic
    const handleDoorClick = () => {
        if (selectedItem === 'key') {
            setDoorUnlocked(true);
            openModal('', 'You unlocked the door! (Click outside to continue...)');
        }
    };

    // After the modal closes, if door is unlocked, go to next level
    useEffect(() => {
        if (!modalVisible && doorUnlocked) {
            onComplete();
        }
    }, [modalVisible, doorUnlocked, onComplete]);

    // Note logic
    const handleNoteClick = () => {
        openModal('/assets/note.png', 'A note: "Check under the jacket. You’ll find what you need."');
    };

    const handleSelectInventoryItem = (item: string) => {
        setSelectedItem((prev) => (prev === item ? null : item));
    };

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/assets/background-level1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
            }}
        >
            {/* Inventory in top-right */}
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

            {/* Note clickable */}
            <div
                className="clickable-zone"
                style={{ left: '29.5%', top: '24%', width: '5%', height: '11%' }}
                onClick={handleNoteClick}
            />

            {/* Floorboard clickable */}
            <div
                className="clickable-zone"
                style={{ left: '80%', top: '90%', width: '20%', height: '7%' }}
                onClick={handleFloorboardClick}
            />

            {/* Cupboard clickable */}
            <div
                className="clickable-zone"
                style={{ left: '5%', top: '20%', width: '23%', height: '75%' }}
                onClick={handleCupboardClick}
            />

            {/* Door clickable */}
            <div
                className="clickable-zone"
                style={{ left: '39%', top: '10%', width: '23%', height: '84%' }}
                onClick={handleDoorClick}
            />

            {/* Modal */}
            {modalVisible && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {modalImage && <img src={modalImage} alt="item" />}
                        <div className="pixel-text">{modalText}</div>
                        <div className="pixel-text">(Click outside to close)</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Level1;
