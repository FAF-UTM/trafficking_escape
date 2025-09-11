import React, { useCallback, useEffect, useState } from 'react';
import styles from './admin.module.css';
import { useNavigate } from 'react-router-dom';

interface CreatedUser {
  username: string;
  accessCode?: string;
  expirationDate: string;
}

const AdminSesions: React.FC = () => {
  const [validityMinutes, setValidityMinutes] = useState(60);
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const token = localStorage.getItem('authToken');

  const fetchCreatedUsers = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/v1/users/created`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCreatedUsers(data);
      }
    } catch (err) {
      console.error('Failed to load created users', err);
    }
  }, [token]);

  useEffect(() => {
    fetchCreatedUsers();
  }, [fetchCreatedUsers]);

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

  const navigate = useNavigate();

  return (
    <div className={styles.admin}>
      <div className={styles.admin_nav}>
        <button className={styles.button} onClick={() => navigate('/admin')}>
          ← Back
        </button>
        <h2 className={styles.admin_subtitle}>
          Admin Panel <br />
          <span>(sesions management)</span>
        </h2>
      </div>

      <section className={styles.section}>
        <h3>Create Player Account</h3>
        <div className={styles.formRow}>
          <label>Validity (min):</label>
          <input
            className={styles.input}
            style={{ maxWidth: '120px' }}
            type="number"
            min={1}
            value={validityMinutes}
            onChange={(e) => setValidityMinutes(parseInt(e.target.value))}
          />
          <button className={styles.button} onClick={createEphemeralUser}>
            Create
          </button>
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
              {[...createdUsers]
                .sort(
                  (a, b) =>
                    new Date(b.expirationDate).getTime() -
                    new Date(a.expirationDate).getTime()
                )
                .map((u, idx) => (
                  <tr key={u.username}>
                    <td>
                      {u.username}
                      <button
                        className={styles.copyButton}
                        onClick={() =>
                          handleCopy(u.username, `user-${idx}-name`)
                        }
                      >
                        Copy
                      </button>
                      {copiedKey === `user-${idx}-name` && (
                        <span className={styles.copied}>Copied!</span>
                      )}
                    </td>
                    <td>
                      {u.accessCode ?? 'N/A'}
                      {u.accessCode && (
                        <>
                          <button
                            className={styles.copyButton}
                            onClick={() =>
                              handleCopy(u.accessCode!, `user-${idx}-code`)
                            }
                          >
                            Copy
                          </button>
                          {copiedKey === `user-${idx}-code` && (
                            <span className={styles.copied}>Copied!</span>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      <span
                        className={
                          new Date(u.expirationDate) > new Date()
                            ? styles.date_next
                            : styles.date_old
                        }
                      >
                        {new Date(u.expirationDate).toLocaleString()}
                      </span>
                    </td>

                    {/*<td><span>{new Date(u.expirationDate).toLocaleString()}</span></td>*/}
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AdminSesions;
