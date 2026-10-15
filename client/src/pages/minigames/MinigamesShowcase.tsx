import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext.tsx';
import styles from './MinigamesShowcase.module.css';

type Accent = 'lamp' | 'coral' | 'screen' | 'leaf';

interface Minigame {
  id: string;
  route: string;
  accent: Accent;
  code: string;
}

const minigames: Minigame[] = [
  { id: 'click', route: '/click-play', accent: 'lamp', code: '01' },
  { id: 'timeline', route: '/timeline-puzzle', accent: 'screen', code: '02' },
  { id: 'emoji', route: '/emoji-story', accent: 'coral', code: '03' },
  { id: 'trust', route: '/who-to-trust', accent: 'leaf', code: '04' },
  { id: 'danger', route: '/danger-highlight', accent: 'coral', code: '05' },
  { id: 'choice', route: '/word-choice', accent: 'lamp', code: '06' },
  { id: 'scramble', route: '/word-scramble', accent: 'screen', code: '07' },
  { id: 'flash', route: '/true-false', accent: 'leaf', code: '08' },
];

const MinigamesShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { playClick } = useAudio();
  const { t } = useTranslation();

  return (
    <div className={styles.screen}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.gridGlow} aria-hidden="true" />

      <header className={styles.header}>
        <button
          type="button"
          className="shell-button shell-button--quiet"
          onClick={() => {
            playClick(3);
            navigate('/');
          }}
        >
          {t('general.home')}
        </button>
        <h1 className={styles.title}>{t('showcase.title')}</h1>
      </header>

      <ul className={styles.grid}>
        {minigames.map((game, index) => (
          <li
            key={game.id}
            className={styles.card}
            data-accent={game.accent}
            style={{ '--i': index } as React.CSSProperties}
          >
            <div className={styles.cardTop}>
              <span className={styles.code}>{game.code}</span>
              <span className={styles.accentDot} aria-hidden="true" />
            </div>
            <h2 className={styles.name}>
              {t(`showcase.games.${game.id}.name`)}
            </h2>
            <p className={styles.description}>
              {t(`showcase.games.${game.id}.description`)}
            </p>
            <button
              type="button"
              className={`shell-button ${styles.play}`}
              onClick={() => {
                playClick(3);
                navigate(game.route);
              }}
            >
              {t('showcase.play')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MinigamesShowcase;
