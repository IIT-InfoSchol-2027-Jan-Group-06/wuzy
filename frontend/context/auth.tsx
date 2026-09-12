import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getToken, setToken, clearToken } from '@/lib/auth-token';
import { apiLogin, apiMe, apiRecordDailyLogin, type ApiUser, type AuthSession } from '@/lib/api';
import { registerForPushNotifications } from '@/lib/push';

type AuthContextValue = {
  user: ApiUser | null;
  /** True until the stored session (if any) has been loaded from the secure store. */
  restoring: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  logout: () => Promise<void>;
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
      } catch {
        // Expired or forged token: drop it rather than trusting it.
        await clearToken();
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

  // Register this device's push token once a user is signed in, so chat
  // messages for them can arrive as OS notifications when they are away.
  useEffect(() => {
    if (user) {
      registerForPushNotifications();
      apiRecordDailyLogin();
    }
  }, [user]);

  const value = useMemo(() => ({ user, restoring, login, logout }), [user, restoring]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}