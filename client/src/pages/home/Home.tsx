import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './home.module.css';
import { useAudio } from '../../context/AudioContext';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitch from '../../components/shell/LanguageSwitch';

const Home: React.FC = () => {
  const { playClick } = useAudio();
  const { t } = useTranslation();
  const { isAuthenticated, role, username, logout } = useAuth();
  const click = () => playClick(3);

  const isPlayer = isAuthenticated && role === 'ROLE_USER';
  const isTeacher = isAuthenticated && role === 'ROLE_ADMIN';

  return (
    <main className={styles.home}>
      <div className={styles.topbar}>
        <LanguageSwitch />
      </div>

      <div className={styles.titleBlock}>
        <h1 className={styles.title}>
          <span>Trafficking</span>
          <span>Escape</span>
        </h1>
        <p className={styles.tagline}>{t('home.tagline')}</p>

        <nav className={styles.menu} aria-label="Main">
          {isPlayer ? (
            <Link to="/chat" className="shell-button" onClick={click}>
              {t('home.continue')}
            </Link>
          ) : (
            <Link to="/intro" className="shell-button" onClick={click}>
              {t('home.start')}
            </Link>
          )}

          <div className={styles.secondary}>
            {isPlayer && (
              <Link
                to="/intro"
                className="shell-button shell-button--quiet"
                onClick={click}
              >
                {t('home.start')}
              </Link>
            )}
            {isTeacher && (
              <Link
                to="/admin"
                className="shell-button shell-button--quiet"
                onClick={click}
              >
                {t('home.teacher')}
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="shell-button shell-button--quiet"
                onClick={click}
              >
                {t('home.signIn')}
              </Link>
            )}
            <Link
              to="/mini-games"
              className="shell-button shell-button--quiet"
              onClick={click}
            >
              {t('home.games')}
            </Link>
            <Link
              to="/settings"
              className="shell-button shell-button--quiet"
              onClick={click}
            >
              {t('home.settings')}
            </Link>
          </div>
        </nav>

        {isAuthenticated && (
          <p className={styles.session}>
            {t('home.signedInAs', { name: username })}{' '}
            <button type="button" className="shell-link" onClick={logout}>
              {t('home.signOut')}
            </button>
          </p>
        )}
      </div>
    </main>
  );
};

export default Home;
