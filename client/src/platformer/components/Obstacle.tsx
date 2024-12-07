// src/components/Obstacle.tsx
import React from 'react';
import styles from '../Platformer.module.css';

interface ObstacleProps {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

const Obstacle: React.FC<ObstacleProps> = ({
                                               x,
                                               y,
                                               width,
                                               height,
                                               color,
                                           }) => {
    return (
        <div
            className={styles.obstacle}
            style={{ left: x, top: y, width, height, backgroundColor: color }}
        ></div>
    );
};

export default Obstacle;
