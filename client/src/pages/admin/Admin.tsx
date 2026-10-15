import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './admin.module.css';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface PlayerSummary {
  username: string;
  expirationDate: string;
}

interface CreatedCode extends PlayerSummary {
  accessCode: string;
}

const VALIDITY_PRESETS = [45, 60, 120, 1440] as const;
const MAX_STUDENTS = 40;
const PARALLEL_REQUESTS = 4;

const useRelativeTime = () => {
  const { i18n } = useTranslation();
  return useMemo(() => {
    const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });
    return (iso: string) => {
      const minutes = Math.round(
        (new Date(iso).getTime() - Date.now()) / 60000
      );
      if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
      const hours = Math.round(minutes / 60);
      if (Math.abs(hours) < 48) return rtf.format(hours, 'hour');
      return rtf.format(Math.round(hours / 24), 'day');
    };
  }, [i18n.language]);
};

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const { username, logout } = useAuth();
  const relative = useRelativeTime();

  const [students, setStudents] = useState(25);
  const [validity, setValidity] = useState<number>(60);
  const [creating, setCreating] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [newCodes, setNewCodes] = useState<CreatedCode[]>([]);
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    try {
      setPlayers(await api<PlayerSummary[]>('/api/v1/users/created'));
    } catch {
      setMessage(t('admin.loadFailed'));
    }
  }, [t]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const createCodes = async () => {
    const total = Math.max(1, Math.min(MAX_STUDENTS, students));
    setMessage('');
    setNewCodes([]);
    setCreating({ done: 0, total });

    const created: CreatedCode[] = [];
    let next = 0;
    const worker = async () => {
      while (next < total) {
        next++;
        try {
          created.push(
            await api<CreatedCode>(
              `/api/v1/users/random?validityMinutes=${validity}`,
              { method: 'POST' }
            )
          );
        } catch {
          /* counted below */
        }
        setCreating({ done: created.length, total });
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(PARALLEL_REQUESTS, total) }, worker)
    );

    setNewCodes(created);
    setCreating(null);
    if (created.length < total) {
      setMessage(t('admin.createFailed', { created: created.length, total }));
    }
    loadPlayers();
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      /* clipboard blocked; the code stays visible to copy by hand */
    }
  };

  const now = Date.now();
  const sortedPlayers = [...players].sort(
    (a, b) =>
      new Date(b.expirationDate).getTime() -
      new Date(a.expirationDate).getTime()
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>Trafficking Escape</span>
        <nav className={styles.headerNav}>
          <span className={styles.who}>{username}</span>
          <Link to="/" className="shell-link">
            {t('admin.home')}
          </Link>
          <button type="button" className="shell-link" onClick={logout}>
            {t('admin.signOut')}
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>{t('admin.title')}</h1>
        <p className={styles.intro}>{t('admin.intro')}</p>

        <section className={styles.creator} aria-labelledby="create-heading">
          <h2 id="create-heading" className="visually-hidden">
            {t('admin.create', { count: students })}
          </h2>
          <label className={styles.field}>
            <span>{t('admin.howMany')}</span>
            <input
              type="number"
              min={1}
              max={MAX_STUDENTS}
              value={students}
              onChange={(e) =>
                setStudents(
                  Math.max(
                    1,
                    Math.min(MAX_STUDENTS, Number(e.target.value) || 1)
                  )
                )
              }
            />
          </label>

          <fieldset className={styles.field}>
            <legend>{t('admin.validFor')}</legend>
            <div className={styles.presets}>
              {VALIDITY_PRESETS.map((minutes) => (
                <label key={minutes} className={styles.preset}>
                  <input
                    type="radio"
                    name="validity"
                    value={minutes}
                    checked={validity === minutes}
                    onChange={() => setValidity(minutes)}
                  />
                  <span>{t(`admin.preset${minutes}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            className="shell-button"
            onClick={createCodes}
            disabled={!!creating}
          >
            {creating
              ? `${t('admin.creating')} ${creating.done}/${creating.total}`
              : t('admin.create', { count: students })}
          </button>
        </section>

        <p className={styles.message} role="status">
          {message}
        </p>

        {newCodes.length > 0 && (
          <section className={styles.newCodes} aria-labelledby="new-heading">
            <div className={styles.sectionHead}>
              <div>
                <h2 id="new-heading">{t('admin.newCodes')}</h2>
                <p>{t('admin.newCodesHelp')}</p>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className="shell-button"
                  onClick={() =>
                    copy(newCodes.map((c) => c.accessCode).join('\n'), 'all')
                  }
                >
                  {copied === 'all' ? t('admin.copied') : t('admin.copyAll')}
                </button>
                <button
                  type="button"
                  className="shell-button shell-button--quiet"
                  onClick={() => window.print()}
                >
                  {t('admin.print')}
                </button>
              </div>
            </div>

            {/* On paper these become cut-out slips, one per student. */}
            <ul className={styles.slips}>
              {newCodes.map((c) => (
                <li key={c.username} className={styles.slip}>
                  <span className={styles.slipGame}>Trafficking Escape</span>
                  <button
                    type="button"
                    className={styles.slipCode}
                    onClick={() => copy(c.accessCode, c.username)}
                    aria-label={`${t('admin.copy')} ${c.accessCode}`}
                  >
                    {c.accessCode}
                  </button>
                  <span className={styles.slipMeta}>
                    {copied === c.username
                      ? t('admin.copied')
                      : `${t('admin.expires')} ${relative(c.expirationDate)}`}
                  </span>
                  <span className={styles.slipUrl}>
                    {window.location.host}/login
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.players} aria-labelledby="players-heading">
          <h2 id="players-heading">{t('admin.yourPlayers')}</h2>
          {sortedPlayers.length === 0 ? (
            <p className={styles.empty}>{t('admin.empty')}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{t('admin.player')}</th>
                  <th scope="col">{t('admin.status')}</th>
                  <th scope="col">{t('admin.expires')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p) => {
                  const active = new Date(p.expirationDate).getTime() > now;
                  return (
                    <tr key={p.username} data-ended={!active || undefined}>
                      <td className={styles.username}>{p.username}</td>
                      <td>
                        <span className={styles.status} data-active={active}>
                          {active ? t('admin.active') : t('admin.expired')}
                        </span>
                      </td>
                      <td>
                        <time
                          dateTime={p.expirationDate}
                          title={new Date(p.expirationDate).toLocaleString()}
                        >
                          {relative(p.expirationDate)}
                        </time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

export default Admin;
