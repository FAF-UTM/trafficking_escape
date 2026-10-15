import React, { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext';
import LanguageSwitch from './LanguageSwitch';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import styles from './MinigameChrome.module.css';

interface MinigameSettingsMenuProps {
  onExit: () => void;
  /** Extra class on the gear button (e.g. HUD placement). */
  gearClassName?: string;
}

/** Gear + dropdown: sound, language, home, exit. Usable in chrome bar or in-game HUD. */
const MinigameSettingsMenu: React.FC<MinigameSettingsMenuProps> = ({
  onExit,
  gearClassName,
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

  const exit = () => {
    click();
    setOpen(false);
    onExit();
  };

  return (
    <div className={styles.settingsWrap}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.gear}${gearClassName ? ` ${gearClassName}` : ''}`}
        aria-label={t('minigameChrome.settings')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          click();
          setOpen((v) => !v);
        }}
      >
        <SettingsRoundedIcon fontSize="small" />
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
            <SettingsRoundedIcon fontSize="inherit" />
            {t('minigameChrome.settings')}
          </p>

          <section className={styles.group}>
            <h2 className={styles.groupTitle}>{t('minigameChrome.sound')}</h2>
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
                <VolumeOffRoundedIcon fontSize="small" />
              ) : (
                <VolumeUpRoundedIcon fontSize="small" />
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

          <div className={styles.nav}>
            <button
              type="button"
              className={`shell-button shell-button--quiet ${styles.navBtn}`}
              onClick={() => {
                click();
                navigate('/');
              }}
            >
              <HomeRoundedIcon fontSize="small" />
              {t('minigameChrome.home')}
            </button>
            <button
              type="button"
              className={`shell-button shell-button--quiet ${styles.navBtn}`}
              onClick={exit}
            >
              <LogoutRoundedIcon fontSize="small" />
              {t('minigameChrome.exit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinigameSettingsMenu;
