import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getToken, setToken, clearToken } from '@/lib/auth-token';
import { apiDailyLogin, apiLogin, apiMe, isAuthError, type ApiUser, type AuthSession } from '@/lib/api';
import { registerForPushNotifications } from '@/lib/push';

type AuthContextValue = {
  user: ApiUser | null;
  /** True until the stored session (if any) has been loaded from the secure store. */
  restoring: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  logout: () => Promise<void>;
  /** Merge partial fields into the current user held in context. */
  updateUser: (patch: Partial<ApiUser>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [restoring, setRestoring] = useState(true);

  // Restore a persisted session: the token is verified server-side before any screen shows.
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          setUser(await apiMe());
        }
      } catch (e) {
        // Expired or forged token: drop it. A network blip keeps it for the next launch.
        if (isAuthError(e)) await clearToken();
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const session: AuthSession = await apiLogin(email, password);
    setUser(session.user);
    return session.user;
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  // Once a user is signed in: register this device for push, and count today
  // toward their daily streak (the server ignores repeats on the same day).
  useEffect(() => {
    if (user) {
      registerForPushNotifications();
      apiDailyLogin().catch(() => {});
    }
  }, [user?.id]);

  const updateUser = (patch: Partial<ApiUser>) => {
    setUser(prev => (prev ? { ...prev, ...patch } : prev));
  };

  const value = useMemo(
    () => ({ user, restoring, login, logout, updateUser }),
    [user, restoring]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}