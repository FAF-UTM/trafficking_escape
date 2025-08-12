import React, { useEffect, useState } from 'react';
import styles from './admin.module.css';

interface CreatedUser {
  username: string;
  accessCode: string;
  expirationDate: string;
}

const STORAGE_KEY = 'createdUsers';

const Admin: React.FC = () => {
  const [validityMinutes, setValidityMinutes] = useState(60);
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCreatedUsers(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse stored users', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createdUsers));
  }, [createdUsers]);

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.error('Copy failed', err);
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
              {createdUsers.map((u, idx) => {
                const exp = new Date(u.expirationDate);
                const expired = exp.getTime() < Date.now();
                const expString = exp.toLocaleString();
                return (
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
                    <td className={expired ? styles.expired : undefined}>
                      {expString}
                      <button
                        className={styles.copyButton}
                        onClick={() => handleCopy(expString, `user-${idx}-exp`)}
                      >
                        Copy
                      </button>
                      {copiedKey === `user-${idx}-exp` && (
                        <span className={styles.copied}>Copied!</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Admin;
