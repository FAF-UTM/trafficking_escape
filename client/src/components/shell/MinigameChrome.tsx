import React, { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext';
import LanguageSwitch from './LanguageSwitch';
import {
  PixelExitIcon,
  PixelGearIcon,
  PixelHomeIcon,
  PixelSoundOffIcon,
  PixelSoundOnIcon,
} from './pixelIcons';
import styles from './MinigameChrome.module.css';

interface MinigameChromeProps {
  children: React.ReactNode;
  /** Leave the current minigame (showcase → mini-games list, chat → chat). */
  onExit: () => void;
}

const MinigameChrome: React.FC<MinigameChromeProps> = ({
  children,
  onExit,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { playClick, muted, setMuted } = useAudio();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const click = () => playClick(3);

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <button
          type="button"
          className={`shell-button shell-button--quiet ${styles.exit}`}
          onClick={() => {
            click();
            onExit();
          }}
        >
          <PixelExitIcon size={18} />
          {t('minigameChrome.exit')}
        </button>

        <div className={styles.settingsWrap}>
          <button
            ref={buttonRef}
            type="button"
            className={styles.gear}
            aria-label={t('minigameChrome.settings')}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => {
              click();
              setOpen((v) => !v);
            }}
          >
            <PixelGearIcon size={20} />
          </button>

          {open && (
            <div
              ref={panelRef}
              id={panelId}
              className={styles.panel}
              role="dialog"
              aria-label={t('minigameChrome.settings')}
            >
              <p className={styles.panelTitle}>
                <PixelGearIcon size={16} />
                {t('minigameChrome.settings')}
              </p>

              <section className={styles.group}>
                <h2 className={styles.groupTitle}>
                  {t('minigameChrome.sound')}
                </h2>
                <button
                  type="button"
                  className={styles.toggle}
                  aria-pressed={muted}
                  onClick={() => {
                    click();
                    setMuted(!muted);
                  }}
                >
                  {muted ? (
                    <PixelSoundOffIcon size={18} />
                  ) : (
                    <PixelSoundOnIcon size={18} />
                  )}
                  {muted
                    ? t('minigameChrome.soundOff')
                    : t('minigameChrome.soundOn')}
                </button>
              </section>

              <section className={styles.group}>
                <h2 className={styles.groupTitle}>
                  {t('minigameChrome.language')}
                </h2>
                <LanguageSwitch />
              </section>

              <button
                type="button"
                className={`shell-button shell-button--quiet ${styles.home}`}
                onClick={() => {
                  click();
                  navigate('/');
                }}
              >
                <PixelHomeIcon size={18} />
                {t('minigameChrome.home')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.body}>{children}</div>
    </div>
  );
};

export default MinigameChrome;
