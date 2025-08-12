import React, { useCallback, useEffect, useState } from 'react';

interface Session {
  id: number;
  name: string;
}

const Admin: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionName, setSessionName] = useState('');

  const token = localStorage.getItem('authToken');

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/v1/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  }, [token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: sessionName }),
      });
      if (res.ok) {
        setSessionName('');
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin</h2>
      <div>
        <input
          type="text"
          value={sessionName}
          placeholder="Session name"
          onChange={(e) => setSessionName(e.target.value)}
        />
        <button onClick={createSession}>Create Session</button>
      </div>
      <ul>
        {sessions.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;