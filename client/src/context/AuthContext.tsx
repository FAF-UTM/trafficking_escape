import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, AUTH_EXPIRED_EVENT } from '../lib/api';

export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

/** What the backend says about the current session; the token itself stays in an HttpOnly cookie. */
interface SessionResponse {
  authenticated: boolean;
  userId: number | null;
  username: string | null;
  role: Role | null;
  expiresAt: string | null;
}

export interface Session {
  userId: string;
  username: string;
  role: Role;
  expiresAt: number;
}

interface AuthContextProps {
  /** True until the backend has told us whether a session exists. */
  loading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  userId: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<Session>;
  loginWithAccessCode: (code: string, oneTime?: boolean) => Promise<Session>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const toSession = (res: SessionResponse): Session | null =>
  res.authenticated && res.userId != null && res.username && res.role
    ? {
        userId: String(res.userId),
        username: res.username,
        role: res.role,
        expiresAt: res.expiresAt ? Date.parse(res.expiresAt) : Infinity,
      }
    : null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Ask the backend whether the browser holds a valid session cookie.
  useEffect(() => {
    let cancelled = false;
    api<SessionResponse>('/api/v1/auth/session')
      .then((res) => !cancelled && setSession(toSession(res)))
      .catch(() => !cancelled && setSession(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback((res: SessionResponse) => {
    const next = toSession(res);
    if (!next) throw new Error('Sign-in did not return a session');
    setSession(next);
    return next;
  }, []);

  const login = useCallback(
    async (username: string, password: string) =>
      startSession(
        await api<SessionResponse>('/api/v1/users/token', {
          method: 'POST',
          body: { username, password },
        })
      ),
    [startSession]
  );

  const loginWithAccessCode = useCallback(
    async (code: string, oneTime = false) =>
      startSession(
        await api<SessionResponse>('/api/v1/users/access-code', {
          method: 'POST',
          body: { code, oneTime },
        })
      ),
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      // The cookie is HttpOnly, so only the backend can remove it. Wait for that before
      // updating the UI: navigating away first would cancel the request and keep the cookie.
      await api('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      /* offline: the cookie still expires on its own */
    } finally {
      setSession(null);
    }
  }, []);

  // The backend rejected the cookie (expired, revoked secret): treat as signed out.
  useEffect(() => {
    const onExpired = () => setSession(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  // Drop the session locally at the moment it expires; the browser drops the cookie then too.
  useEffect(() => {
    if (!session || !Number.isFinite(session.expiresAt)) return;
    const ms = session.expiresAt - Date.now();
    const id = window.setTimeout(
      () => setSession(null),
      Math.max(0, Math.min(ms, 2 ** 31 - 1))
    );
    return () => window.clearTimeout(id);
  }, [session]);

  const value = useMemo<AuthContextProps>(
    () => ({
      loading,
      isAuthenticated: session !== null,
      role: session?.role ?? null,
      userId: session?.userId ?? null,
      username: session?.username ?? null,
      login,
      loginWithAccessCode,
      logout,
    }),
    [loading, session, login, loginWithAccessCode, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute: React.FC<{
  children: ReactNode;
  roles: Role[];
}> = ({ children, roles }) => {
  const { loading, isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Wait for the session check instead of bouncing a signed-in user to the login page.
  if (loading) return null;

  if (!isAuthenticated || !role || !roles.includes(role)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};
