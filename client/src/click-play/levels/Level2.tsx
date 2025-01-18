import React, { useState } from 'react';

interface Level2Props {
    onComplete: () => void;
}

const Level2: React.FC<Level2Props> = ({ onComplete }) => {
    const [crowbarFound, setCrowbarFound] = useState(false);
    const [cutterFound, setCutterFound] = useState(false);

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

    const handleBoxesClick = () => {
        // Find crowbar
        if (!crowbarFound) {
            setCrowbarFound(true);
            setInventory((prev) => [...prev, 'crowbar']);
            openModal('/assets/crowbar.png', 'You found a crowbar!');
        }
    };

    const handleCrateClick = () => {
        // Open crate if crowbar is selected
        if (!cutterFound && selectedItem === 'crowbar') {
            setCutterFound(true);
            setInventory((prev) => [...prev, 'cutter']);
            openModal('/assets/cutter.png', 'You found wire cutters!');
        }
    };

    const handleDoorClick = () => {
        // Use cutter on door to complete level
        if (selectedItem === 'cutter') {
            alert('You cut the lock and can now exit the warehouse! Moving to Level 3...');
            onComplete();
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
                backgroundImage: 'url(/assets/background-level2.png)',
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

            {/* Boxes clickable */}
            <div
                className="clickable-zone"
                style={{ left: '15%', top: '60%', width: '10%', height: '10%' }}
                onClick={handleBoxesClick}
            />

            {/* Crate clickable */}
            <div
                className="clickable-zone"
                style={{ left: '50%', top: '50%', width: '10%', height: '15%' }}
                onClick={handleCrateClick}
            />

            {/* Door clickable */}
            <div
                className="clickable-zone"
                style={{ left: '80%', top: '30%', width: '10%', height: '30%' }}
                onClick={handleDoorClick}
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

export default Level2;
