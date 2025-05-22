import styles from './home.module.css';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme/theme.ts';

const Home: React.FC = () => {
  return (
    <div className={styles.home_container}>
      <ThemeProvider theme={theme}>
        <div id={styles.home}>
          <div className={styles.home_button_container}>
            <Button
              className={styles.home_button}
              variant="contained"
              href="/intro"
            >
              Start Game
            </Button>
            <Button
              className={styles.home_button}
              variant="contained"
              href="/mini-games"
            >
              Mini Games
            </Button>
            <Button
              className={styles.home_button}
              variant="contained"
              href="/settings"
            >
              Settings
            </Button>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Home;
