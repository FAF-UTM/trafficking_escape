import React from 'react';
import styles from './ending.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Ending: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={styles.ending}>
      <div className={styles.ending_title}>{t('ending.title')}</div>
      <div className={styles.ending_subtitle}>
        {t('ending.subtitle_1')} <br />
        {t('ending.subtitle_2')} <br />
        {t('ending.subtitle_3')} <br />
        <b>{t('ending.subtitle_4')}</b>
      </div>
      <div className={styles.button_row}>
        <button onClick={() => navigate('/')} className={styles.ending_btn}>
          {t('ending.button')}
        </button>
        <button
          onClick={() => navigate('/feedback')}
          className={styles.ending_btn}
        >
          {t('ending.feedback_button')}
        </button>
      </div>
    </div>
  );
};

export default Ending;
