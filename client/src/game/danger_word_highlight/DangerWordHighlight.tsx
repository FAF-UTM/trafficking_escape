import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PixelAvatar from '../../components/avatar/PixelAvatar';
import { useAudio } from '../../context/AudioContext';
import styles from './DangerWordHighlight.module.css';
import {
  CASES,
  CASES_PER_RUN,
  FALSE_ALARM_COST,
  HIT_POINTS,
  TACTICS,
  type DangerCase,
  type TacticId,
} from './dangerCases';

type Phase = 'intro' | 'flag' | 'reveal' | 'end';

type Verdict = 'hit' | 'miss' | 'falseAlarm' | 'clear';

interface CaseResult {
  hits: number;
  flagMax: number;
  falseAlarms: number;
  points: number;
}

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildRun = (): DangerCase[] => shuffle(CASES).slice(0, CASES_PER_RUN);

const flagCount = (c: DangerCase) => c.segments.filter((s) => s.flag).length;

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

interface DangerWordHighlightProps {
  onComplete: () => void;
}

const DangerWordHighlight: React.FC<DangerWordHighlightProps> = ({
  onComplete,
}) => {
  const { t } = useTranslation();
  const { playClick } = useAudio();
  const screenRef = useRef<HTMLDivElement>(null);

  const run = useMemo(() => buildRun(), []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set());
  const [results, setResults] = useState<CaseResult[]>([]);
  const [caught, setCaught] = useState<Set<TacticId>>(() => new Set());

  const current = run[index];
  const score = results.reduce((sum, r) => sum + r.points, 0);
  const totalMax = run.reduce((sum, c) => sum + flagCount(c) * HIT_POINTS, 0);
  const shownScore = useCountUp(score);

  useEffect(() => {
    screenRef.current?.scrollTo({
      top: 0,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  }, [phase, index]);

  const toggle = (i: number) => {
    if (phase !== 'flag') return;
    playClick(8);
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const lockFlags = () => {
    if (!current) return;
    playClick(8);
    let hits = 0;
    let falseAlarms = 0;
    const newly: TacticId[] = [];

    current.segments.forEach((seg, i) => {
      const selected = flagged.has(i);
      if (seg.flag && selected) {
        hits += 1;
        newly.push(seg.flag);
      } else if (!seg.flag && selected) {
        falseAlarms += 1;
      }
    });

    const flagMax = flagCount(current);
    const points = Math.max(
      0,
      hits * HIT_POINTS - falseAlarms * FALSE_ALARM_COST
    );

    setResults((prev) => [...prev, { hits, flagMax, falseAlarms, points }]);
    setCaught((prev) => {
      const next = new Set(prev);
      newly.forEach((id) => next.add(id));
      return next;
    });
    setPhase('reveal');
  };

  const nextCase = () => {
    playClick(8);
    if (index >= run.length - 1) {
      setPhase('end');
      return;
    }
    setIndex((i) => i + 1);
    setFlagged(new Set());
    setPhase('flag');
  };

  const start = () => {
    playClick(8);
    setPhase('flag');
  };

  const verdictFor = (i: number): Verdict => {
    const seg = current.segments[i];
    const selected = flagged.has(i);
    if (seg.flag && selected) return 'hit';
    if (seg.flag && !selected) return 'miss';
    if (!seg.flag && selected) return 'falseAlarm';
    return 'clear';
  };

  if (phase === 'intro') {
    return (
      <div className={styles.screen} ref={screenRef}>
        <div className={styles.introLayout}>
          <section className={styles.intro} aria-labelledby="dw-intro-title">
            <p className={styles.kicker}>{t('dangerWord.kicker')}</p>
            <h1 id="dw-intro-title" className={styles.introTitle}>
              {t('dangerWord.introTitle')}
            </h1>
            <p className={styles.introText}>{t('dangerWord.introText')}</p>
            <ol className={styles.introSteps}>
              {(['1', '2', '3'] as const).map((n, i) => (
                <li key={n} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.introStepNum}>{n}</span>
                  <span>
                    <strong>{t(`dangerWord.introStep${n}Title`)}</strong>
                    {t(`dangerWord.introStep${n}Text`)}
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.introNote}>
              {t('dangerWord.introNote', {
                count: run.length,
                hit: HIT_POINTS,
                cost: FALSE_ALARM_COST,
              })}
            </p>
            <button type="button" className="shell-button" onClick={start}>
              {t('dangerWord.start')}
            </button>
          </section>

          <aside className={styles.preview} aria-hidden="true">
            <div className={styles.previewPhone}>
              <p className={styles.previewLabel}>
                {t('dangerWord.previewLabel')}
              </p>
              <p className={styles.previewBubble}>
                <span data-flag>Secret party tonight</span>
                {' — free gifts. '}
                <span data-flag>Keep it between us</span>.
              </p>
              <ul className={styles.previewLegend}>
                <li data-tone="hit">{t('dangerWord.legendHit')}</li>
                <li data-tone="miss">{t('dangerWord.legendMiss')}</li>
                <li data-tone="false">{t('dangerWord.legendFalse')}</li>
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
      percent >= 0.85 ? 'expert' : percent >= 0.55 ? 'sharp' : 'training';
    const encountered = [
      ...new Set(
        run.flatMap((c) => c.segments.flatMap((s) => (s.flag ? [s.flag] : [])))
      ),
    ];

    return (
      <div className={styles.screen} ref={screenRef}>
        <section className={styles.end} aria-labelledby="dw-end-title">
          <p className={styles.kicker}>{t('dangerWord.endKicker')}</p>
          <h1 id="dw-end-title" className={styles.introTitle}>
            {t('dangerWord.endTitle')}
          </h1>
          <div className={styles.rank} data-rank={rank}>
            <span className={styles.rankScore}>
              {shownScore}
              <small>/{totalMax}</small>
            </span>
            <span className={styles.rankName}>
              {t(`dangerWord.rank_${rank}`)}
            </span>
          </div>
          <p className={styles.introText}>
            {t(`dangerWord.rank_${rank}_text`)}
          </p>

          <h2 className={styles.sectionTitle}>
            {t('dangerWord.fileTitle', {
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
                  {TACTICS[id].emoji}
                </span>
                <span className={styles.tacticName}>{TACTICS[id].name}</span>
                <span className={styles.tacticText}>
                  {TACTICS[id].description}
                </span>
                {!caught.has(id) && (
                  <span className={styles.tacticMissed}>
                    {t('dangerWord.missedTactic')}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <section className={styles.safety} aria-labelledby="dw-safety">
            <h2 id="dw-safety" className={styles.sectionTitle}>
              {t('dangerWord.safetyTitle')}
            </h2>
            <ol className={styles.safetySteps}>
              {(['1', '2', '3', '4'] as const).map((n) => (
                <li key={n}>{t(`dangerWord.safety${n}`)}</li>
              ))}
            </ol>
            <p className={styles.helpline}>{t('dangerWord.helpline')}</p>
          </section>

          <button type="button" className="shell-button" onClick={onComplete}>
            {t('dangerWord.continue')}
          </button>
        </section>
      </div>
    );
  }

  if (!current) {
    return <div className={styles.screen} ref={screenRef} />;
  }

  const result = results[index];
  const flagMax = flagCount(current);

  return (
    <div className={styles.screen} ref={screenRef}>
      <header className={styles.hud}>
        <div className={styles.hudCase}>
          <span className={styles.hudLabel}>
            {t('dangerWord.caseOf', {
              n: index + 1,
              total: run.length,
            })}
          </span>
          <span className={styles.hudTitle}>{current.title}</span>
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
          <span className={styles.hudLabel}>{t('dangerWord.score')}</span>
          <span className={styles.hudScoreValue}>{shownScore}</span>
        </div>
      </header>

      <div className={styles.layout} key={`${current.id}-${phase}`}>
        <section className={styles.phone} aria-label={`@${current.handle}`}>
          <div className={styles.profile}>
            <PixelAvatar
              seed={current.handle}
              size={48}
              className={styles.profileAvatar}
            />
            <div>
              <p className={styles.handle}>@{current.handle}</p>
              <p className={styles.setup}>{current.setup}</p>
            </div>
          </div>

          <div className={styles.bubble} data-phase={phase}>
            {current.segments.map((seg, i) => {
              const selected = flagged.has(i);
              const verdict = phase === 'reveal' ? verdictFor(i) : null;
              // Flag phrases, marked innocents, and longer neutral phrases (false-alarm bait).
              const canToggle =
                phase === 'flag' &&
                (Boolean(seg.flag) ||
                  Boolean(seg.clearNote) ||
                  seg.text.trim().split(/\s+/).length >= 2);

              return (
                <button
                  key={`${seg.text}-${i}`}
                  type="button"
                  className={styles.segment}
                  data-selected={selected || undefined}
                  data-verdict={verdict || undefined}
                  data-danger={seg.flag ? true : undefined}
                  disabled={!canToggle}
                  onClick={() => canToggle && toggle(i)}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {seg.text}
                  {phase === 'reveal' && seg.flag && (
                    <span className={styles.stamp}>
                      {TACTICS[seg.flag].emoji} {TACTICS[seg.flag].name}
                      {verdict === 'miss' ? ` · ${t('dangerWord.missed')}` : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="dw-task">
          {phase === 'flag' && (
            <>
              <h2 id="dw-task" className={styles.taskTitle}>
                {t('dangerWord.flagTitle')}
              </h2>
              <p className={styles.taskText}>{t('dangerWord.flagText')}</p>
              <p className={styles.taskHint}>{t('dangerWord.flagHint')}</p>
              <p className={styles.flagCount}>
                {t('dangerWord.flaggedCount', { count: flagged.size })}
              </p>
              <button
                type="button"
                className="shell-button"
                onClick={lockFlags}
              >
                {t('dangerWord.lockFlags')}
              </button>
            </>
          )}

          {phase === 'reveal' && result && (
            <>
              <h2 id="dw-task" className={styles.taskTitle}>
                {flagMax === 0
                  ? t('dangerWord.revealNoFlags')
                  : t('dangerWord.revealTitle', {
                      hits: result.hits,
                      total: result.flagMax,
                    })}
              </h2>
              <p className={styles.pointsLine}>
                {t('dangerWord.pointsThis', { points: result.points })}
              </p>
              {result.falseAlarms > 0 && (
                <p className={styles.falseLine}>
                  {t('dangerWord.falseAlarms', {
                    count: result.falseAlarms,
                  })}
                </p>
              )}

              <ul className={styles.legend}>
                <li data-tone="hit">{t('dangerWord.legendHit')}</li>
                <li data-tone="miss">{t('dangerWord.legendMiss')}</li>
                <li data-tone="false">{t('dangerWord.legendFalse')}</li>
              </ul>

              <ul className={styles.debriefList}>
                {current.segments.map((seg, i) => {
                  if (!seg.flag && !flagged.has(i)) return null;
                  const verdict = verdictFor(i);
                  if (verdict === 'clear') return null;
                  return (
                    <li key={i} data-verdict={verdict}>
                      <strong>“{seg.text.trim()}”</strong>
                      <span>
                        {seg.flag
                          ? seg.note
                          : seg.clearNote || t('dangerWord.notRedFlag')}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button type="button" className="shell-button" onClick={nextCase}>
                {index >= run.length - 1
                  ? t('dangerWord.seeResults')
                  : t('dangerWord.nextCase')}
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default DangerWordHighlight;
