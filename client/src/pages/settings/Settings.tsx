import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './settings.module.css';
import LanguageSwitch from '../../components/shell/LanguageSwitch';

const COLOUR_MODES = [
  { id: 'none', key: 'cvNone' },
  { id: 'deuteranopia', key: 'cvDeuteranopia' },
  { id: 'protanopia', key: 'cvProtanopia' },
  { id: 'tritanopia', key: 'cvTritanopia' },
  { id: 'achromatopsia', key: 'cvAchromatopsia' },
] as const;

const readStored = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const store = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* settings just won't persist */
  }
};

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const [colourMode, setColourMode] = useState(
    () => readStored('colorBlindMode') || 'none'
  );

  const chooseColourMode = (mode: string) => {
    setColourMode(mode);
    store('colorBlindMode', mode);
    // The SVG filters are defined once in App.tsx.
    document.documentElement.style.filter =
      mode === 'none' ? 'none' : `url(#${mode})`;
  };

  return (
    <main className={styles.settings}>
      <div className={styles.panel}>
        <Link to="/" className="shell-link">
          {t('general.home')}
        </Link>

        <h1 className={styles.title}>{t('settings.settings')}</h1>

        <section className={styles.group} aria-labelledby="settings-language">
          <h2 id="settings-language">{t('settings.language')}</h2>
          <LanguageSwitch />
        </section>

        <fieldset className={styles.group}>
          <legend>{t('settings.colourVision')}</legend>
          <p className={styles.help}>{t('settings.colourHelp')}</p>
          <div className={styles.choices}>
            {COLOUR_MODES.map((mode) => (
              <label key={mode.id} className={styles.choice}>
                <input
                  type="radio"
                  name="colour-mode"
                  value={mode.id}
                  checked={colourMode === mode.id}
                  onChange={() => chooseColourMode(mode.id)}
                />
                <span>{t(`settings.${mode.key}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <nav className={styles.links} aria-label={t('settings.more')}>
          <Link to="/login" className="shell-link">
            {t('settings.links.login')}
          </Link>
          <Link to="/credentials" className="shell-link">
            {t('settings.links.credentials')}
          </Link>
          <Link to="/legal" className="shell-link">
            {t('settings.links.legal')}
          </Link>
        </nav>
      </div>
    </main>
  );
};

export default SettingsPage;
