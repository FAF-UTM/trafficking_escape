import React, { useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './login.module.css';
import { useAuth } from '../../context/AuthContext';
import { describeError } from '../../lib/errors';
import CodeInput from './CodeInput';
import LanguageSwitch from '../../components/shell/LanguageSwitch';

type Mode = 'code' | 'password';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, loginWithAccessCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [mode, setMode] = useState<Mode>('code');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const errorId = useId();

  const goAfterLogin = (role: string) => {
    if (role === 'ROLE_ADMIN') navigate('/admin', { replace: true });
    else
      navigate(from && from !== '/admin' ? from : '/chat', { replace: true });
  };

  const submitCode = async (value: string) => {
    if (busy || value.length !== 6) return;
    setBusy(true);
    setError('');
    try {
      const session = await loginWithAccessCode(value, true);
      goAfterLogin(session.role);
    } catch (e) {
      setError(describeError(e, t, 'login.codeInvalid'));
      setBusy(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const session = await login(username.trim(), password);
      goAfterLogin(session.role);
    } catch (err) {
      setError(describeError(err, t, 'login.credentialsInvalid'));
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  return (
    <main className={styles.login}>
      <section className={styles.panel}>
        <div className={styles.topbar}>
          <Link to="/" className="shell-link">
            {t('general.home')}
          </Link>
          <LanguageSwitch />
        </div>

        <div className={styles.content}>
          {mode === 'code' ? (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                submitCode(code);
              }}
              noValidate
            >
              <h1 className={styles.title}>{t('login.title')}</h1>
              <p className={styles.help}>{t('login.codeHelp')}</p>
              <CodeInput
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (error) setError('');
                }}
                onComplete={submitCode}
                disabled={busy}
                invalid={!!error}
                describedBy={error ? errorId : undefined}
              />
              <button
                type="submit"
                className="shell-button"
                disabled={busy || code.length !== 6}
              >
                {busy ? t('login.checking') : t('login.submitCode')}
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={submitPassword} noValidate>
              <h1 className={styles.title}>{t('login.teacherTitle')}</h1>
              <label className={styles.field}>
                <span>{t('login.username')}</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? errorId : undefined}
                />
              </label>
              <label className={styles.field}>
                <span>{t('login.password')}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? errorId : undefined}
                />
              </label>
              <button
                type="submit"
                className="shell-button"
                disabled={busy || !username || !password}
              >
                {busy ? t('login.checking') : t('login.submitPassword')}
              </button>
            </form>
          )}

          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>

          <button
            type="button"
            className="shell-link"
            onClick={() => switchMode(mode === 'code' ? 'password' : 'code')}
          >
            {mode === 'code' ? t('login.teacherLink') : t('login.playerLink')}
          </button>
        </div>
      </section>
      <div className={styles.art} aria-hidden="true" />
    </main>
  );
};

export default LoginPage;
