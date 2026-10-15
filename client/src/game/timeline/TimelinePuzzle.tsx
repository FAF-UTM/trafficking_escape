import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePageExitOnIntro } from '../../components/shell/minigameChromeContext';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext';
import styles from './TimelinePuzzle.module.css';
import { LEVELS, type PuzzleCard } from './puzzleData';

/** Shared pixel-art backdrop for the whole timeline game. */
const TIMELINE_BG = '/assets/timeline/timeline_bg.jpg';

type Phase = 'intro' | 'play' | 'debrief' | 'end';

const POINTS_FIRST_TRY = 30;
const POINTS_RETRY = 15;

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

interface CardViewProps {
  card: PuzzleCard;
  label: string;
  locked?: boolean;
  dragging?: boolean;
  selected?: boolean;
  onSelect?: (card: PuzzleCard) => void;
  onDragStart?: (e: React.DragEvent, card: PuzzleCard) => void;
  onTouchStart?: (e: React.TouchEvent, card: PuzzleCard) => void;
}

const CardView: React.FC<CardViewProps> = ({
  card,
  label,
  locked,
  dragging,
  selected,
  onSelect,
  onDragStart,
  onTouchStart,
}) => (
  <button
    type="button"
    className={styles.card}
    data-locked={locked || undefined}
    data-dragging={dragging || undefined}
    data-selected={selected || undefined}
    draggable={!locked}
    disabled={locked}
    onClick={() => {
      if (!locked && onSelect) onSelect(card);
    }}
    onDragStart={
      locked || !onDragStart ? undefined : (e) => onDragStart(e, card)
    }
    onTouchStart={
      locked || !onTouchStart ? undefined : (e) => onTouchStart(e, card)
    }
    style={{ backgroundImage: `url(${card.image})` }}
    aria-pressed={selected || undefined}
  >
    <span className={styles.cardOverlay}>{label}</span>
    {locked && (
      <span className={styles.lockBadge} aria-hidden="true">
        ✓
      </span>
    )}
  </button>
);

interface TimelinePuzzleProps {
  onComplete?: () => void;
}

const TimelinePuzzle: React.FC<TimelinePuzzleProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { playClick } = useAudio();
  const screenRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>('intro');
  usePageExitOnIntro(phase === 'intro');
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [levelAttempts, setLevelAttempts] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ready'>('idle');
  const [lockedIds, setLockedIds] = useState<Set<number>>(() => new Set());

  const level = LEVELS[levelIndex];
  const [pool, setPool] = useState<PuzzleCard[]>([]);
  const [slots, setSlots] = useState<(PuzzleCard | null)[]>([]);

  const [dragCard, setDragCard] = useState<PuzzleCard | null>(null);
  const [selected, setSelected] = useState<PuzzleCard | null>(null);
  const [touchGhost, setTouchGhost] = useState<{
    card: PuzzleCard;
    x: number;
    y: number;
  } | null>(null);

  const shownScore = useCountUp(score);
  const filledCount = slots.filter(Boolean).length;
  const allFilled = filledCount === level.cards.length;
  const maxScore = LEVELS.length * POINTS_FIRST_TRY;

  const initLevel = (index: number) => {
    const next = LEVELS[index];
    setPool(shuffle([...next.cards]));
    setSlots(Array(next.cards.length).fill(null));
    setLockedIds(new Set());
    setLevelAttempts(0);
    setStatus('idle');
    setShakeWrong(false);
    setSelected(null);
  };

  useEffect(() => {
    initLevel(0);
  }, []);

  useEffect(() => {
    screenRef.current?.scrollTo({
      top: 0,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  }, [phase, levelIndex]);

  useEffect(() => {
    if (!touchGhost) return;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    const block = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', block, { passive: false });
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.removeEventListener('touchmove', block);
    };
  }, [touchGhost]);

  const placeInSlot = (card: PuzzleCard, slotIndex: number) => {
    if (lockedIds.has(card.id)) return;
    const occupant = slots[slotIndex];
    if (occupant && lockedIds.has(occupant.id)) return;

    playClick(7);
    const displaced = occupant && occupant.id !== card.id ? occupant : null;

    setSlots((prev) => {
      const next = prev.map((s) => (s?.id === card.id ? null : s));
      next[slotIndex] = card;
      return next;
    });
    setPool((prev) => {
      let next = prev.filter((c) => c.id !== card.id);
      if (displaced && !next.some((c) => c.id === displaced.id)) {
        next = [...next, displaced];
      }
      return next;
    });
    setSelected(null);
    setStatus('idle');
  };

  const selectCard = (card: PuzzleCard) => {
    if (lockedIds.has(card.id)) return;
    playClick(8);
    setSelected((prev) => (prev?.id === card.id ? null : card));
    setStatus('idle');
  };

  const returnToPool = (card: PuzzleCard) => {
    if (lockedIds.has(card.id)) return;
    playClick(7);
    setSlots((prev) => prev.map((s) => (s?.id === card.id ? null : s)));
    setPool((prev) =>
      prev.some((c) => c.id === card.id) ? prev : [...prev, card]
    );
    setSelected(null);
    setStatus('idle');
  };

  const handleDragStart = (e: React.DragEvent, card: PuzzleCard) => {
    if (lockedIds.has(card.id)) {
      e.preventDefault();
      return;
    }
    setDragCard(card);
    e.dataTransfer.setData('application/timeline-card', String(card.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const findCard = (id: number): PuzzleCard | null =>
    level.cards.find((c) => c.id === id) ??
    pool.find((c) => c.id === id) ??
    slots.find((s) => s?.id === id) ??
    null;

  const handleDropOnSlot = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('application/timeline-card'));
    const card = findCard(id) ?? dragCard;
    setDragCard(null);
    if (card) placeInSlot(card, slotIndex);
  };

  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('application/timeline-card'));
    const card = findCard(id) ?? dragCard;
    setDragCard(null);
    if (card) returnToPool(card);
  };

  const handleTouchStart = (e: React.TouchEvent, card: PuzzleCard) => {
    if (lockedIds.has(card.id)) return;
    e.preventDefault();
    const touch = e.touches[0];
    setTouchGhost({ card, x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchGhost) return;
    e.preventDefault();
    const touch = e.touches[0];
    setTouchGhost({ ...touchGhost, x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchGhost) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = elem?.closest('[data-slot]') as HTMLElement | null;
    const poolZone = elem?.closest('[data-pool]');
    if (zone) {
      placeInSlot(touchGhost.card, Number(zone.dataset.slot));
    } else if (poolZone) {
      returnToPool(touchGhost.card);
    }
    setTouchGhost(null);
  };

  const checkSolution = () => {
    playClick(3);
    if (!allFilled) {
      setStatus('ready');
      return;
    }

    const nextAttempt = levelAttempts + 1;
    setLevelAttempts(nextAttempt);
    setAttempts((a) => a + 1);

    let allCorrect = true;
    const newlyLocked = new Set(lockedIds);
    const wrong: PuzzleCard[] = [];
    const nextSlots = slots.map((slot, i) => {
      if (!slot) {
        allCorrect = false;
        return null;
      }
      if (slot.correctIndex === i) {
        newlyLocked.add(slot.id);
        return slot;
      }
      allCorrect = false;
      wrong.push(slot);
      return null;
    });

    if (allCorrect) {
      const earned = nextAttempt === 1 ? POINTS_FIRST_TRY : POINTS_RETRY;
      setScore((s) => s + earned);
      setLockedIds(newlyLocked);
      setPhase('debrief');
      return;
    }

    setLockedIds(newlyLocked);
    setSlots(nextSlots);
    setPool((prev) => {
      const ids = new Set(prev.map((c) => c.id));
      return [...prev, ...wrong.filter((c) => !ids.has(c.id))];
    });
    setStatus('wrong');
    setShakeWrong(true);
    window.setTimeout(() => setShakeWrong(false), reducedMotion() ? 0 : 500);
  };

  const resetLevel = () => {
    playClick(3);
    initLevel(levelIndex);
  };

  const continueAfterDebrief = () => {
    playClick(8);
    if (levelIndex + 1 >= LEVELS.length) {
      setPhase('end');
      return;
    }
    const next = levelIndex + 1;
    setLevelIndex(next);
    initLevel(next);
    setPhase('play');
  };

  const start = () => {
    playClick(8);
    setPhase('play');
  };

  const slotLabels = useMemo(() => {
    const n = level.cards.length;
    return Array.from({ length: n }, (_, i) => {
      if (i === 0) return t('timelinePuzzle.first');
      if (i === n - 1) return t('timelinePuzzle.last');
      return t('timelinePuzzle.stepN', { n: i + 1 });
    });
  }, [level.cards.length, t]);

  if (phase === 'intro') {
    return (
      <div
        className={`${styles.screen} ${styles.shellScreen}`}
        ref={screenRef}
        data-phase="intro"
      >
        <div className={styles.introLayout}>
          <section className={styles.intro} aria-labelledby="tp-intro-title">
            <p className={styles.kicker}>{t('timelinePuzzle.kicker')}</p>
            <h1 id="tp-intro-title" className={styles.introTitle}>
              {t('timelinePuzzle.introTitle')}
            </h1>
            <p className={styles.introText}>{t('timelinePuzzle.introText')}</p>
            <ol className={styles.introSteps}>
              {(['1', '2', '3'] as const).map((n, i) => (
                <li key={n} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.introStepNum}>{n}</span>
                  <span>
                    <strong>{t(`timelinePuzzle.introStep${n}Title`)}</strong>
                    {t(`timelinePuzzle.introStep${n}Text`)}
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.introNote}>
              {t('timelinePuzzle.introNote', { count: LEVELS.length })}
            </p>
            <button type="button" className="shell-button" onClick={start}>
              {t('timelinePuzzle.start')}
            </button>
          </section>

          <aside className={styles.preview} aria-hidden="true">
            <div className={styles.previewCard}>
              <div className={styles.previewCardGlow} />
              <p className={styles.previewCardKicker}>
                {t('timelinePuzzle.previewKicker')}
              </p>
              <h2 className={styles.previewCardTitle}>
                {t('timelinePuzzle.previewTitle')}
              </h2>
              <ol className={styles.previewSlots}>
                {(['first', 'mid', 'last'] as const).map((slot, i) => (
                  <li
                    key={slot}
                    className={styles.previewSlot}
                    style={{ '--i': i } as React.CSSProperties}
                    data-slot={slot}
                  >
                    <span className={styles.previewSlotLabel}>
                      {slot === 'mid'
                        ? '…'
                        : t(
                            slot === 'first'
                              ? 'timelinePuzzle.first'
                              : 'timelinePuzzle.last'
                          )}
                    </span>
                    <span className={styles.previewSlotBody}>?</span>
                  </li>
                ))}
              </ol>
              <div className={styles.previewDeck}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={styles.previewDeckCard}
                    style={{ '--i': i } as React.CSSProperties}
                  />
                ))}
              </div>
              <p className={styles.previewCardNote}>
                {t('timelinePuzzle.previewNote')}
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    const percent = maxScore ? score / maxScore : 0;
    const rank =
      percent >= 0.85 ? 'expert' : percent >= 0.55 ? 'sharp' : 'training';

    return (
      <div
        className={`${styles.screen} ${styles.shellScreen}`}
        ref={screenRef}
        data-phase="end"
      >
        <section className={styles.end} aria-labelledby="tp-end-title">
          <p className={styles.kicker}>{t('timelinePuzzle.endKicker')}</p>
          <h1 id="tp-end-title" className={styles.introTitle}>
            {t('timelinePuzzle.endTitle')}
          </h1>
          <div className={styles.rank} data-rank={rank}>
            <span className={styles.rankScore}>
              {shownScore}
              <small>/{maxScore}</small>
            </span>
            <span className={styles.rankName}>
              {t(`timelinePuzzle.rank_${rank}`)}
            </span>
          </div>
          <p className={styles.introText}>
            {t(`timelinePuzzle.rank_${rank}_text`, { attempts })}
          </p>

          <ul className={styles.lessonList}>
            {LEVELS.map((lvl, i) => (
              <li key={lvl.id} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.lessonNum}>{lvl.levelNumber}</span>
                <span>
                  <strong>{t(lvl.titleKey)}</strong>
                  {t(lvl.lessonKey)}
                </span>
              </li>
            ))}
          </ul>

          <section className={styles.safety} aria-labelledby="tp-safety">
            <h2 id="tp-safety" className={styles.sectionTitle}>
              {t('timelinePuzzle.safetyTitle')}
            </h2>
            <ol className={styles.safetySteps}>
              {(['1', '2', '3', '4'] as const).map((n) => (
                <li key={n}>{t(`timelinePuzzle.safety${n}`)}</li>
              ))}
            </ol>
            <p className={styles.helpline}>{t('timelinePuzzle.helpline')}</p>
          </section>

          <button
            type="button"
            className="shell-button"
            onClick={() => onComplete?.()}
          >
            {t('timelinePuzzle.continue')}
          </button>
        </section>
      </div>
    );
  }

  if (phase === 'debrief') {
    const earned = levelAttempts === 1 ? POINTS_FIRST_TRY : POINTS_RETRY;
    return (
      <div className={styles.screen} ref={screenRef} data-phase="debrief">
        <div
          className={styles.bg}
          style={{ backgroundImage: `url(${TIMELINE_BG})` }}
          aria-hidden="true"
        />
        <div className={styles.veil} aria-hidden="true" />
        <section className={styles.debrief} aria-labelledby="tp-debrief-title">
          <p className={styles.kicker}>
            {t('timelinePuzzle.levelOf', {
              n: level.levelNumber,
              total: LEVELS.length,
            })}
          </p>
          <h1 id="tp-debrief-title" className={styles.introTitle}>
            {t('timelinePuzzle.debriefTitle')}
          </h1>
          <p className={styles.debriefPoints}>
            {t('timelinePuzzle.debriefPoints', { points: earned })}
          </p>
          <p className={styles.introText}>{t(level.lessonKey)}</p>
          <ol className={styles.solvedRail}>
            {level.cards
              .slice()
              .sort((a, b) => a.correctIndex - b.correctIndex)
              .map((card, i) => (
                <li key={card.id} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.solvedNum}>{i + 1}</span>
                  <div
                    className={styles.solvedThumb}
                    style={{ backgroundImage: `url(${card.image})` }}
                  />
                  <span>{t(card.textKey)}</span>
                </li>
              ))}
          </ol>
          <button
            type="button"
            className="shell-button"
            onClick={continueAfterDebrief}
          >
            {levelIndex + 1 >= LEVELS.length
              ? t('timelinePuzzle.seeResults')
              : t('timelinePuzzle.nextLevel')}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div
      className={styles.screen}
      ref={screenRef}
      data-phase="play"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${TIMELINE_BG})` }}
        aria-hidden="true"
      />
      <div className={styles.veil} aria-hidden="true" />

      <header className={styles.hud}>
        <div className={styles.hudCase}>
          <span className={styles.hudLabel}>
            {t('timelinePuzzle.levelOf', {
              n: level.levelNumber,
              total: LEVELS.length,
            })}
          </span>
          <span className={styles.hudTitle}>{t(level.titleKey)}</span>
        </div>
        <ol className={styles.progress} aria-hidden="true">
          {LEVELS.map((lvl, i) => (
            <li
              key={lvl.id}
              data-state={
                i < levelIndex ? 'done' : i === levelIndex ? 'current' : 'todo'
              }
            />
          ))}
        </ol>
        <div className={styles.hudScore}>
          <span className={styles.hudLabel}>{t('timelinePuzzle.score')}</span>
          <span className={styles.hudScoreValue} aria-live="polite">
            {shownScore}
          </span>
        </div>
      </header>

      <p className={styles.brief}>{t(level.descriptionKey)}</p>

      <section
        className={styles.pool}
        data-pool
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnPool}
        aria-label={t('timelinePuzzle.poolLabel')}
      >
        <div className={styles.poolHead}>
          <h2 className={styles.sectionLabel}>
            {t('timelinePuzzle.poolLabel')}
          </h2>
          <span className={styles.poolHint}>
            {t('timelinePuzzle.poolHint')}
          </span>
        </div>
        <ul className={styles.poolCards} role="list">
          {pool.map((card, i) => (
            <li key={card.id} style={{ '--i': i } as React.CSSProperties}>
              <CardView
                card={card}
                label={t(card.textKey)}
                selected={selected?.id === card.id}
                dragging={
                  dragCard?.id === card.id || touchGhost?.card.id === card.id
                }
                onSelect={selectCard}
                onDragStart={handleDragStart}
                onTouchStart={handleTouchStart}
              />
            </li>
          ))}
          {pool.length === 0 && (
            <li className={styles.poolEmpty}>
              {t('timelinePuzzle.poolEmpty')}
            </li>
          )}
        </ul>
      </section>

      <section
        className={styles.rail}
        aria-label={t('timelinePuzzle.railLabel')}
        data-shake={shakeWrong || undefined}
      >
        <div className={styles.railHead}>
          <h2 className={styles.sectionLabel}>
            {t('timelinePuzzle.railLabel')}
          </h2>
          <span className={styles.railArrow} aria-hidden="true">
            {t('timelinePuzzle.first')} → {t('timelinePuzzle.last')}
          </span>
        </div>
        <ol className={styles.slots}>
          {slots.map((slot, idx) => {
            const locked = !!(slot && lockedIds.has(slot.id));
            return (
              <li
                key={idx}
                className={styles.slot}
                data-slot={idx}
                data-filled={!!slot || undefined}
                data-locked={locked || undefined}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnSlot(e, idx)}
                onClick={() => {
                  if (selected) placeInSlot(selected, idx);
                }}
              >
                <span className={styles.slotLabel}>{slotLabels[idx]}</span>
                {slot ? (
                  <CardView
                    card={slot}
                    label={t(slot.textKey)}
                    locked={locked}
                    selected={selected?.id === slot.id}
                    dragging={
                      dragCard?.id === slot.id ||
                      touchGhost?.card.id === slot.id
                    }
                    onSelect={selectCard}
                    onDragStart={handleDragStart}
                    onTouchStart={handleTouchStart}
                  />
                ) : (
                  <div
                    className={styles.slotEmpty}
                    data-target={selected ? true : undefined}
                  >
                    <span>{idx + 1}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <div className={styles.actions}>
        {status === 'wrong' && (
          <p className={styles.status} data-tone="wrong" role="status">
            {t('timelinePuzzle.incorrect')}
          </p>
        )}
        {status === 'ready' && !allFilled && (
          <p className={styles.status} data-tone="warn" role="status">
            {t('timelinePuzzle.fillAll')}
          </p>
        )}
        <div className={styles.actionRow}>
          <button
            type="button"
            className="shell-button shell-button--quiet"
            onClick={resetLevel}
          >
            {t('timelinePuzzle.reset')}
          </button>
          <button
            type="button"
            className="shell-button"
            onClick={checkSolution}
            disabled={!allFilled}
          >
            {t('timelinePuzzle.check')}
          </button>
        </div>
        <p className={styles.filledNote}>
          {t('timelinePuzzle.filled', {
            filled: filledCount,
            total: level.cards.length,
          })}
        </p>
      </div>

      {touchGhost && (
        <div
          className={styles.ghost}
          style={{
            backgroundImage: `url(${touchGhost.card.image})`,
            left: touchGhost.x - 110,
            top: touchGhost.y - 48,
          }}
          aria-hidden="true"
        >
          <span className={styles.cardOverlay}>
            {t(touchGhost.card.textKey)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TimelinePuzzle;
