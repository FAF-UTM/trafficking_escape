import React, { createContext, useContext, useMemo, ReactNode } from 'react';

import s1 from '../components/sounds/1.wav';
import s2 from '../components/sounds/2.wav';
import s3 from '../components/sounds/3.wav';
import s4 from '../components/sounds/4.wav';
import s5 from '../components/sounds/5.wav';
import s6 from '../components/sounds/6.wav';
import s7 from '../components/sounds/7.wav';
import s8 from '../components/sounds/8.mp3';
import s9 from '../components/sounds/9.mp3';
import bg1 from '../components/sounds/bg1.mp3';
import bg2 from '../components/sounds/bg2.mp3';
import bg3 from '../components/sounds/bg3.mp3';
import bg4 from '../components/sounds/bg4.mp3';

const bgmMap: Record<number, string> = {
  1: bg1,
  2: bg2,
  3: bg3,
  4: bg4,
};

const defaultBgm = bgmMap[2];

const soundMap: Record<number, string> = {
  1: s1,
  2: s2,
  3: s3,
  4: s4,
  5: s5,
  6: s6,
  7: s7,
  8: s8,
  9: s9,
};

interface AudioAPI {
  playClick: (n?: number) => void;
  playMusic: () => void;
  stopMusic: () => void;
  changeMusic: (trackNumber: number) => void;
}

const AudioCtx = createContext<AudioAPI | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const clickAudio = useMemo(() => new Audio(), []);
  const bgmAudio = useMemo(() => {
    const a = new Audio(defaultBgm);
    a.loop = true;
    a.volume = 0.3;
    return a;
  }, []);

  const playClick = (n: number = 7) => {
    clickAudio.src = soundMap[n] || soundMap[7];
    clickAudio.play().catch(() => {});
  };

  const playMusic = () => {
    bgmAudio.play().catch(() => {});
  };

  const stopMusic = () => {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  };

  const changeMusic = (trackNumber: number) => {
    const newSrc = bgmMap[trackNumber] || defaultBgm;
    bgmAudio.pause();
    bgmAudio.src = newSrc;
    bgmAudio.load();
    bgmAudio.play().catch(() => {});
  };

  return (
    <AudioCtx.Provider value={{ playClick, playMusic, stopMusic, changeMusic }}>
      {children}
    </AudioCtx.Provider>
  );
};

export function useAudio(): AudioAPI {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('Missing AudioProvider');
  return ctx;
}
