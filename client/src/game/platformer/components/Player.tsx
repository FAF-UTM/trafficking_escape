// src/components/Player.tsx
import React, { useEffect, useState } from 'react';
import styles from '../Platformer.module.css';

interface PlayerProps {
  x: number;
  y: number;
  width: number;
  height: number;
  state: 'idle' | 'walk' | 'jump' | 'sit';
  direction: 'left' | 'right';
}

const Player: React.FC<PlayerProps> = ({
  x,
  y,
  width,
  height,
  state,
  direction,
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (state === 'walk') {
      const interval = setInterval(() => {
        setFrame((prevFrame) => (prevFrame + 1) % 4); // Cycle between 0, 1, 2, 3 (4 frames)
      }, 100); // Adjust speed (in milliseconds) for faster or slower animation
      return () => clearInterval(interval);
    } else {
      setFrame(0); // Reset to first frame if not walking
    }
  }, [state]);

  // Determine the image source based on the player's state and frame
  const getPlayerImage = () => {
    switch (state) {
      case 'walk':
        return `/assets/platformer/Girl.sprite.walk.platformer.${frame}.png`; // Add frame number
      case 'jump':
        return '/assets/platformer/Girl.sprite.jump.platformer.png';
      case 'sit':
        return '/assets/platformer/Girl.sprite.sit.platformer.png';
      default:
        return '/assets/platformer/Girl_sprite_idle_platformer.png';
    }
  };

  return (
    <div
      className={styles.player}
      style={{
        left: x,
        top: y,
        width,
        height,
        backgroundImage: `url(${getPlayerImage()})`,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
        backgroundSize: 'cover',
      }}
    />
  );
};

export default Player;
