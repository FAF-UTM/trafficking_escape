import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePageExitOnIntro } from '../../components/shell/minigameChromeContext';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext';
import styles from './WordScrambleGame.module.css';
import {
  CASES_PER_RUN,
  HINT_COST,
  POINTS_MOVE_BEST,
  POINTS_MOVE_PARTLY,
  POINTS_SOLVE,
  WRONG_COST,
  type MoveOption,
  type ScrambleCase,
} from './scrambleCases';
import { localizeScrambleCases } from './localizeScramble';

type Phase = 'intro' | 'build' | 'move' | 'debrief' | 'end';

interface Tile {
  id: string;
  letter: string;
}

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makePool = (c: ScrambleCase): Tile[] => {
  const letters = (c.answer + c.decoys).split('');
  let tiles = shuffle(
    letters.map((letter, i) => ({ id: `${c.id}-${i}-${letter}`, letter }))
  );
  if (tiles.map((t) => t.letter).join('') === c.answer) tiles = shuffle(tiles);
  return tiles;
};

const buildRun = (pool: ScrambleCase[]): ScrambleCase[] =>
  shuffle(pool)
    .slice(0, CASES_PER_RUN)
    .map((c) => ({
      ...c,
      move: { ...c.move, options: shuffle(c.move.options) },
    }));

const emptySlots = (n: number): (Tile | null)[] => Array(n).fill(null);

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

interface WordScrambleGameProps {
  onComplete: () => void;
}

const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language;
  const { playClick } = useAudio();
  const screenRef = useRef<HTMLDivElement>(null);

  const cases = useMemo(
    () => localizeScrambleCases(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-localize when language changes
    [t, lang]
  );
  const run = useMemo(() => buildRun(cases), [cases]);
  const [phase, setPhase] = useState<Phase>('intro');
  usePageExitOnIntro(phase === 'intro');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [solved, setSolved] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const [locked, setLocked] = useState<Set<number>>(() => new Set());
  const [shake, setShake] = useState(false);
  const [movePick, setMovePick] = useState<number | null>(null);
  const [solvePoints, setSolvePoints] = useState(0);
  const [movePoints, setMovePoints] = useState(0);

  const current = run[index];
  const [pool, setPool] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<(Tile | null)[]>([]);

  const shownScore = useCountUp(score);
  const maxScore = run.length * (POINTS_SOLVE + POINTS_MOVE_BEST);
  const filledCount = slots.filter(Boolean).length;

  const resetBoard = (c: ScrambleCase) => {
    setPool(makePool(c));
    setSlots(emptySlots(c.answer.length));
    setHintUsed(false);
    setWrongTries(0);
    setLocked(new Set());
    setMovePick(null);
    setSolvePoints(0);
    setMovePoints(0);
    setShake(false);
  };

  useEffect(() => {
    if (current) resetBoard(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  useEffect(() => {
    screenRef.current?.scrollTo({
      top: 0,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  }, [phase, index]);

  const firstEmpty = () => slots.findIndex((s) => !s);

  const addTile = (tile: Tile) => {
    if (phase !== 'build') return;
    const at = firstEmpty();
    if (at < 0) return;
    playClick(7);
    setPool((p) => p.filter((x) => x.id !== tile.id));
    setSlots((prev) => {
      const next = [...prev];
      next[at] = tile;
      return next;
    });
  };

  const removeFromSlot = (slotIndex: number) => {
    if (phase !== 'build' || locked.has(slotIndex)) return;
    const tile = slots[slotIndex];
    if (!tile) return;
    playClick(7);
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setPool((p) => [...p, tile]);
  };

  const clearSlots = () => {
    if (phase !== 'build') return;
    playClick(3);
    const returning: Tile[] = [];
    setSlots((prev) =>
      prev.map((tile, i) => {
        if (!tile || locked.has(i)) return tile;
        returning.push(tile);
        return null;
      })
    );
    if (returning.length) setPool((p) => [...p, ...returning]);
  };

  const reshufflePool = () => {
    playClick(3);
    setPool((p) => shuffle(p));
  };

  const useHint = () => {
    if (phase !== 'build' || hintUsed || !current) return;

    let target = -1;
    for (let i = 0; i < current.answer.length; i++) {
      if (!locked.has(i)) {
        target = i;
        break;
      }
    }
    if (target < 0) return;

    const need = current.answer[target];
    playClick(8);
    setHintUsed(true);

    const next = [...slots];
    let nextPool = [...pool];

    const occupant = next[target];
    if (occupant && occupant.letter !== need) {
      nextPool.push(occupant);
      next[target] = null;
    }

    if (!next[target] || next[target]!.letter !== need) {
      const fromPool = nextPool.findIndex((t) => t.letter === need);
      if (fromPool >= 0) {
        next[target] = nextPool[fromPool];
        nextPool = nextPool.filter((_, i) => i !== fromPool);
      } else {
        const fromSlot = next.findIndex(
          (t, i) => t && t.letter === need && i !== target && !locked.has(i)
        );
        if (fromSlot >= 0) {
          next[target] = next[fromSlot];
          next[fromSlot] = null;
        }
      }
    }

    setSlots(next);
    setPool(nextPool);
    setLocked((prev) => new Set(prev).add(target));
  };

  const checkWord = () => {
    if (phase !== 'build' || !current) return;
    if (slots.some((s) => !s)) return;

    const guess = slots.map((s) => s!.letter).join('');
    playClick(3);

    if (guess === current.answer) {
      // Wrong-try penalties already docked the running score; hint only lowers this award.
      const earned = Math.max(5, POINTS_SOLVE - (hintUsed ? HINT_COST : 0));
      setSolvePoints(earned);
      setScore((s) => s + earned);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setSolved((list) => [...list, current.answer]);
      setPhase('move');
      return;
    }

    setWrongTries((w) => w + 1);
    setStreak(0);
    setScore((s) => Math.max(0, s - WRONG_COST));
    setShake(true);
    window.setTimeout(() => setShake(false), reducedMotion() ? 0 : 450);
  };

  const pickMove = (optionIndex: number) => {
    if (movePick !== null || !current) return;
    playClick(8);
    const option = current.move.options[optionIndex];
    setMovePick(optionIndex);
    let earned = 0;
    if (option.score === 2) earned = POINTS_MOVE_BEST;
    else if (option.score === 1) earned = POINTS_MOVE_PARTLY;
    setMovePoints(earned);
    if (earned) setScore((s) => s + earned);
    window.setTimeout(() => setPhase('debrief'), reducedMotion() ? 0 : 650);
  };

  const nextCase = () => {
    playClick(8);
    if (index >= run.length - 1) {
      setPhase('end');
      return;
    }
    setIndex((i) => i + 1);
    setPhase('build');
  };

  const start = () => {
    playClick(8);
    setPhase('build');
  };

  useEffect(() => {
    if (phase !== 'build' || !current) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!slots.some((s) => !s)) checkWord();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        for (let i = slots.length - 1; i >= 0; i--) {
          if (slots[i] && !locked.has(i)) {
            removeFromSlot(i);
            return;
          }
        }
        return;
      }
      const letter = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(letter)) return;
      const tile = pool.find((t) => t.letter === letter);
      if (tile) addTile(tile);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pool, slots, locked, current]);

  if (phase === 'intro') {
    return (
      <div className={styles.screen} ref={screenRef}>
        <div className={styles.introLayout}>
          <section className={styles.intro} aria-labelledby="ws-intro-title">
            <p className={styles.kicker}>{t('wordScramble.kicker')}</p>
            <h1 id="ws-intro-title" className={styles.introTitle}>
              {t('wordScramble.introTitle')}
            </h1>
            <p className={styles.introText}>{t('wordScramble.introText')}</p>
            <ol className={styles.introSteps}>
              {(['1', '2', '3', '4'] as const).map((n, i) => (
                <li key={n} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.introStepNum}>{n}</span>
                  <span>
                    <strong>{t(`wordScramble.introStep${n}Title`)}</strong>
                    {t(`wordScramble.introStep${n}Text`)}
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.introNote}>
              {t('wordScramble.introNote', { count: run.length })}
            </p>
            <button type="button" className="shell-button" onClick={start}>
              {t('wordScramble.start')}
            </button>
          </section>
          <aside className={styles.preview} aria-hidden="true">
            <div className={styles.previewCard}>
              <p className={styles.previewLabel}>
                {t('wordScramble.previewLabel')}
              </p>
              <p className={styles.previewContext}>
                {t('wordScramble.previewContext')}
              </p>
              <div className={styles.previewTiles}>
                {'CKBLO'.split('').map((letter, i) => (
                  <span
                    key={`p-${i}`}
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <div className={styles.previewSlots}>
                {'BLOCK'.split('').map((letter, i) => (
                  <span
                    key={`s-${i}`}
                    data-filled
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    const percent = maxScore ? score / maxScore : 0;
    const rank =
      percent >= 0.8 ? 'expert' : percent >= 0.55 ? 'sharp' : 'training';

    return (
      <div className={styles.screen} ref={screenRef}>
        <section className={styles.end} aria-labelledby="ws-end-title">
          <p className={styles.kicker}>{t('wordScramble.endKicker')}</p>
          <h1 id="ws-end-title" className={styles.introTitle}>
            {t('wordScramble.endTitle')}
          </h1>
          <div className={styles.rank} data-rank={rank}>
            <span className={styles.rankScore}>
              {shownScore}
              <small>/{maxScore}</small>
            </span>
            <span className={styles.rankName}>
              {t(`wordScramble.rank_${rank}`)}
            </span>
          </div>
          <p className={styles.introText}>
            {t(`wordScramble.rank_${rank}_text`, {
              streak: bestStreak,
              solved: solved.length,
            })}
          </p>

          <h2 className={styles.sectionTitle}>
            {t('wordScramble.wordsTitle')}
          </h2>
          <ul className={styles.wordGrid}>
            {run.map((c, i) => (
              <li
                key={c.id}
                data-got={solved.includes(c.answer)}
                style={{ '--i': i } as React.CSSProperties}
              >
                <span className={styles.wordKind}>
                  {t(`wordScramble.kind_${c.kind}`)}
                </span>
                <strong>{c.answer}</strong>
                <span>{c.fact}</span>
              </li>
            ))}
          </ul>

          <section className={styles.safety} aria-labelledby="ws-safety">
            <h2 id="ws-safety" className={styles.sectionTitle}>
              {t('wordScramble.safetyTitle')}
            </h2>
            <ol className={styles.safetySteps}>
              {(['1', '2', '3', '4'] as const).map((n) => (
                <li key={n}>{t(`wordScramble.safety${n}`)}</li>
              ))}
            </ol>
            <p className={styles.helpline}>{t('wordScramble.helpline')}</p>
          </section>

          <button type="button" className="shell-button" onClick={onComplete}>
            {t('wordScramble.continue')}
          </button>
        </section>
      </div>
    );
  }

  if (!current) {
    return <div className={styles.screen} ref={screenRef} />;
  }

  const guessReady = filledCount === current.answer.length;
  const pickedMove: MoveOption | null =
    movePick !== null ? current.move.options[movePick] : null;
  const bestMoveScore = Math.max(...current.move.options.map((o) => o.score));
  const phaseKey =
    phase === 'build' ? 'build' : phase === 'move' ? 'move' : 'debrief';

  return (
    <div className={styles.screen} ref={screenRef}>
      <header className={styles.hud}>
        <div className={styles.hudCase}>
          <span className={styles.hudLabel}>
            {t('wordScramble.caseOf', {
              n: index + 1,
              total: run.length,
            })}
          </span>
          <span className={styles.hudTitle}>
            {t(`wordScramble.phase_${phaseKey}`)}
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
          <div>
            <span className={styles.hudLabel}>{t('wordScramble.streak')}</span>
            <span className={styles.hudStreak}>{streak}</span>
          </div>
          <div>
            <span className={styles.hudLabel}>{t('wordScramble.score')}</span>
            <span className={styles.hudScoreValue}>{shownScore}</span>
          </div>
        </div>
      </header>

      <div className={styles.layout} key={`${current.id}-${phase}`}>
        <section className={styles.card}>
          <div className={styles.metaRow}>
            <span className={styles.kindChip} data-kind={current.kind}>
              {t(`wordScramble.kind_${current.kind}`)}
            </span>
            {current.decoys.length > 0 && phase === 'build' && (
              <span className={styles.decoyNote}>
                {t('wordScramble.decoyNote', {
                  count: current.decoys.length,
                })}
              </span>
            )}
          </div>

          <p className={styles.context}>{current.context}</p>
          <p className={styles.clue}>
            <span>{t('wordScramble.clueLabel')}</span> {current.clue}
          </p>

          {phase === 'build' && (
            <>
              <div
                className={styles.slots}
                data-shake={shake || undefined}
                aria-label={t('wordScramble.slotsLabel')}
              >
                {slots.map((tile, i) => (
                  <button
                    key={`slot-${i}`}
                    type="button"
                    className={styles.slot}
                    data-filled={!!tile || undefined}
                    data-locked={locked.has(i) || undefined}
                    disabled={!tile || locked.has(i)}
                    onClick={() => removeFromSlot(i)}
                  >
                    {tile?.letter ?? ''}
                  </button>
                ))}
              </div>

              <div
                className={styles.tray}
                aria-label={t('wordScramble.trayLabel')}
              >
                {pool.map((tile, i) => (
                  <button
                    key={tile.id}
                    type="button"
                    className={styles.tile}
                    style={{ '--i': i } as React.CSSProperties}
                    onClick={() => addTile(tile)}
                    disabled={filledCount >= current.answer.length}
                  >
                    {tile.letter}
                  </button>
                ))}
              </div>

              <div className={styles.tools}>
                <button
                  type="button"
                  className="shell-button shell-button--quiet"
                  onClick={reshufflePool}
                >
                  {t('wordScramble.shuffle')}
                </button>
                <button
                  type="button"
                  className="shell-button shell-button--quiet"
                  onClick={clearSlots}
                  disabled={filledCount === 0}
                >
                  {t('wordScramble.clear')}
                </button>
                <button
                  type="button"
                  className="shell-button shell-button--quiet"
                  onClick={useHint}
                  disabled={hintUsed}
                >
                  {hintUsed
                    ? t('wordScramble.hintUsed')
                    : t('wordScramble.hint', { cost: HINT_COST })}
                </button>
                <button
                  type="button"
                  className="shell-button"
                  onClick={checkWord}
                  disabled={!guessReady}
                >
                  {t('wordScramble.check')}
                </button>
              </div>
              {wrongTries > 0 && (
                <p className={styles.wrongNote} role="status">
                  {t('wordScramble.wrong', {
                    cost: WRONG_COST,
                    n: wrongTries,
                  })}
                </p>
              )}
            </>
          )}

          {phase === 'move' && (
            <div className={styles.moveBlock}>
              <p className={styles.solvedWord}>
                {t('wordScramble.cracked', {
                  word: current.answer,
                  points: solvePoints,
                })}
              </p>
              <h2 className={styles.taskTitle}>{current.move.question}</h2>
              <ol className={styles.choices}>
                {current.move.options.map((option, i) => {
                  let state = 'idle';
                  if (movePick !== null) {
                    if (option.score === bestMoveScore) state = 'best';
                    else if (i === movePick)
                      state = option.score > 0 ? 'partly' : 'wrong';
                    else state = 'dim';
                  }
                  return (
                    <li
                      key={option.text}
                      style={{ '--i': i } as React.CSSProperties}
                    >
                      <button
                        type="button"
                        className={styles.choice}
                        data-state={state}
                        disabled={movePick !== null}
                        onClick={() => pickMove(i)}
                      >
                        <span className={styles.choiceKey}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {option.text}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {phase === 'debrief' && pickedMove && (
            <div className={styles.debrief} data-score={pickedMove.score}>
              <p className={styles.solvedWord}>{current.answer}</p>
              <p className={styles.fact}>{current.fact}</p>
              <p className={styles.moveFeedback}>
                {pickedMove.feedback}
                {movePoints > 0
                  ? ` (+${movePoints})`
                  : ` (${t('wordScramble.noMovePoints')})`}
              </p>
              <button type="button" className="shell-button" onClick={nextCase}>
                {index >= run.length - 1
                  ? t('wordScramble.seeResults')
                  : t('wordScramble.next')}
              </button>
            </div>
          )}
        </section>

        <aside className={styles.side}>
          <p className={styles.sideKicker}>{t('wordScramble.tipsLabel')}</p>
          <ul className={styles.tips}>
            <li>{t('wordScramble.tip1')}</li>
            <li>{t('wordScramble.tip2')}</li>
            <li>{t('wordScramble.tip3')}</li>
          </ul>
          {phase === 'build' && (
            <p className={styles.sideHint}>{t('wordScramble.keyboardHint')}</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default WordScrambleGame;
