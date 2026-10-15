import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import * as pixelArt from '@dicebear/pixel-art';

interface PixelAvatarProps {
  /** Same seed, same face: chats are seeded by contact name so a face never changes. */
  seed: string;
  size?: number;
  className?: string;
}

// Light tints of the shell palette so faces read against the dusk background.
const BACKGROUNDS = ['ffd9cf', 'bfe8f6', 'ffe2b3', 'c4ead6', 'd6dcf2'];

const PixelAvatar: React.FC<PixelAvatarProps> = ({
  seed,
  size = 48,
  className,
}) => {
  const src = useMemo(
    () =>
      createAvatar(pixelArt, {
        seed,
        backgroundColor: BACKGROUNDS,
      }).toDataUri(),
    [seed]
  );

  return (
    <img
      className={className}
      src={src}
      width={size}
      height={size}
      alt=""
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default PixelAvatar;
