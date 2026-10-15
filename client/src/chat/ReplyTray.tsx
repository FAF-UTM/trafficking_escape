import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './replyTray.module.css';

export type ReplyStatus = 'loading' | 'ready' | 'error';

interface ReplyTrayProps {
  status: ReplyStatus;
  options: string[];
  error?: string;
  onPick: (text: string) => void;
  onRetry: () => void;
}

/**
 * The game layer under the messenger: the three possible replies are shown as unsent
 * drafts. Picking one "sends" it; it fills in and the others fall away.
 */
const ReplyTray: React.FC<ReplyTrayProps> = ({
  status,
  options,
  error,
  onPick,
  onRetry,
}) => {
  const { t } = useTranslation();
  const [sending, setSending] = useState<number | null>(null);
  const ready = status === 'ready' && options.length > 0 && sending === null;
  const touch =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)').matches;

  // A new set of options means the previous send has finished.
  useEffect(() => {
    setSending(null);
  }, [options]);

  const pick = (index: number) => {
    if (!ready || !options[index]) return;
    setSending(index);
    // Let the "send" animation register before the message lands in the chat.
    window.setTimeout(() => onPick(options[index]), 180);
  };

  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      const index = ['1', '2', '3'].indexOf(e.key);
      if (index >= 0) pick(index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <section
      className={styles.tray}
      aria-labelledby="reply-tray-title"
      aria-busy={status === 'loading'}
    >
      <div className={styles.intro}>
        <h2 id="reply-tray-title" className={styles.title}>
          {t('chatReply.title')}
        </h2>
        <p className={styles.hint} aria-live="polite">
          {status === 'loading'
            ? t('chatReply.loading')
            : status === 'error'
              ? t('chatReply.error')
              : touch
                ? t('chatReply.hintTouch')
                : t('chatReply.hint')}
        </p>
      </div>

      {status === 'error' ? (
        <div className={styles.error} role="alert">
          <p>{error ?? t('chatReply.unavailable')}</p>
          <button type="button" className="shell-button" onClick={onRetry}>
            {t('chatReply.retry')}
          </button>
        </div>
      ) : (
        <ol className={styles.drafts}>
          {[0, 1, 2].map((i) => {
            const text = status === 'ready' ? options[i] : undefined;
            const state =
              sending === null
                ? undefined
                : sending === i
                  ? 'sending'
                  : 'dropped';
            return (
              <li key={i} className={styles.slot}>
                {text ? (
                  <button
                    type="button"
                    className={styles.draft}
                    data-state={state}
                    disabled={!ready}
                    onClick={() => pick(i)}
                    aria-keyshortcuts={String(i + 1)}
                  >
                    <span className={styles.key} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className={styles.text}>{text}</span>
                  </button>
                ) : (
                  <div
                    className={`${styles.draft} ${styles.placeholder}`}
                    aria-hidden="true"
                  >
                    <span className={styles.key}>{i + 1}</span>
                    <span className={styles.bar} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default ReplyTray;
