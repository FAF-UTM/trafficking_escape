import React from 'react';
import styles from './ending.module.css';
import { useNavigate } from 'react-router-dom';

const Ending: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.ending}>
      <div className={styles.ending_title}>Game ended</div>
      <div className={styles.ending_subtitle}>
        Thank you for playing. <br /> Hope you enjoyed. We hope this experience
        was not only engaging but also enlightening. <br />
        Together, awareness is the first step toward prevention. <br />
        <b> Stay informed. Stay safe.</b>
      </div>

      <button onClick={() => navigate('/')} className={styles.ending_btn}>
        Go back Home
      </button>
    </div>
  );
};

export default Ending;
