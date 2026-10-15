import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePageExitOnIntro } from '../../components/shell/minigameChromeContext';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext';
import styles from './WordChoiceGame.module.css';
import {
  POINTS_CORRECT,
  QUESTIONS_PER_RUN,
  type TacticId,
  type WordCase,
  type WordOption,
} from './wordCases';
import {
  localizeWordChoiceCases,
  localizeWordChoiceTactics,
} from './localizeWordChoice';

type Phase = 'intro' | 'question' | 'feedback' | 'end';

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildRun = (pool: WordCase[]): WordCase[] =>
  shuffle(pool)
    .slice(0, QUESTIONS_PER_RUN)
    .map((c) => ({ ...c, options: shuffle(c.options) }));

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useCountUp = (target: number, duration = 600) => {
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

const SentenceBlank: React.FC<{
  sentence: string;
  filled?: string | null;
  tone?: 'idle' | 'correct' | 'wrong';
}> = ({ sentence, filled = null, tone = 'idle' }) => {
  const parts = sentence.split('___');
  return (
    <p className={styles.sentence}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <span
              className={styles.blank}
              data-tone={tone}
              data-filled={!!filled}
            >
              {filled ?? '····'}
            </span>
          )}
        </React.Fragment>
      ))}
    </p>
  );
};

interface WordChoiceGameProps {
  onComplete: () => void;
}

const WordChoiceGame: React.FC<WordChoiceGameProps> = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language;
  const { playClick } = useAudio();
  const screenRef = useRef<HTMLDivElement>(null);

  const tactics = useMemo(
    () => localizeWordChoiceTactics(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-localize when language changes
    [t, lang]
  );
  const cases = useMemo(
    () => localizeWordChoiceCases(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-localize when language changes
    [t, lang]
  );
  const run = useMemo(() => buildRun(cases), [cases]);
  const [phase, setPhase] = useState<Phase>('intro');
  usePageExitOnIntro(phase === 'intro');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [caught, setCaught] = useState<Set<TacticId>>(() => new Set());

  const shownScore = useCountUp(score);
  const current = run[index];
  const totalMax = run.length * POINTS_CORRECT;
  const pickedOption: WordOption | null =
    picked !== null && current ? current.options[picked] : null;
  const correctOption = current?.options.find((o) => o.correct) ?? null;

  useEffect(() => {
    screenRef.current?.scrollTo({
      top: 0,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  }, [phase, index]);

  const start = () => {
    playClick(8);
    setPhase('question');
  };

  const pick = (optionIndex: number) => {
    if (phase !== 'question' || !current) return;
    playClick(8);
    const option = current.options[optionIndex];
    setPicked(optionIndex);
    if (option.correct) {
      setScore((s) => s + POINTS_CORRECT);
      setCorrectCount((c) => c + 1);
      setCaught((prev) => new Set(prev).add(current.tactic));
    }
    setPhase('feedback');
  };

  const next = () => {
    playClick(8);
    if (index >= run.length - 1) {
      setPhase('end');
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setPhase('question');
  };

  if (phase === 'intro') {
    return (
      <div className={styles.screen} ref={screenRef}>
        <div className={styles.introLayout}>
          <section className={styles.intro} aria-labelledby="wc-intro-title">
            <p className={styles.kicker}>{t('wordChoice.kicker')}</p>
            <h1 id="wc-intro-title" className={styles.introTitle}>
              {t('wordChoice.introTitle')}
            </h1>
            <p className={styles.introText}>{t('wordChoice.introText')}</p>
            <ol className={styles.introSteps}>
              {(['1', '2', '3'] as const).map((n, i) => (
                <li key={n} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.introStepNum}>{n}</span>
                  <span>
                    <strong>{t(`wordChoice.introStep${n}Title`)}</strong>
                    {t(`wordChoice.introStep${n}Text`)}
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.introNote}>
              {t('wordChoice.introNote', {
                count: run.length,
                points: POINTS_CORRECT,
              })}
            </p>
            <button type="button" className="shell-button" onClick={start}>
              {t('wordChoice.start')}
            </button>
          </section>

          <aside className={styles.preview} aria-hidden="true">
            <div className={styles.previewCard}>
              <p className={styles.previewLabel}>
                {t('wordChoice.previewLabel')}
              </p>
              <p className={styles.previewContext}>
                {t('wordChoice.previewContext')}
              </p>
              <p className={styles.previewSentence}>
                {t('wordChoice.previewBefore')}
                <span className={styles.blank} data-tone="idle">
                  ····
                </span>
                {t('wordChoice.previewAfter')}
              </p>
              <ul className={styles.previewOptions}>
                {(
                  [
                    ['secrecy', 'best'],
                    ['privacy', 'wrong'],
                    ['independence', 'dim'],
                  ] as const
                ).map(([word, state], i) => (
                  <li
                    key={word}
                    data-state={state}
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    <span className={styles.choiceKey}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    const percent = totalMax ? score / totalMax : 0;
    const rank =
      percent >= 0.85 ? 'expert' : percent >= 0.6 ? 'sharp' : 'training';
    const encountered = [...new Set(run.map((c) => c.tactic))];

    return (
      <div className={styles.screen} ref={screenRef}>
        <section className={styles.end} aria-labelledby="wc-end-title">
          <p className={styles.kicker}>{t('wordChoice.endKicker')}</p>
          <h1 id="wc-end-title" className={styles.introTitle}>
            {t('wordChoice.endTitle')}
          </h1>
          <div className={styles.rank} data-rank={rank}>
            <span className={styles.rankScore}>
              {shownScore}
              <small>/{totalMax}</small>
            </span>
            <span className={styles.rankName}>
              {t(`wordChoice.rank_${rank}`)}
            </span>
          </div>
          <p className={styles.introText}>
            {t(`wordChoice.rank_${rank}_text`, {
              correct: correctCount,
              total: run.length,
            })}
          </p>

          <h2 className={styles.sectionTitle}>
            {t('wordChoice.fileTitle', {
              caught: encountered.filter((id) => caught.has(id)).length,
              total: encountered.length,
            })}
          </h2>
          <ul className={styles.tacticGrid}>
            {encountered.map((id, i) => (
              <li
                key={id}
                className={styles.tacticCard}
                data-caught={caught.has(id)}
                style={{ '--i': i } as React.CSSProperties}
              >
                <span className={styles.tacticEmoji} aria-hidden="true">
                  {tactics[id].emoji}
                </span>
                <span className={styles.tacticName}>{tactics[id].name}</span>
                <span className={styles.tacticText}>
                  {tactics[id].description}
                </span>
                {!caught.has(id) && (
                  <span className={styles.tacticMissed}>
                    {t('wordChoice.missedTactic')}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <section className={styles.safety} aria-labelledby="wc-safety">
            <h2 id="wc-safety" className={styles.sectionTitle}>
              {t('wordChoice.safetyTitle')}
            </h2>
            <ol className={styles.safetySteps}>
              {(['1', '2', '3', '4'] as const).map((n) => (
                <li key={n}>{t(`wordChoice.safety${n}`)}</li>
              ))}
            </ol>
            <p className={styles.helpline}>{t('wordChoice.helpline')}</p>
          </section>

          <button type="button" className="shell-button" onClick={onComplete}>
            {t('wordChoice.continue')}
          </button>
        </section>
      </div>
    );
  }

  if (!current) {
    return <div className={styles.screen} ref={screenRef} />;
  }

  const blankTone =
    phase === 'feedback'
      ? pickedOption?.correct
        ? 'correct'
        : 'wrong'
      : 'idle';
  const blankFilled =
    phase === 'feedback'
      ? pickedOption?.correct
        ? pickedOption.word
        : correctOption?.word
      : null;

  return (
    <div className={styles.screen} ref={screenRef}>
      <header className={styles.hud}>
        <div className={styles.hudCase}>
          <span className={styles.hudLabel}>
            {t('wordChoice.questionOf', {
              n: index + 1,
              total: run.length,
            })}
          </span>
          <span className={styles.hudTitle}>
            {t(`wordChoice.phase_${phase}`)}
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
        <div className={styles.hudScore}>
          <span className={styles.hudLabel}>{t('wordChoice.score')}</span>
          <span className={styles.hudScoreValue} aria-live="polite">
            {shownScore}
          </span>
        </div>
      </header>

      <div className={styles.layout} key={`${current.id}-${phase}`}>
        <section className={styles.card} aria-labelledby="wc-q-title">
          <p className={styles.context}>{current.context}</p>
          <h2 id="wc-q-title" className={styles.taskTitle}>
            {phase === 'question'
              ? t('wordChoice.pickTitle')
              : pickedOption?.correct
                ? t('wordChoice.correct', { points: POINTS_CORRECT })
                : t('wordChoice.incorrect')}
          </h2>

          <SentenceBlank
            sentence={current.sentence}
            filled={blankFilled}
            tone={blankTone}
          />

          {phase === 'question' && (
            <ol className={styles.choices}>
              {current.options.map((option, i) => (
                <li
                  key={option.word}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className={styles.choice}
                    onClick={() => pick(i)}
                  >
                    <span className={styles.choiceKey} aria-hidden="true">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={styles.choiceWord}>{option.word}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}

          {phase === 'feedback' && pickedOption && (
            <div
              className={styles.feedback}
              data-correct={pickedOption.correct || undefined}
            >
              <p className={styles.feedbackText}>{pickedOption.feedback}</p>
              {!pickedOption.correct && correctOption && (
                <p className={styles.feedbackAnswer}>
                  {t('wordChoice.rightAnswer', { word: correctOption.word })}
                </p>
              )}
              <div className={styles.tacticChip}>
                <span aria-hidden="true">{tactics[current.tactic].emoji}</span>
                {tactics[current.tactic].name}
              </div>
              <button type="button" className="shell-button" onClick={next}>
                {index >= run.length - 1
                  ? t('wordChoice.seeResults')
                  : t('wordChoice.next')}
              </button>
            </div>
          )}
        </section>

        <aside className={styles.side} aria-label={t('wordChoice.tipsLabel')}>
          <p className={styles.sideKicker}>{t('wordChoice.tipsLabel')}</p>
          <ul className={styles.tips}>
            <li>{t('wordChoice.tip1')}</li>
            <li>{t('wordChoice.tip2')}</li>
            <li>{t('wordChoice.tip3')}</li>
          </ul>
          {phase === 'feedback' && (
            <div
              className={styles.sideResult}
              data-correct={pickedOption?.correct || undefined}
            >
              <span className={styles.sideResultLabel}>
                {pickedOption?.correct
                  ? t('wordChoice.sideHit')
                  : t('wordChoice.sideMiss')}
              </span>
              <span className={styles.sideResultScore}>
                {pickedOption?.correct ? `+${POINTS_CORRECT}` : '+0'}
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default WordChoiceGame;
