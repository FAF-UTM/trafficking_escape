// src/components/Obstacle.tsx
import React from 'react';
import styles from '../Platformer.module.css';

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  element: string;
}

const Obstacle: React.FC<ObstacleProps> = ({
  x,
  y,
  width,
  height,
  element,
}) => {
  return (
    <img
      src={element}
      className={styles.obstacle}
      style={{ left: x, top: y, width, height }}
    />
  );
};

export default Obstacle;
