// src/components/Player.tsx
import React from 'react';
import styles from '../Platformer.module.css';

interface PlayerProps {
    x: number;
    y: number;
    width: number;
    height: number;
}

const Player: React.FC<PlayerProps> = ({ x, y, width, height }) => {
    return (
        <div
            className={styles.player}
            style={{ left: x, top: y, width, height }}
        ></div>
    );
};

export default Player;
