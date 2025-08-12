import React, { useCallback, useEffect, useState } from 'react';
import styles from './admin.module.css'
interface Session {
  id: number;
  name: string;
}

interface CreatedUser {
  username: string;
  accessCode: string;
  expirationDate: string;
}


const Admin: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [validityMinutes, setValidityMinutes] = useState(60);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

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

  const createEphemeralUser = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/v1/users/random?validityMinutes=${validityMinutes}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCreatedUser(data);
      }
    } catch (err) {
      console.error('Failed to create user', err);
    }
  };



  return (
    <div className={styles.admin}>
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
      <div style={{ marginTop: '20px' }}>
        <input
          type="number"
          value={validityMinutes}
          onChange={(e) => setValidityMinutes(parseInt(e.target.value))}
        />
        <button onClick={createEphemeralUser}>Create Ephemeral User</button>
        {createdUser && (
          <div>
            <p>Username: {createdUser.username}</p>
            <p>Access Code: {createdUser.accessCode}</p>
            <p>Expires: {createdUser.expirationDate}</p>
          </div>
        )}
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