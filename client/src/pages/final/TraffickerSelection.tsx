import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TraffickerSelection.css';

interface ChatSummary {
  id: number;
  name: string;
  isTrafficker: boolean;
}

const TraffickerSelection: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/chats/user/${userId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) return;
        const data = await res.json();
        const list: ChatSummary[] = data.map((c: any) => ({ id: c.id, name: c.chatName, isTrafficker: !!c.isTrafficker }));
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

  const trueIds = useMemo(() => new Set(chats.filter((c) => c.isTrafficker).map((c) => c.id)), [chats]);
  const missed = useMemo(() => chats.filter((c) => c.isTrafficker && !selectedIds.has(c.id)).map((c) => c.name), [chats, selectedIds]);

  const handleSubmit = () => setSubmitted(true);
  const handleCloseModal = () => navigate('/ending');

  return (
    <div className="final-select-container">
      <h2 className="title">Thank you for playing!</h2>
      <p className="instruction">Last step: click on the names you think were traffickers, then press Submit.</p>

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

      <button className="submit-button" onClick={handleSubmit} disabled={submitted}>
        Submit
      </button>

      {submitted && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {missed.length === 0 ? (
              <>
                <h3 className="result-title">Great job!</h3>
                <p className="result-text">You identified all the traffickers. Stay alert and trust your instincts.</p>
                <p className="result-text yellow">(Click anywhere to continue)</p>
              </>
            ) : (
              <>
                <h3 className="result-title">Almost there</h3>
                <p className="result-text">You missed these names:</p>
                <p className="result-text yellow">{missed.join(', ')}</p>
                <p className="result-text">Thanks for playing — let’s keep practicing safety.</p>
                <p className="result-text yellow">(Click anywhere to continue)</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TraffickerSelection;
