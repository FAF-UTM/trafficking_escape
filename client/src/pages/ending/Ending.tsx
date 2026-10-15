import React from 'react';
import styles from './ending.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Ending: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className={styles.ending}>
      <section className={styles.card} aria-labelledby="ending-title">
        <p className={styles.eyebrow}>{t('ending.title')}</p>
        <h1 id="ending-title" className={styles.title}>
          {t('ending.subtitle_1')}
        </h1>
        <p className={styles.body}>{t('ending.subtitle_2')}</p>
        <p className={styles.body}>{t('ending.subtitle_3')}</p>
        <p className={styles.motto}>{t('ending.subtitle_4')}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className="shell-button"
            onClick={() => navigate('/feedback')}
          >
            {t('ending.feedback_button')}
          </button>
          <button
            type="button"
            className="shell-button shell-button--quiet"
            onClick={() => navigate('/')}
          >
            {t('ending.button')}
          </button>
        </div>
      </section>
    </main>
  );
};

export default Ending;
