import React, { useEffect, useState } from 'react';

import styles from './settings.module.css';
import { Link } from 'react-router-dom';
import i18n from '../../i18n.tsx';
import { t } from 'i18next';

const SettingsPage: React.FC = () => {
  const [selectedLanguage, setselectedLanguage] = useState('');

  const toggleLanguage = (lang: string | undefined) => {
    i18n.changeLanguage(lang);
    // setselectedLanguage(lang);
  };
  const [mode, setMode] = useState('');

  const toggleMode = (mode: string | undefined) => {
    if (!mode) return;
    setMode(mode);
    localStorage.setItem('mode', mode);
  };

  useEffect(() => {
    setselectedLanguage(i18n.language); // or your default lang
    const savedMode = localStorage.getItem('mode') || 'light';
    setMode(savedMode);
  }, []);

  return (
    <div className={styles.settings}>

      <div className={styles.settings_container}>
        <Link to={'/'} className={styles.back_home}>
          <svg
            fill="none"
            height="10"
            viewBox="0 0 14 10"
            width="14"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M0.25066 4.99997C0.25066 4.80106 0.329678 4.61029 0.47033 4.46964C0.610983 4.32899 0.801748 4.24997 1.00066 4.24997L11.1907 4.24997L8.47066 1.52997C8.33818 1.38779 8.26606 1.19975 8.26948 1.00545C8.27291 0.811145 8.35162 0.62576 8.48904 0.488347C8.62645 0.350934 8.81184 0.272222 9.00614 0.268794C9.20044 0.265365 9.38849 0.337489 9.53066 0.469969L13.5307 4.46997C13.6711 4.61059 13.75 4.80122 13.75 4.99997C13.75 5.19872 13.6711 5.38934 13.5307 5.52997L9.53066 9.52997C9.38849 9.66245 9.20044 9.73457 9.00614 9.73114C8.81184 9.72772 8.62645 9.649 8.48904 9.51159C8.35162 9.37418 8.27291 9.18879 8.26948 8.99449C8.26606 8.80019 8.33818 8.61214 8.47066 8.46997L11.1907 5.74997L1.00066 5.74997C0.801748 5.74997 0.610983 5.67095 0.47033 5.5303C0.329678 5.38965 0.25066 5.19888 0.25066 4.99997Z"
              fill="#212A55"
              fill-rule="evenodd"
            ></path>
          </svg>
          {t('general.home')}
        </Link>
          <div className={styles.settings_card}>
          <div className={styles.settings_title}>{t('settings.settings')}</div>
          <div className={styles.settings_inside}>
            <div className={styles.settings_inside_lang}>
              <div className={styles.settings_inside_lang_title}>
                {t('settings.language')}:
              </div>
              <div className={styles.settings_inside_lang_types}>
                <div
                  className={`${styles.settings_inside_lang_types_btn} ${selectedLanguage == 'nl' && styles.settings_inside_lang_types_btn_selected}`}
                  onClick={() => toggleLanguage('nl')}
                >
                  NL
                </div>
                <div
                  className={`${styles.settings_inside_lang_types_btn} ${selectedLanguage == 'en' && styles.settings_inside_lang_types_btn_selected}`}
                  onClick={() => toggleLanguage('en')}
                >
                  EN
                </div>
              </div>
            </div>
            <div className={styles.settings_inside_lang}>
              <div className={styles.settings_inside_lang_title}>
                {t('settings.mode')}:
              </div>

              <div className={styles.settings_inside_lang_types}>
                <div
                  className={`${styles.settings_inside_lang_types_btn} ${mode === 'light' && styles.settings_inside_lang_types_btn_selected}`}
                  onClick={() => toggleMode('light')}
                >
                  Light
                </div>
                <div
                  className={`${styles.settings_inside_lang_types_btn} ${mode === 'dark' && styles.settings_inside_lang_types_btn_selected}`}
                  onClick={() => toggleMode('dark')}
                >
                  Dark
                </div>
                <div
                  className={`${styles.settings_inside_lang_types_btn} ${mode === 'contrast' && styles.settings_inside_lang_types_btn_selected}`}
                  onClick={() => toggleMode('contrast')}
                >
                  Contrast
                </div>
              </div>
            </div>
            <div
              className={`${styles.settings_inside_links} ${styles.settings_inside_links_first_of_type} `}
            >
              <Link to={'/login'} className={styles.settings_inside_links_btn}>
                Login
              </Link>
              <Link
                to={'/credentials'}
                className={styles.settings_inside_links_btn}
              >
                Credentials
              </Link>
            </div>
            <div className={styles.settings_inside_links}>
              <Link to={'/login'} className={styles.settings_inside_links_btn}>
                Documentation
              </Link>
              <Link
                to={'/credentials'}
                className={styles.settings_inside_links_btn}
              >
                Development
              </Link>
              <Link
                to={'/credentials'}
                className={styles.settings_inside_links_btn}
              >
                Legal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
