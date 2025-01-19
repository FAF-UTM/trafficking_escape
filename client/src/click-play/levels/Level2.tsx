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

    // Inventory
    const [inventory, setInventory] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // Modal / Message states
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState('');
    const [modalText, setModalText] = useState('');

    // Code input dialog
    const [showCodeDialog, setShowCodeDialog] = useState(false);
    const [enteredCode, setEnteredCode] = useState('');

    // Helper to open general item/info modals
    const openModal = (img: string, text: string) => {
        setModalImage(img);
        setModalText(text);
        setModalVisible(true);
    };

    const closeModal = () => {
        // Clear modal states
        setModalImage('');
        setModalText('');
        setModalVisible(false);
    };

    // Check if a "door unlocked" message was just closed, then move on
    useEffect(() => {
        // Only run if the modal was closed (modalVisible === false),
        // and the modal text had "door is unlocked" before closing.
        if (!modalVisible && modalText.includes('door is unlocked')) {
            onComplete();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalVisible]);

    // Hotspot Interactions
    // 1. Scattered papers → pick up note
    const handlePapersClick = () => {
        if (!noteFound) {
            setNoteFound(true);
            // Add the note to inventory
            setInventory((prev) => [...prev, 'note2']);
            openModal('/assets/note2.png', 'You found a note! It says: "2451"');
        }
    };

    // 2. Stack of crates → find crowbar
    const handleCratesClick = () => {
        if (!crowbarFound) {
            setCrowbarFound(true);
            setInventory((prev) => [...prev, 'crowbar']);
            openModal('/assets/crowbar.png', 'You found a crowbar!');
        }
    };

    // 3. Chest → use crowbar to open it and find wire cutters
    const handleChestClick = () => {
        if (!wireCutterFound && selectedItem === 'crowbar') {
            setWireCutterFound(true);
            setInventory((prev) => [...prev, 'wirecutter']);
            openModal('/assets/wirecutter.png', 'You found wire cutters!');
        }
    };

    // 4. Electric cables → use wire cutters to turn electricity off
    const handleCablesClick = () => {
        if (!electricityOff && selectedItem === 'wirecutter') {
            setElectricityOff(true);
            openModal('', 'You cut the cables! The door lock is offline.');
        }
    };

    // 5. Office door → either ask for code or auto-unlock if electricity is off
    const handleDoorClick = () => {
        if (electricityOff) {
            // If power is off, the lock is disabled
            openModal('', 'The door is unlocked with the electricity off!');
            return;
        }
        // Otherwise, show a code input
        setShowCodeDialog(true);
    };

    // Code Dialog Handling
    const handleCloseCodeDialog = () => {
        setShowCodeDialog(false);
        setEnteredCode('');
    };

    const handleSubmitCode = () => {
        if (enteredCode === '2451') {
            // Correct code
            setShowCodeDialog(false);
            setEnteredCode('');
            openModal('', 'Correct code! The door is unlocked.');
        } else {
            // Wrong code
            alert('Wrong code! Try again.');
        }
    };

    // Inventory Handling
    const handleSelectItem = (item: string) => {
        // If the user clicks the same item, deselect it
        if (selectedItem === item) {
            setSelectedItem(null);
            return;
        }

        setSelectedItem(item);

        // If the user selected the note, show the note again
        if (item === 'note2') {
            openModal('/assets/note2.png', 'The note reads: "2451"');
        }
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
