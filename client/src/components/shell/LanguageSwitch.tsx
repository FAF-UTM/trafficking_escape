import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './languageSwitch.module.css';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'nl', label: 'NL', name: 'Nederlands' },
];

/** Two-option language toggle, shown on pages kids land on first. */
const LanguageSwitch: React.FC = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div className={styles.switch} role="group" aria-label={t('home.language')}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          lang={lang.code}
          aria-label={lang.name}
          aria-pressed={current === lang.code}
          className={styles.option}
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitch;
