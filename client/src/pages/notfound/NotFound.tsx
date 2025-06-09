import React from 'react';
import styles from './NotFound.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={styles.notfound}>
      <div className={styles.notfound_title}>404 - Not Found</div>
      <div className={styles.notfound_subtitle}>
        {t('notfound.t1')} <br />
        {t('notfound.t2')}
      </div>
      <button onClick={() => navigate('/')} className={styles.notfound_btn}>
        {t('notfound.button')}
      </button>
    </div>
  );
};

export default NotFound;
