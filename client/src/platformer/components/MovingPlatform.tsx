// src/components/MovingPlatform.tsx
import React from 'react';
import styles from '../Platformer.module.css';

interface MovingPlatformProps {
    x: number;
    y: number;
    width: number;
    height: number;
}

const MovingPlatform: React.FC<MovingPlatformProps> = ({
                                                           x,
                                                           y,
                                                           width,
                                                           height,
                                                       }) => {
    return (
        <div
            className={styles.movingPlatform}
            style={{ left: x, top: y, width, height }}
        ></div>
    );
};

export default MovingPlatform;
