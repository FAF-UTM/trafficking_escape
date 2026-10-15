import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './TraffickerSelection.module.css';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import PixelAvatar from '../../components/avatar/PixelAvatar';

interface ChatSummary {
  id: number;
  name: string;
  isTrafficker: boolean;
}

const TraffickerSelection: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await api<
          { id: number; chatName: string; isTrafficker: boolean }[]
        >(`/api/chats/user/${userId}`);
        const list: ChatSummary[] = data.map((c) => ({
          id: c.id,
          name: c.chatName,
          isTrafficker: !!c.isTrafficker,
        }));
        setChats(list);
      } catch (e) {
        console.error('Failed to load chats for final selection', e);
      }
    };
    if (userId) fetchChats();
  }, [userId]);

  const toggle = (id: number) => {
    if (submitted) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  useMemo(
    () => new Set(chats.filter((c) => c.isTrafficker).map((c) => c.id)),
    [chats]
  );
  const missed = useMemo(
    () =>
      chats
        .filter((c) => c.isTrafficker && !selectedIds.has(c.id))
        .map((c) => c.name),
    [chats, selectedIds]
  );
  const correct = useMemo(
    () =>
      chats
        .filter((c) => c.isTrafficker && selectedIds.has(c.id))
        .map((c) => c.name),
    [chats, selectedIds]
  );
  const falsePositives = useMemo(
    () =>
      chats
        .filter((c) => !c.isTrafficker && selectedIds.has(c.id))
        .map((c) => c.name),
    [chats, selectedIds]
  );

  const handleSubmit = () => setSubmitted(true);
  const handleCloseModal = () => navigate('/ending');

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('finalSelect.title')}</h1>
      <p className={styles.instruction}>{t('finalSelect.instruction')}</p>

      <div className={styles.names}>
        {chats.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.chip}
            aria-pressed={selectedIds.has(c.id)}
            onClick={() => toggle(c.id)}
            disabled={submitted}
          >
            <span className={styles.avatarWrap}>
              <PixelAvatar seed={c.name} size={80} className={styles.avatar} />
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
            </span>
            <span className={styles.chipName}>{c.name}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`shell-button ${styles.submit}`}
        onClick={handleSubmit}
        disabled={submitted}
      >
        {t('finalSelect.submit')}
      </button>

      {submitted && (
        <div className={styles.overlay} onClick={handleCloseModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="final-result-title"
            onClick={(e) => e.stopPropagation()}
          >
            {missed.length === 0 && falsePositives.length === 0 ? (
              <>
                <h2 id="final-result-title" className={styles.resultTitle}>
                  {t('finalSelect.great')}
                </h2>
                <p className={styles.resultText}>
                  {t('finalSelect.allIdentified')}
                </p>
              </>
            ) : (
              <>
                <h2 id="final-result-title" className={styles.resultTitle}>
                  {t('finalSelect.almost')}
                </h2>
                {correct.length > 0 && (
                  <>
                    <p className={styles.resultText}>
                      {t('finalSelect.correctPicks')}
                    </p>
                    <p className={styles.resultNames} data-tone="safe">
                      {correct.join(', ')}
                    </p>
                  </>
                )}
                {falsePositives.length > 0 && (
                  <>
                    <p className={styles.resultText}>
                      {t('finalSelect.selectedNotTraffickers')}
                    </p>
                    <p className={styles.resultNames} data-tone="risk">
                      {falsePositives.join(', ')}
                    </p>
                  </>
                )}
                {missed.length > 0 && (
                  <>
                    <p className={styles.resultText}>
                      {t('finalSelect.missedTraffickers')}
                    </p>
                    <p className={styles.resultNames} data-tone="missed">
                      {missed.join(', ')}
                    </p>
                  </>
                )}
                <p className={styles.resultText}>{t('finalSelect.thanks')}</p>
              </>
            )}
            <p className={styles.continue}>{t('finalSelect.continue')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraffickerSelection;
