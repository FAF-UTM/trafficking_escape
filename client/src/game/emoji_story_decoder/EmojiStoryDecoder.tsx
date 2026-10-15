import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PixelAvatar from '../../components/avatar/PixelAvatar';
import { useAudio } from '../../context/AudioContext';
import styles from './EmojiStoryDecoder.module.css';
import {
  CASES,
  CASES_PER_RUN,
  DECODE_POINTS,
  MOVE_POINTS,
  TACTICS,
  type ChoiceOption,
  type EmojiCase,
  type TacticId,
} from './emojiCases';

type Phase =
  'intro' | 'thread' | 'reveal' | 'decode' | 'move' | 'debrief' | 'end';

type MessageVerdict = 'hit' | 'miss' | 'falseAlarm' | 'clear';

interface CaseResult {
  hits: number;
  flagMax: number;
  falseAlarms: number;
  flagPoints: number;
  decode: number;
  move: number;
}

const STEPS: { key: string; phases: Phase[] }[] = [
  { key: 'stepFlag', phases: ['thread', 'reveal'] },
  { key: 'stepDecode', phases: ['decode'] },
  { key: 'stepMove', phases: ['move'] },
  { key: 'stepDebrief', phases: ['debrief'] },
];

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildRun = (): EmojiCase[] =>
  shuffle(CASES)
    .slice(0, CASES_PER_RUN)
    .map((c) => ({
      ...c,
      decode: { ...c.decode, options: shuffle(c.decode.options) },
      move: { options: shuffle(c.move.options) },
    }));

const flagCount = (c: EmojiCase) => c.thread.filter((m) => m.flag).length;
const caseMax = (c: EmojiCase) => flagCount(c) + DECODE_POINTS + MOVE_POINTS;

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useCountUp = (target: number, duration = 700) => {
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

interface ChoicesProps {
  options: ChoiceOption[];
  picked: number | null;
  bestScore: number;
  onPick: (index: number) => void;
}

const Choices: React.FC<ChoicesProps> = ({
  options,
  picked,
  bestScore,
  onPick,
}) => (
  <ol className={styles.choices}>
    {options.map((option, i) => {
      let state = 'idle';
      if (picked !== null) {
        if (option.score === bestScore) state = 'best';
        else if (i === picked) state = option.score > 0 ? 'partly' : 'wrong';
        else state = 'dim';
      }
      return (
        <li key={option.text} style={{ '--i': i } as React.CSSProperties}>
          <button
            type="button"
            className={styles.choice}
            data-state={state}
            data-picked={i === picked || undefined}
            disabled={picked !== null}
            onClick={() => onPick(i)}
          >
            <span className={styles.choiceKey} aria-hidden="true">
              {String.fromCharCode(65 + i)}
            </span>
            <span>{option.text}</span>
          </button>
        </li>
      );
    })}
  </ol>
);

const PREVIEW = CASES[0];

const IntroPreview: React.FC = () => (
  <div className={styles.preview} aria-hidden="true">
    <div className={`${styles.phone} ${styles.previewPhone}`}>
      <div className={styles.profile}>
        <PixelAvatar
          seed={PREVIEW.contact.handle}
          size={48}
          className={styles.profileAvatar}
        />
        <div>
          <p className={styles.handle}>@{PREVIEW.contact.handle}</p>
          <ul className={styles.clues}>
            {PREVIEW.contact.clues.map((clue) => (
              <li key={clue}>{clue}</li>
            ))}
          </ul>
        </div>
      </div>
      <ol className={styles.thread}>
        {PREVIEW.thread.slice(0, 5).map((m, i) => (
          <li
            key={i}
            className={`${styles.row} ${styles.previewRow}`}
            data-from={m.from}
            data-verdict={m.flag ? 'hit' : undefined}
            style={{ '--i': i } as React.CSSProperties}
          >
            <p className={styles.bubble}>{m.text}</p>
            {m.flag && (
              <div className={styles.stamp} data-verdict="hit">
                <span className={styles.stampLabel}>
                  🚩 {TACTICS[m.flag].name}
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  </div>
);

interface EmojiStoryDecoderProps {
  onComplete: () => void;
}

const EmojiStoryDecoder: React.FC<EmojiStoryDecoderProps> = ({
  onComplete,
}) => {
  const { t } = useTranslation();
  const { playClick } = useAudio();

  const [run] = useState(buildRun);
  const [phase, setPhase] = useState<Phase>('intro');
  const [caseIndex, setCaseIndex] = useState(0);
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [decodePick, setDecodePick] = useState<number | null>(null);
  const [movePick, setMovePick] = useState<number | null>(null);
  const [results, setResults] = useState<CaseResult[]>([]);
  const [caught, setCaught] = useState<Set<TacticId>>(new Set());
  const [newTactics, setNewTactics] = useState<Set<TacticId>>(new Set());

  const screenRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const current = run[caseIndex];
  const allVisible = visible >= current.thread.length;
  const totalMax = useMemo(
    () => run.reduce((sum, c) => sum + caseMax(c), 0),
    [run]
  );
  const caseFlagMax = flagCount(current);

  const score = results.reduce(
    (sum, r) => sum + r.flagPoints + r.decode + r.move,
    0
  );
  const shownScore = useCountUp(score);

  // Messages arrive one at a time; incoming ones show a typing indicator first.
  useEffect(() => {
    if (phase !== 'thread' || allVisible) return;
    const next = current.thread[visible];
    const instant = reducedMotion();
    const delay = instant
      ? 0
      : next.from === 'them'
        ? 650 + Math.min(next.text.length * 16, 1000)
        : 600;
    setTyping(next.from === 'them' && !instant);
    const id = window.setTimeout(() => {
      setTyping(false);
      setVisible((v) => v + 1);
    }, delay);
    return () => window.clearTimeout(id);
  }, [phase, visible, allVisible, current]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  }, [visible, typing]);

  const finished = phase === 'end';
  useEffect(() => {
    screenRef.current?.scrollTo({ top: 0 });
  }, [caseIndex, finished]);

  useEffect(() => {
    if (phase === 'intro' || phase === 'end' || phase === 'thread') return;
    if (window.matchMedia('(max-width: 900px)').matches) {
      panelRef.current?.scrollIntoView({
        block: 'start',
        behavior: reducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, [phase]);

  const verdictFor = (index: number): MessageVerdict => {
    const isFlag = !!current.thread[index].flag;
    const marked = flagged.has(index);
    if (isFlag) return marked ? 'hit' : 'miss';
    return marked ? 'falseAlarm' : 'clear';
  };

  const startCase = (index: number) => {
    setCaseIndex(index);
    setVisible(0);
    setFlagged(new Set());
    setDecodePick(null);
    setMovePick(null);
    setPhase('thread');
  };

  const toggleFlag = (index: number) => {
    if (phase !== 'thread') return;
    playClick(8);
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const lockFlags = () => {
    playClick(8);
    let hits = 0;
    let falseAlarms = 0;
    const found: TacticId[] = [];
    current.thread.forEach((m, i) => {
      if (!flagged.has(i)) return;
      if (m.flag) {
        hits++;
        found.push(m.flag);
      } else falseAlarms++;
    });
    setResults((prev) => {
      const next = [...prev];
      next[caseIndex] = {
        hits,
        flagMax: caseFlagMax,
        falseAlarms,
        flagPoints: Math.max(0, hits - falseAlarms),
        decode: 0,
        move: 0,
      };
      return next;
    });
    const fresh = new Set(found.filter((id) => !caught.has(id)));
    setNewTactics(fresh);
    setCaught((prev) => new Set([...prev, ...found]));
    setPhase('reveal');
  };

  const pickDecode = (index: number) => {
    playClick(8);
    setDecodePick(index);
    const points = current.decode.options[index].score * DECODE_POINTS;
    setResults((prev) => {
      const next = [...prev];
      next[caseIndex] = { ...next[caseIndex], decode: points };
      return next;
    });
  };

  const pickMove = (index: number) => {
    playClick(8);
    setMovePick(index);
    const points = current.move.options[index].score;
    setResults((prev) => {
      const next = [...prev];
      next[caseIndex] = { ...next[caseIndex], move: points };
      return next;
    });
  };

  const goNext = () => {
    playClick(8);
    if (caseIndex < run.length - 1) startCase(caseIndex + 1);
    else setPhase('end');
  };

  if (phase === 'intro') {
    return (
      <div className={styles.screen} ref={screenRef}>
        <div className={styles.introLayout}>
          <section className={styles.intro} aria-labelledby="ed-intro-title">
            <p className={styles.kicker}>{t('emojiDecoder.kicker')}</p>
            <h1 id="ed-intro-title" className={styles.introTitle}>
              {t('emojiDecoder.introTitle')}
            </h1>
            <p className={styles.introText}>{t('emojiDecoder.introText')}</p>
            <ol className={styles.introSteps}>
              {(['1', '2', '3', '4'] as const).map((n, i) => (
                <li key={n} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.introStepNum}>{n}</span>
                  <span>
                    <strong>{t(`emojiDecoder.introStep${n}Title`)}</strong>
                    {t(`emojiDecoder.introStep${n}Text`)}
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.introNote}>
              {t('emojiDecoder.introNote', { count: run.length })}
            </p>
            <button
              type="button"
              className="shell-button"
              onClick={() => {
                playClick(8);
                startCase(0);
              }}
            >
              {t('emojiDecoder.start')}
            </button>
          </section>
          <IntroPreview />
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    const percent = totalMax ? score / totalMax : 0;
    const rank =
      percent >= 0.85 ? 'expert' : percent >= 0.6 ? 'sharp' : 'training';
    const encountered = [
      ...new Set(
        run.flatMap((c) => c.thread.flatMap((m) => (m.flag ? [m.flag] : [])))
      ),
    ];
    return (
      <div className={styles.screen} ref={screenRef}>
        <section className={styles.end} aria-labelledby="ed-end-title">
          <p className={styles.kicker}>{t('emojiDecoder.endKicker')}</p>
          <h1 id="ed-end-title" className={styles.introTitle}>
            {t('emojiDecoder.endTitle')}
          </h1>
          <div className={styles.rank} data-rank={rank}>
            <span className={styles.rankScore}>
              {shownScore}
              <small>/{totalMax}</small>
            </span>
            <span className={styles.rankName}>
              {t(`emojiDecoder.rank_${rank}`)}
            </span>
          </div>
          <p className={styles.introText}>
            {t(`emojiDecoder.rank_${rank}_text`)}
          </p>

          <h2 className={styles.sectionTitle}>
            {t('emojiDecoder.fileTitle', {
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
                    {t('emojiDecoder.missedTactic')}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <section className={styles.safety} aria-labelledby="ed-safety">
            <h2 id="ed-safety" className={styles.sectionTitle}>
              {t('emojiDecoder.safetyTitle')}
            </h2>
            <ol className={styles.safetySteps}>
              {(['1', '2', '3', '4'] as const).map((n) => (
                <li key={n}>{t(`emojiDecoder.safety${n}`)}</li>
              ))}
            </ol>
            <p className={styles.helpline}>{t('emojiDecoder.helpline')}</p>
          </section>

          <button type="button" className="shell-button" onClick={onComplete}>
            {t('emojiDecoder.continue')}
          </button>
        </section>
      </div>
    );
  }

  const result = results[caseIndex];
  const pickedDecode =
    decodePick !== null ? current.decode.options[decodePick] : null;
  const pickedMove = movePick !== null ? current.move.options[movePick] : null;
  const caseTactics = [
    ...new Set(current.thread.flatMap((m) => (m.flag ? [m.flag] : []))),
  ];
  const caughtHere = new Set(
    current.thread.flatMap((m, i) => (m.flag && flagged.has(i) ? [m.flag] : []))
  );

  return (
    <div className={styles.screen} ref={screenRef}>
      <header className={styles.hud}>
        <div className={styles.hudCase}>
          <span className={styles.hudLabel}>
            {t('emojiDecoder.caseOf', {
              n: caseIndex + 1,
              total: run.length,
            })}
          </span>
          <span className={styles.hudTitle}>{current.title}</span>
        </div>
        <ol className={styles.progress} aria-hidden="true">
          {run.map((c, i) => (
            <li
              key={c.id}
              data-state={
                i < caseIndex ? 'done' : i === caseIndex ? 'current' : 'todo'
              }
            />
          ))}
        </ol>
        <div className={styles.hudScore}>
          <span className={styles.hudLabel}>{t('emojiDecoder.score')}</span>
          <span className={styles.hudScoreValue} aria-live="polite">
            {shownScore}
          </span>
        </div>
      </header>

      <ol className={styles.steps}>
        {STEPS.map((step, i) => {
          const activeIndex = STEPS.findIndex((s) => s.phases.includes(phase));
          return (
            <li
              key={step.key}
              data-state={
                i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'todo'
              }
              aria-current={i === activeIndex ? 'step' : undefined}
            >
              {t(`emojiDecoder.${step.key}`)}
            </li>
          );
        })}
      </ol>

      <div className={styles.layout} key={current.id}>
        <section className={styles.phone} aria-label={current.contact.handle}>
          <div className={styles.profile}>
            <PixelAvatar
              seed={current.contact.handle}
              size={48}
              className={styles.profileAvatar}
            />
            <div>
              <p className={styles.handle}>@{current.contact.handle}</p>
              <ul className={styles.clues}>
                {current.contact.clues.map((clue) => (
                  <li key={clue}>{clue}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className={styles.setup}>{current.setup}</p>

          <ol className={styles.thread}>
            {current.thread.slice(0, visible).map((m, i) => {
              const verdict = phase === 'thread' ? null : verdictFor(i);
              const tactic = m.flag ? TACTICS[m.flag] : null;
              return (
                <li
                  key={i}
                  className={styles.row}
                  data-from={m.from}
                  data-verdict={verdict ?? undefined}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {m.from === 'them' ? (
                    <button
                      type="button"
                      className={styles.bubble}
                      aria-pressed={flagged.has(i)}
                      disabled={phase !== 'thread'}
                      onClick={() => toggleFlag(i)}
                    >
                      {m.text}
                      <span className={styles.flagPin} aria-hidden="true">
                        🚩
                      </span>
                    </button>
                  ) : (
                    <p className={styles.bubble}>{m.text}</p>
                  )}
                  {verdict && verdict !== 'clear' && (
                    <div className={styles.stamp} data-verdict={verdict}>
                      <span className={styles.stampLabel}>
                        {verdict === 'hit' && `🚩 ${tactic?.name}`}
                        {verdict === 'miss' &&
                          `${t('emojiDecoder.missed')} · ${tactic?.name}`}
                        {verdict === 'falseAlarm' &&
                          t('emojiDecoder.notRedFlag')}
                      </span>
                      {m.note && (
                        <span className={styles.stampNote}>{m.note}</span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
            {typing && (
              <li className={styles.row} data-from="them">
                <span
                  className={styles.typing}
                  aria-label={t('emojiDecoder.typing')}
                >
                  <span />
                  <span />
                  <span />
                </span>
              </li>
            )}
          </ol>
          <div ref={threadEndRef} />
        </section>

        <div className={styles.panel} ref={panelRef}>
          {phase === 'thread' && (
            <div className={styles.task} key="thread">
              <h2 className={styles.taskTitle}>
                {t('emojiDecoder.flagTitle')}
              </h2>
              <p className={styles.taskText}>{t('emojiDecoder.flagText')}</p>
              <p className={styles.taskHint}>{t('emojiDecoder.flagHint')}</p>
              <p className={styles.flagCounter} aria-live="polite">
                <span aria-hidden="true">🚩</span>
                {t('emojiDecoder.flaggedCount', { count: flagged.size })}
              </p>
              <div className={styles.taskActions}>
                <button
                  type="button"
                  className="shell-button"
                  onClick={lockFlags}
                  disabled={!allVisible}
                >
                  {t('emojiDecoder.lockFlags')}
                </button>
                {!allVisible && (
                  <button
                    type="button"
                    className="shell-button shell-button--quiet"
                    onClick={() => {
                      setTyping(false);
                      setVisible(current.thread.length);
                    }}
                  >
                    {t('emojiDecoder.showAll')}
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === 'reveal' && result && (
            <div className={styles.task} key="reveal">
              <h2 className={styles.taskTitle}>
                {caseFlagMax === 0
                  ? t('emojiDecoder.revealNoFlags')
                  : t('emojiDecoder.revealTitle', {
                      hits: result.hits,
                      total: caseFlagMax,
                    })}
              </h2>
              <div className={styles.meter}>
                <span
                  className={styles.meterFill}
                  style={{
                    width: `${
                      caseFlagMax ? (result.hits / caseFlagMax) * 100 : 100
                    }%`,
                  }}
                />
              </div>
              {result.falseAlarms > 0 && (
                <p className={styles.taskText}>
                  {t('emojiDecoder.falseAlarms', {
                    count: result.falseAlarms,
                  })}
                </p>
              )}
              <ul className={styles.legend}>
                <li data-verdict="hit">{t('emojiDecoder.legendHit')}</li>
                <li data-verdict="miss">{t('emojiDecoder.legendMiss')}</li>
                <li data-verdict="falseAlarm">
                  {t('emojiDecoder.legendFalse')}
                </li>
              </ul>
              <div className={styles.taskActions}>
                <button
                  type="button"
                  className="shell-button"
                  onClick={() => {
                    playClick(8);
                    setPhase('decode');
                  }}
                >
                  {t('emojiDecoder.toDecode')}
                </button>
              </div>
            </div>
          )}

          {phase === 'decode' && (
            <div className={styles.task} key="decode">
              <h2 className={styles.taskTitle}>
                {t('emojiDecoder.decodeTitle')}
              </h2>
              <p
                className={styles.sequence}
                aria-label={current.decode.sequence}
              >
                {current.decode.sequence.split(' ').map((part, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    {part}
                  </span>
                ))}
              </p>
              <p className={styles.taskText}>{current.decode.question}</p>
              <Choices
                options={current.decode.options}
                picked={decodePick}
                bestScore={1}
                onPick={pickDecode}
              />
              {pickedDecode && (
                <div
                  className={styles.feedback}
                  data-state={pickedDecode.score > 0 ? 'best' : 'wrong'}
                  role="status"
                >
                  <strong>
                    {pickedDecode.score > 0
                      ? t('emojiDecoder.correct', { points: DECODE_POINTS })
                      : t('emojiDecoder.incorrect')}
                  </strong>
                  <span>{pickedDecode.feedback}</span>
                </div>
              )}
              {pickedDecode && (
                <div className={styles.taskActions}>
                  <button
                    type="button"
                    className="shell-button"
                    onClick={() => {
                      playClick(8);
                      setPhase('move');
                    }}
                  >
                    {t('emojiDecoder.toMove')}
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'move' && (
            <div className={styles.task} key="move">
              <h2 className={styles.taskTitle}>
                {t('emojiDecoder.moveTitle')}
              </h2>
              <p className={styles.taskText}>{t('emojiDecoder.moveText')}</p>
              <Choices
                options={current.move.options}
                picked={movePick}
                bestScore={MOVE_POINTS}
                onPick={pickMove}
              />
              {pickedMove && (
                <div
                  className={styles.feedback}
                  data-state={
                    pickedMove.score === MOVE_POINTS
                      ? 'best'
                      : pickedMove.score > 0
                        ? 'partly'
                        : 'wrong'
                  }
                  role="status"
                >
                  <strong>
                    {pickedMove.score === MOVE_POINTS
                      ? t('emojiDecoder.bestMove', { points: MOVE_POINTS })
                      : pickedMove.score > 0
                        ? t('emojiDecoder.partlyRight', {
                            points: pickedMove.score,
                          })
                        : t('emojiDecoder.unsafeMove')}
                  </strong>
                  <span>{pickedMove.feedback}</span>
                </div>
              )}
              {pickedMove && (
                <div className={styles.taskActions}>
                  <button
                    type="button"
                    className="shell-button"
                    onClick={() => {
                      playClick(8);
                      setPhase('debrief');
                    }}
                  >
                    {t('emojiDecoder.toDebrief')}
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'debrief' && result && (
            <div className={styles.task} key="debrief">
              <h2 className={styles.taskTitle}>
                {t('emojiDecoder.debriefTitle')}
              </h2>
              <dl className={styles.breakdown}>
                {[
                  {
                    label: t('emojiDecoder.pointsFlags'),
                    value: result.flagPoints,
                    max: result.flagMax,
                  },
                  {
                    label: t('emojiDecoder.pointsDecode'),
                    value: result.decode,
                    max: DECODE_POINTS,
                  },
                  {
                    label: t('emojiDecoder.pointsMove'),
                    value: result.move,
                    max: MOVE_POINTS,
                  },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className={styles.breakdownRow}
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    <dt>{row.label}</dt>
                    <dd>
                      <span className={styles.breakdownBar}>
                        <span
                          style={{
                            width: `${row.max ? (row.value / row.max) * 100 : 100}%`,
                          }}
                        />
                      </span>
                      {row.value}/{row.max}
                    </dd>
                  </div>
                ))}
              </dl>

              {caseTactics.length > 0 && (
                <>
                  <h3 className={styles.sectionTitle}>
                    {t('emojiDecoder.tacticsInCase')}
                  </h3>
                  <ul className={styles.tacticGrid}>
                    {caseTactics.map((id, i) => (
                      <li
                        key={id}
                        className={styles.tacticCard}
                        data-caught={caughtHere.has(id)}
                        style={{ '--i': i } as React.CSSProperties}
                      >
                        {!caughtHere.has(id) && (
                          <span className={styles.missedBadge}>
                            {t('emojiDecoder.missed')}
                          </span>
                        )}
                        {newTactics.has(id) && (
                          <span className={styles.newBadge}>
                            {t('emojiDecoder.newTactic')}
                          </span>
                        )}
                        <span className={styles.tacticEmoji} aria-hidden="true">
                          {TACTICS[id].emoji}
                        </span>
                        <span className={styles.tacticName}>
                          {TACTICS[id].name}
                        </span>
                        <span className={styles.tacticText}>
                          {TACTICS[id].description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className={styles.taskActions}>
                <button type="button" className="shell-button" onClick={goNext}>
                  {caseIndex < run.length - 1
                    ? t('emojiDecoder.nextCase')
                    : t('emojiDecoder.seeResults')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmojiStoryDecoder;
