import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TraffickerSelection.css';
import { useTranslation } from 'react-i18next';

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
        const token = localStorage.getItem('authToken');
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND}/api/chats/user/${userId}`,
          {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const list: ChatSummary[] = data.map((c: any) => ({
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

  const trueIds = useMemo(
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
    <div className="final-select-container">
      <h2 className="title">{t('finalSelect.title')}</h2>
      <p className="instruction">{t('finalSelect.instruction')}</p>

      <div className="names-block">
        {chats.map((c) => (
          <span
            key={c.id}
            className={`name-chip ${selectedIds.has(c.id) ? 'selected' : ''}`}
            onClick={() => toggle(c.id)}
          >
            {c.name}
          </span>
        ))}
      </div>

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={submitted}
      >
        {t('finalSelect.submit')}
      </button>

      {submitted && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {missed.length === 0 && falsePositives.length === 0 ? (
              <>
                <h3 className="result-title">{t('finalSelect.great')}</h3>
                <p className="result-text">{t('finalSelect.allIdentified')}</p>
                <p className="result-text yellow">
                  {t('finalSelect.continue')}
                </p>
              </>
            ) : (
              <>
                <h3 className="result-title">{t('finalSelect.almost')}</h3>
                {correct.length > 0 && (
                  <>
                    <p className="result-text">
                      {t('finalSelect.correctPicks')}
                    </p>
                    <p className="result-text yellow">{correct.join(', ')}</p>
                  </>
                )}
                {falsePositives.length > 0 && (
                  <>
                    <p className="result-text">
                      {t('finalSelect.selectedNotTraffickers')}
                    </p>
                    <p className="result-text yellow">
                      {falsePositives.join(', ')}
                    </p>
                  </>
                )}
                {missed.length > 0 && (
                  <>
                    <p className="result-text">
                      {t('finalSelect.missedTraffickers')}
                    </p>
                    <p className="result-text yellow">{missed.join(', ')}</p>
                  </>
                )}
                <p className="result-text">{t('finalSelect.thanks')}</p>
                <p className="result-text yellow">
                  {t('finalSelect.continue')}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TraffickerSelection;
