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
  const img =
    type === 'health'
      ? 'assets/platformer/coin.png'
      : 'assets/platformer/health_1.png';
  return (
    <img
      src={img}
      className={styles.collectible}
      style={{ left: x, top: y, width, height }}
    />
  );
};

export default Collectible;
