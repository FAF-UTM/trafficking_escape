import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PixelAvatar from '../../components/avatar/PixelAvatar';
import { useAudio } from '../../context/AudioContext';
import styles from './WhoToTrustGame.module.css';
import {
  CASES,
  CASES_PER_RUN,
  POINTS_BEST,
  POINTS_PARTLY,
  type Contact,
  type TrustCase,
  type TrustLevel,
} from './trustCases';

type Phase = 'intro' | 'choose' | 'debrief' | 'end';

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildRun = (): TrustCase[] =>
  shuffle(CASES)
    .slice(0, CASES_PER_RUN)
    .map((c) => ({ ...c, contacts: shuffle(c.contacts) }));

const pointsFor = (level: TrustLevel) =>
  level === 'best' ? POINTS_BEST : level === 'partly' ? POINTS_PARTLY : 0;

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

interface WhoToTrustGameProps {
  onComplete: () => void;
}

const WhoToTrustGame: React.FC<WhoToTrustGameProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { playClick } = useAudio();
  const screenRef = useRef<HTMLDivElement>(null);
  const debriefRef = useRef<HTMLElement>(null);

  const run = useMemo(() => buildRun(), []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bestCount, setBestCount] = useState(0);

  const current = run[index];
  const shownScore = useCountUp(score);
  const maxScore = run.length * POINTS_BEST;
  const picked: Contact | null =
    pickedId && current
      ? (current.contacts.find((c) => c.id === pickedId) ?? null)
      : null;

  useEffect(() => {
    if (phase === 'debrief' && debriefRef.current) {
      debriefRef.current.scrollIntoView({
        block: 'nearest',
        behavior: reducedMotion() ? 'auto' : 'smooth',
      });
      return;
    }
    screenRef.current?.scrollTo({
      top: 0,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  }, [phase, index]);

  const start = () => {
    playClick(8);
    setPhase('choose');
  };

  const pick = (contact: Contact) => {
    if (phase !== 'choose' || pickedId) return;
    playClick(8);
    setPickedId(contact.id);
    const pts = pointsFor(contact.trust);
    if (pts) setScore((s) => s + pts);
    if (contact.trust === 'best') setBestCount((n) => n + 1);
    setPhase('debrief');
  };

  const next = () => {
    playClick(8);
    if (index >= run.length - 1) {
      setPhase('end');
      return;
    }
    setIndex((i) => i + 1);
    setPickedId(null);
    setPhase('choose');
  };

  if (phase === 'intro') {
    return (
      <div className={styles.screen} ref={screenRef}>
        <div className={styles.introLayout}>
          <section className={styles.intro} aria-labelledby="wt-intro-title">
            <p className={styles.kicker}>{t('whoToTrust.kicker')}</p>
            <h1 id="wt-intro-title" className={styles.introTitle}>
              {t('whoToTrust.introTitle')}
            </h1>
            <p className={styles.introText}>{t('whoToTrust.introText')}</p>
            <ol className={styles.introSteps}>
              {(['1', '2', '3'] as const).map((n, i) => (
                <li key={n} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.introStepNum}>{n}</span>
                  <span>
                    <strong>{t(`whoToTrust.introStep${n}Title`)}</strong>
                    {t(`whoToTrust.introStep${n}Text`)}
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.introNote}>
              {t('whoToTrust.introNote', {
                count: run.length,
                best: POINTS_BEST,
                partly: POINTS_PARTLY,
              })}
            </p>
            <button type="button" className="shell-button" onClick={start}>
              {t('whoToTrust.start')}
            </button>
          </section>

          <aside className={styles.preview} aria-hidden="true">
            <div className={styles.previewCard}>
              <p className={styles.previewLabel}>
                {t('whoToTrust.previewLabel')}
              </p>
              <ul className={styles.previewPeople}>
                {(
                  [
                    ['previewMom', 'best'],
                    ['previewDm', 'unsafe'],
                    ['previewOnline', 'unsafe'],
                  ] as const
                ).map(([key, tone], i) => (
                  <li
                    key={key}
                    data-tone={tone}
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    <PixelAvatar seed={key} size={40} />
                    <span>{t(`whoToTrust.${key}`)}</span>
                    <small>{t(`whoToTrust.tone_${tone}`)}</small>
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
    const percent = maxScore ? score / maxScore : 0;
    const rank =
      percent >= 0.85 ? 'expert' : percent >= 0.55 ? 'sharp' : 'training';

    return (
      <div className={styles.screen} ref={screenRef}>
        <section className={styles.end} aria-labelledby="wt-end-title">
          <p className={styles.kicker}>{t('whoToTrust.endKicker')}</p>
          <h1 id="wt-end-title" className={styles.introTitle}>
            {t('whoToTrust.endTitle')}
          </h1>
          <div className={styles.rank} data-rank={rank}>
            <span className={styles.rankScore}>
              {shownScore}
              <small>/{maxScore}</small>
            </span>
            <span className={styles.rankName}>
              {t(`whoToTrust.rank_${rank}`)}
            </span>
          </div>
          <p className={styles.introText}>
            {t(`whoToTrust.rank_${rank}_text`, {
              best: bestCount,
              total: run.length,
            })}
          </p>

          <h2 className={styles.sectionTitle}>
            {t('whoToTrust.lessonsTitle')}
          </h2>
          <ul className={styles.lessonList}>
            {run.map((c, i) => (
              <li key={c.id} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.lessonNum}>{i + 1}</span>
                <span>
                  <strong>{c.title}</strong>
                  {c.lesson}
                </span>
              </li>
            ))}
          </ul>

          <section className={styles.safety} aria-labelledby="wt-safety">
            <h2 id="wt-safety" className={styles.sectionTitle}>
              {t('whoToTrust.safetyTitle')}
            </h2>
            <ol className={styles.safetySteps}>
              {(['1', '2', '3', '4'] as const).map((n) => (
                <li key={n}>{t(`whoToTrust.safety${n}`)}</li>
              ))}
            </ol>
            <p className={styles.helpline}>{t('whoToTrust.helpline')}</p>
          </section>

          <button type="button" className="shell-button" onClick={onComplete}>
            {t('whoToTrust.continue')}
          </button>
        </section>
      </div>
    );
  }

  if (!current) {
    return <div className={styles.screen} ref={screenRef} />;
  }

  return (
    <div className={styles.screen} ref={screenRef}>
      <header className={styles.hud}>
        <div className={styles.hudCase}>
          <span className={styles.hudLabel}>
            {t('whoToTrust.caseOf', {
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
          <span className={styles.hudLabel}>{t('whoToTrust.score')}</span>
          <span className={styles.hudScoreValue}>{shownScore}</span>
        </div>
      </header>

      <div className={styles.layout} key={`${current.id}-${phase}`}>
        <section className={styles.situation} aria-labelledby="wt-situation">
          <p className={styles.situationLabel}>
            {t('whoToTrust.situationLabel')}
          </p>
          <h2 id="wt-situation" className={styles.situationText}>
            {current.situation}
          </h2>
          <p className={styles.question}>{current.question}</p>
        </section>

        <section
          className={styles.contacts}
          aria-label={t('whoToTrust.contactsLabel')}
        >
          {current.contacts.map((contact, i) => {
            let state = 'idle';
            if (phase === 'debrief' && picked) {
              if (contact.id === picked.id) state = contact.trust;
              else if (contact.trust === 'best') state = 'revealBest';
              else state = 'dim';
            }
            return (
              <button
                key={contact.id}
                type="button"
                className={styles.contact}
                data-state={state}
                disabled={phase !== 'choose'}
                onClick={() => pick(contact)}
                style={{ '--i': i } as React.CSSProperties}
              >
                <div className={styles.contactHead}>
                  <PixelAvatar
                    seed={contact.handle || contact.name}
                    size={56}
                    className={styles.avatar}
                  />
                  <div className={styles.contactTitles}>
                    <span className={styles.contactName}>{contact.name}</span>
                    {contact.handle && (
                      <span className={styles.contactHandle}>
                        @{contact.handle}
                      </span>
                    )}
                    <span className={styles.contactRole}>{contact.role}</span>
                  </div>
                  {phase === 'debrief' && contact.trust === 'best' && (
                    <span className={styles.bestBadge}>
                      {t('whoToTrust.bestBadge')}
                    </span>
                  )}
                </div>
                <ul className={styles.clues}>
                  {contact.clues.map((clue) => (
                    <li key={clue}>{clue}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </section>

        {phase === 'debrief' && picked && (
          <section
            ref={debriefRef}
            className={styles.debrief}
            data-trust={picked.trust}
            aria-live="polite"
          >
            <p className={styles.debriefTitle}>
              {t(`whoToTrust.result_${picked.trust}`, {
                points: pointsFor(picked.trust),
              })}
            </p>
            <p className={styles.debriefText}>{picked.feedback}</p>
            <p className={styles.debriefLesson}>{current.lesson}</p>
            <button type="button" className="shell-button" onClick={next}>
              {index >= run.length - 1
                ? t('whoToTrust.seeResults')
                : t('whoToTrust.next')}
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default WhoToTrustGame;
