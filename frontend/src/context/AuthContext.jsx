import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import * as api from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'relaydesk.auth';
const DEFAULT_TIMEOUT_MINUTES = 10;

function readStoredSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const expiresAtRef = useRef(session?.expiresAt || null);

  useEffect(() => {
    if (session) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      expiresAtRef.current = session.expiresAt;
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      expiresAtRef.current = null;
    }
  }, [session]);

  const signOut = useCallback((reason) => {
    setSession(null);
    setSecondsRemaining(null);
    if (reason) {
      console.info(`Signed out: ${reason}`);
    }
  }, []);

  // ---- Session countdown ----
  // Fixed 10-minute (or admin-configured) countdown starting at login.
  // Deliberately does NOT reset on mouse movement, clicks, or scrolling —
  // only a fresh login starts a new timer. expiresAt is persisted in
  // sessionStorage, so a page refresh continues the same countdown instead
  // of restarting it.
  useEffect(() => {
    if (!session) return undefined;

    const tick = () => {
      const remaining = Math.max(0, Math.round((expiresAtRef.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        signOut('session timed out');
      }
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(session)]);

  async function signIn(email, password) {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const { token, agent, sessionTimeoutMinutes } = await api.login(email, password);
      const timeoutMinutes = sessionTimeoutMinutes || DEFAULT_TIMEOUT_MINUTES;
      const expiresAt = Date.now() + timeoutMinutes * 60 * 1000;
      setSession({ token, agent, timeoutMinutes, expiresAt });
      return true;
    } catch (err) {
      setError(err.message || 'Login failed.');
      setErrorCode(err.code || null);
      return false;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    token: session?.token || null,
    agent: session?.agent || null,
    isAuthenticated: Boolean(session?.token),
    loading,
    error,
    errorCode,
    secondsRemaining,
    sessionTimeoutMinutes: session?.timeoutMinutes || DEFAULT_TIMEOUT_MINUTES,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
