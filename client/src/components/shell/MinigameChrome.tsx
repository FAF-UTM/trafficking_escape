import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MinigameChromeProvider } from './minigameChromeContext';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MinigameSettingsMenu from './MinigameSettingsMenu';
import styles from './MinigameChrome.module.css';
import { useAudio } from '../../context/AudioContext';

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
  const { playClick } = useAudio();
  const [showPageExit, setShowPageExit] = useState(true);
  const [showSettings, setShowSettings] = useState(true);

  const exit = () => {
    playClick(3);
    onExit();
  };

  return (
    <MinigameChromeProvider value={{ setShowPageExit, setShowSettings }}>
      <div className={styles.root}>
        {(showPageExit || showSettings) && (
          <div className={styles.bar}>
            {showPageExit ? (
              <button
                type="button"
                className={`shell-button shell-button--quiet ${styles.exit}`}
                onClick={exit}
              >
                <LogoutRoundedIcon fontSize="small" />
                {t('minigameChrome.exit')}
              </button>
            ) : (
              <span className={styles.barSpacer} aria-hidden="true" />
            )}

            {showSettings && <MinigameSettingsMenu onExit={onExit} />}
          </div>
        )}

        <div className={styles.body}>{children}</div>
      </div>
    </MinigameChromeProvider>
  );
};

export default MinigameChrome;
