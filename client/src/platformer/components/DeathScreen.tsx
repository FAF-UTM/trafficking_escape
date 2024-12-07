// src/components/DeathScreen.tsx
import React from 'react';
import styles from '../Platformer.module.css';

interface DeathScreenProps {
    onRestart: () => void;
}

const DeathScreen: React.FC<DeathScreenProps> = ({ onRestart }) => {
    return (
        <div className={styles.gameOverScreen}>
            <h1>Game Over</h1>
            <button onClick={onRestart}>Restart</button>
        </div>
    );
};

export default DeathScreen;
