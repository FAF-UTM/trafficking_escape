import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePageExitOnIntro } from '../../components/shell/minigameChromeContext';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext';
import styles from './TrueFalseFlashCards.module.css';
import {
  CARDS_PER_RUN,
  POINTS_HIT,
  STREAK_BONUS,
  STREAK_BONUS_AT,
  type FlashCard,
} from './flashCards';
import { localizeFlashCards } from './localizeFlash';

type Phase = 'intro' | 'play' | 'end';
type FlipState = 'idle' | 'exit' | 'enter' | 'reveal';

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useCountUp = (target: number, duration = 520) => {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = target;
    if (from === target || reducedMotion()) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

interface TrueFalseFlashCardsProps {
  onComplete: () => void;
}

const TrueFalseFlashCards: React.FC<TrueFalseFlashCardsProps> = ({
  onComplete,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language;
  const { playClick } = useAudio();
  const screenRef = useRef<HTMLDivElement>(null);

  const cards = useMemo(
    () => localizeFlashCards(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-localize when language changes
    [t, lang]
  );
  const run = useMemo(
    () => shuffle(cards).slice(0, CARDS_PER_RUN),
    [cards]
  );
  const [phase, setPhase] = useState<Phase>('intro');
  usePageExitOnIntro(phase === 'intro');
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState<FlipState>('idle');
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const [burstKey, setBurstKey] = useState(0);

  const current: FlashCard | undefined = run[index];
  const shownScore = useCountUp(score);
  const maxScore =
    run.length * POINTS_HIT +
    Math.max(0, run.length - STREAK_BONUS_AT + 1) * STREAK_BONUS;
  const isCorrect = picked !== null && current && picked === current.answer;
  const answered = picked !== null;

  useEffect(() => {
    screenRef.current?.scrollTo({
      top: 0,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  }, [phase, index]);

  const start = () => {
    playClick(8);
    setPhase('play');
    setFlip(reducedMotion() ? 'idle' : 'enter');
    if (!reducedMotion()) {
      window.setTimeout(() => setFlip('idle'), 700);
    }
  };

  const answer = (value: boolean) => {
    if (answered || !current || flip === 'reveal') return;
    playClick(8);
    setPicked(value);
    const correct = value === current.answer;
    let gain = 0;
    if (correct) {
      const nextStreak = streak + 1;
      gain = POINTS_HIT;
      if (nextStreak >= STREAK_BONUS_AT) gain += STREAK_BONUS;
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setHits((h) => h + 1);
      setScore((s) => s + gain);
    } else {
      setStreak(0);
    }
    setLastGain(gain);
    setBurstKey((k) => k + 1);
    setFlip('reveal');
  };

  const next = () => {
    playClick(8);
    if (index >= run.length - 1) {
      setPhase('end');
      return;
    }
    const advance = () => {
      setIndex((i) => i + 1);
      setPicked(null);
      setLastGain(0);
      setFlip(reducedMotion() ? 'idle' : 'enter');
      if (!reducedMotion()) {
        window.setTimeout(() => setFlip('idle'), 700);
      }
    };
    if (reducedMotion()) {
      advance();
      return;
    }
    setFlip('exit');
    window.setTimeout(advance, 380);
  };

  if (phase === 'intro') {
    return (
      <div className={styles.screen} ref={screenRef}>
        <div className={styles.introLayout}>
          <section className={styles.intro} aria-labelledby="fc-intro-title">
            <p className={styles.kicker}>{t('flashCards.kicker')}</p>
            <h1 id="fc-intro-title" className={styles.introTitle}>
              {t('flashCards.introTitle')}
            </h1>
            <p className={styles.introText}>{t('flashCards.introText')}</p>
            <ol className={styles.introSteps}>
              {(['1', '2', '3'] as const).map((n, i) => (
                <li key={n} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.introStepNum}>{n}</span>
                  <span>
                    <strong>{t(`flashCards.introStep${n}Title`)}</strong>
                    {t(`flashCards.introStep${n}Text`)}
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.introNote}>
              {t('flashCards.introNote', {
                count: run.length,
                hit: POINTS_HIT,
                bonus: STREAK_BONUS,
                at: STREAK_BONUS_AT,
              })}
            </p>
            <button type="button" className="shell-button" onClick={start}>
              {t('flashCards.start')}
            </button>
          </section>

          <aside className={styles.preview} aria-hidden="true">
            <div className={styles.previewStack}>
              {(['a', 'b', 'c'] as const).map((id, i) => (
                <div
                  key={id}
                  className={styles.previewCard}
                  style={{ '--i': i } as React.CSSProperties}
                  data-tone={i === 1 ? 'true' : i === 2 ? 'false' : 'neutral'}
                >
                  <span className={styles.previewStamp}>
                    {i === 1
                      ? t('flashCards.true')
                      : i === 2
                        ? t('flashCards.false')
                        : t('flashCards.previewStamp')}
                  </span>
                  <p>{t(`flashCards.previewLine${i + 1}`)}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    const percent = maxScore ? score / maxScore : 0;
    const rank =
      percent >= 0.8 ? 'expert' : percent >= 0.5 ? 'sharp' : 'training';

    return (
      <div className={styles.screen} ref={screenRef}>
        <section className={styles.end} aria-labelledby="fc-end-title">
          <p className={styles.kicker}>{t('flashCards.endKicker')}</p>
          <h1 id="fc-end-title" className={styles.introTitle}>
            {t('flashCards.endTitle')}
          </h1>
          <div className={styles.rank} data-rank={rank}>
            <span className={styles.rankScore}>
              {shownScore}
              <small>/{maxScore}</small>
            </span>
            <span className={styles.rankName}>
              {t(`flashCards.rank_${rank}`)}
            </span>
          </div>
          <p className={styles.introText}>
            {t(`flashCards.rank_${rank}_text`, {
              hits,
              total: run.length,
              streak: bestStreak,
            })}
          </p>

          <h2 className={styles.sectionTitle}>{t('flashCards.fileTitle')}</h2>
          <ul className={styles.conceptList}>
            {run.map((card, i) => (
              <li key={card.id} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.conceptNum}>{i + 1}</span>
                <span>
                  <strong>{card.concept}</strong>
                  {card.explanation}
                </span>
              </li>
            ))}
          </ul>

          <section className={styles.safety} aria-labelledby="fc-safety">
            <h2 id="fc-safety" className={styles.sectionTitle}>
              {t('flashCards.safetyTitle')}
            </h2>
            <ol className={styles.safetySteps}>
              {(['1', '2', '3', '4'] as const).map((n) => (
                <li key={n}>{t(`flashCards.safety${n}`)}</li>
              ))}
            </ol>
            <p className={styles.helpline}>{t('flashCards.helpline')}</p>
          </section>

          <button type="button" className="shell-button" onClick={onComplete}>
            {t('flashCards.continue')}
          </button>
        </section>
      </div>
    );
  }

  if (!current) {
    return <div className={styles.screen} ref={screenRef} />;
  }

  return (
    <div className={styles.screen} ref={screenRef} data-streak={streak}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.sparkField} aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      <header className={styles.hud}>
        <div className={styles.hudCase}>
          <span className={styles.hudLabel}>
            {t('flashCards.cardOf', { n: index + 1, total: run.length })}
          </span>
          <span className={styles.hudTitle}>
            {answered ? current.concept : t('flashCards.hudClaim')}
          </span>
        </div>
        <ol className={styles.progress} aria-hidden="true">
          {run.map((c, i) => (
            <li
              key={c.id}
              data-state={i < index ? 'done' : i === index ? 'current' : 'todo'}
            />
          ))}
        </ol>
        <div className={styles.hudMeta}>
          <div
            className={styles.hudStreak}
            data-hot={streak >= STREAK_BONUS_AT}
          >
            <span className={styles.hudLabel}>{t('flashCards.streak')}</span>
            <span className={styles.hudStreakValue}>{streak}</span>
          </div>
          <div className={styles.hudScore}>
            <span className={styles.hudLabel}>{t('flashCards.score')}</span>
            <span className={styles.hudScoreValue}>{shownScore}</span>
          </div>
        </div>
      </header>

      <div className={styles.stage}>
        <div
          className={styles.cardScene}
          data-flip={flip}
          data-result={answered ? (isCorrect ? 'correct' : 'wrong') : undefined}
        >
          <div className={styles.cardInner}>
            <div className={styles.cardFace}>
              <p className={styles.cardEyebrow}>{t('flashCards.claimLabel')}</p>
              <p className={styles.cardSetup}>{current.setup}</p>
              <p className={styles.cardStatement}>{current.statement}</p>
              <p className={styles.cardHint}>{t('flashCards.claimHint')}</p>
            </div>
            <div className={styles.cardFaceBack} aria-live="polite">
              <p
                className={styles.resultStamp}
                data-result={isCorrect ? 'correct' : 'wrong'}
              >
                {isCorrect
                  ? t('flashCards.correct')
                  : t('flashCards.incorrect')}
              </p>
              {isCorrect && lastGain > 0 && (
                <p className={styles.gainPop}>
                  {t('flashCards.pointsGain', { points: lastGain })}
                  {streak >= STREAK_BONUS_AT && (
                    <span>{t('flashCards.streakTag')}</span>
                  )}
                </p>
              )}
              <p className={styles.answerLine}>
                {t('flashCards.truthWas', {
                  answer: current.answer
                    ? t('flashCards.true')
                    : t('flashCards.false'),
                })}
              </p>
              <p className={styles.conceptName}>{current.concept}</p>
              <p className={styles.explanation}>{current.explanation}</p>
              {current.trapNote && (
                <p className={styles.trapNote}>
                  <strong>{t('flashCards.trapLabel')}</strong>
                  {current.trapNote}
                </p>
              )}
            </div>
          </div>

          {answered && (
            <div
              key={burstKey}
              className={styles.burst}
              data-result={isCorrect ? 'correct' : 'wrong'}
              aria-hidden="true"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} style={{ '--i': i } as React.CSSProperties} />
              ))}
            </div>
          )}
        </div>

        {!answered ? (
          <div className={styles.choices}>
            <button
              type="button"
              className={styles.choiceTrue}
              onClick={() => answer(true)}
            >
              <span className={styles.choiceGlyph}>T</span>
              {t('flashCards.true')}
            </button>
            <button
              type="button"
              className={styles.choiceFalse}
              onClick={() => answer(false)}
            >
              <span className={styles.choiceGlyph}>F</span>
              {t('flashCards.false')}
            </button>
          </div>
        ) : (
          <button type="button" className="shell-button" onClick={next}>
            {index >= run.length - 1
              ? t('flashCards.seeResults')
              : t('flashCards.next')}
          </button>
        )}
      </div>
    </div>
  );
};

export default TrueFalseFlashCards;
