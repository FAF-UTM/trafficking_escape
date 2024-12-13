// src/components/Platform.tsx
import React from 'react';
import styles from '../Platformer.module.css';

interface PlatformProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Platform: React.FC<PlatformProps> = ({ x, y, width, height }) => {
  return (
    <div
      className={styles.platform}
      style={{ left: x, top: y, width, height }}
    ></div>
  );
};

export default Platform;
