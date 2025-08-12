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
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };


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
        setCreatedUsers((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error('Failed to create user', err);
    }
  };



  return (
    <div className={styles.admin}>
      <h2>Admin Panel</h2>

      <section className={styles.section}>
        <h3>Sessions</h3>
        <div className={styles.formRow}>
          <input
            type="text"
            value={sessionName}
            placeholder="Session name"
            onChange={(e) => setSessionName(e.target.value)}
          />
          <button onClick={createSession}>Create Session</button>
        </div>
        <table className={styles.table}>
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
          </thead>
          <tbody>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td>
                {s.id}
                <button
                  className={styles.copyButton}
                  onClick={() => handleCopy(String(s.id), `session-${s.id}`)}
                >
                  Copy
                </button>
                {copiedKey === `session-${s.id}` && <span className={styles.copied}>Copied!</span>}
              </td>
              <td>{s.name}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h3>Create Player Account</h3>
        <div className={styles.formRow}>
          <label>Validity (min):</label>
          <input
            type="number"
            min={1}
            value={validityMinutes}
            onChange={(e) => setValidityMinutes(parseInt(e.target.value))}
          />
          <button onClick={createEphemeralUser}>Create</button>
        </div>
        {createdUsers.length > 0 && (
          <table className={styles.table}>
            <thead>
            <tr>
              <th>Username</th>
              <th>Access Code</th>
              <th>Expires</th>
            </tr>
            </thead>
            <tbody>
            {createdUsers.map((u, idx) => (
              <tr key={u.username}>
                <td>
                  {u.username}
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopy(u.username, `user-${idx}-name`)}
                  >
                    Copy
                  </button>
                  {copiedKey === `user-${idx}-name` && (
                    <span className={styles.copied}>Copied!</span>
                  )}
                </td>
                <td>
                  {u.accessCode}
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopy(u.accessCode, `user-${idx}-code`)}
                  >
                    Copy
                  </button>
                  {copiedKey === `user-${idx}-code` && (
                    <span className={styles.copied}>Copied!</span>
                  )}
                </td>
                <td>{new Date(u.expirationDate).toLocaleString()}</td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Admin;