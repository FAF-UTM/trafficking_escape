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

/** Simple gear (same silhouette as the original chrome icon). */
export const PixelGearIcon: React.FC<IconProps> = ({
  size = 20,
  className,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.6.24-1.15.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.6a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.6.22l2.39-.96c.48.39 1.03.7 1.63.94l.36 2.54c.05.24.25.42.49.42h3.8c.24 0 .44-.18.49-.42l.36-2.54c.6-.24 1.15-.55 1.63-.94l2.39.96c.24.1.5 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"
    />
  </svg>
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

