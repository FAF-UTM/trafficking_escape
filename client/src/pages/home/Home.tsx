// src/pages/home/Home.tsx
import React from 'react';
import styles from './home.module.css';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme/theme';
import { useAudio } from '../../context/AudioContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { playClick } = useAudio();
  const { t } = useTranslation();
  return (
    <div className={styles.home_container}>
      <ThemeProvider theme={theme}>
        <div id={styles.home}>
          <div className={styles.home_button_container}>
            <Button
              component={Link}
              to="/intro"
              className={styles.home_button}
              variant="contained"
              onClick={() => playClick(3)}
            >
              {t('home.start')}
            </Button>
            <Button
              component={Link}
              to="/mini-games"
              className={styles.home_button}
              variant="contained"
              onClick={() => playClick(3)}
            >
              {t('home.games')}
            </Button>
            <Button
              component={Link}
              to="/settings"
              className={styles.home_button}
              variant="contained"
              onClick={() => playClick(3)}
            >
              {t('home.settings')}
            </Button>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Home;
