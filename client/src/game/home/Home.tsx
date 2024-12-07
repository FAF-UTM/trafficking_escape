import styles from './home.module.css';
import { Button } from '@mui/material';
const Home: React.FC = () => {
  return (
    <div id={styles.home}>
      <div className={styles.home_button_container}>
        <Button className={styles.home_button} variant="contained" href="/chat">
          Start Game
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
  );
};

export default Home;
