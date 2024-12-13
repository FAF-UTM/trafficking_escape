// src/components/Collectible.tsx
import React from 'react';
import styles from '../Platformer.module.css';

interface CollectibleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'health' | 'score';
}

const Collectible: React.FC<CollectibleProps> = ({
  x,
  y,
  width,
  height,
  type,
}) => {
  const color = type === 'health' ? 'red' : 'yellow';
  return (
    <div
      className={styles.collectible}
      style={{ left: x, top: y, width, height, backgroundColor: color }}
    ></div>
  );
};

export default Collectible;
