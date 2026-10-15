import React from 'react';

/** Tiny 16×16 pixel icons — drawn as hard squares, no soft curves. */
interface IconProps {
  size?: number;
  className?: string;
}

const PixelSvg: React.FC<
  IconProps & { children: React.ReactNode; label?: string }
> = ({ size = 18, className, children }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    shapeRendering="crispEdges"
    aria-hidden="true"
    style={{ imageRendering: 'pixelated' }}
  >
    {children}
  </svg>
);

const px = (x: number, y: number, w = 1, h = 1) => (
  <rect x={x} y={y} width={w} height={h} fill="currentColor" />
);

export const PixelExitIcon: React.FC<IconProps> = (props) => (
  <PixelSvg {...props}>
    {/* door frame */}
    {px(2, 2, 1, 12)}
    {px(3, 2, 5, 1)}
    {px(3, 13, 5, 1)}
    {px(7, 3, 1, 10)}
    {/* knob */}
    {px(5, 7, 1, 2)}
    {/* arrow out */}
    {px(9, 7, 4, 2)}
    {px(11, 5, 1, 1)}
    {px(12, 6, 1, 1)}
    {px(12, 9, 1, 1)}
    {px(11, 10, 1, 1)}
  </PixelSvg>
);

export const PixelGearIcon: React.FC<IconProps> = (props) => (
  <PixelSvg {...props}>
    {/* teeth */}
    {px(7, 1, 2, 2)}
    {px(7, 13, 2, 2)}
    {px(1, 7, 2, 2)}
    {px(13, 7, 2, 2)}
    {px(3, 3, 2, 2)}
    {px(11, 3, 2, 2)}
    {px(3, 11, 2, 2)}
    {px(11, 11, 2, 2)}
    {/* ring (hollow center) */}
    {px(5, 4, 6, 2)}
    {px(5, 10, 6, 2)}
    {px(4, 5, 2, 6)}
    {px(10, 5, 2, 6)}
  </PixelSvg>
);

export const PixelSoundOnIcon: React.FC<IconProps> = (props) => (
  <PixelSvg {...props}>
    {/* speaker body */}
    {px(2, 6, 2, 4)}
    {px(4, 5, 2, 6)}
    {px(6, 3, 2, 10)}
    {/* waves */}
    {px(10, 5, 1, 1)}
    {px(11, 6, 1, 1)}
    {px(12, 7, 1, 2)}
    {px(11, 9, 1, 1)}
    {px(10, 10, 1, 1)}
    {px(13, 4, 1, 1)}
    {px(14, 5, 1, 6)}
    {px(13, 11, 1, 1)}
  </PixelSvg>
);

export const PixelSoundOffIcon: React.FC<IconProps> = (props) => (
  <PixelSvg {...props}>
    {/* speaker */}
    {px(2, 6, 2, 4)}
    {px(4, 5, 2, 6)}
    {px(6, 3, 2, 10)}
    {/* mute X */}
    {px(10, 5, 1, 1)}
    {px(11, 6, 1, 1)}
    {px(12, 7, 1, 1)}
    {px(13, 8, 1, 1)}
    {px(14, 9, 1, 1)}
    {px(10, 9, 1, 1)}
    {px(11, 8, 1, 1)}
    {px(12, 9, 1, 1)}
    {px(13, 10, 1, 1)}
    {px(14, 5, 1, 1)}
    {px(13, 6, 1, 1)}
    {px(11, 10, 1, 1)}
    {px(10, 11, 1, 1)}
  </PixelSvg>
);

export const PixelHomeIcon: React.FC<IconProps> = (props) => (
  <PixelSvg {...props}>
    {/* roof */}
    {px(7, 2, 2, 1)}
    {px(5, 3, 6, 1)}
    {px(3, 4, 10, 1)}
    {px(2, 5, 12, 1)}
    {/* walls */}
    {px(3, 6, 1, 8)}
    {px(12, 6, 1, 8)}
    {px(3, 13, 10, 1)}
    {/* door */}
    {px(7, 9, 2, 4)}
    {/* window */}
    {px(5, 7, 2, 2)}
    {px(9, 7, 2, 2)}
  </PixelSvg>
);
