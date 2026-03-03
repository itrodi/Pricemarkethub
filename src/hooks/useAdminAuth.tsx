import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signOut: async () => {},
  isAuthenticated: false,
});

const DEMO_ADMIN_EMAIL = 'admin@pricewise.ng';
const DEMO_ADMIN_PASSWORD = 'pricewise2025';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      const stored = localStorage.getItem('pw_admin_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.email && parsed.expiry > Date.now()) {
            setUser({ id: 'demo-admin', email: parsed.email });
          } else {
            localStorage.removeItem('pw_admin_session');
          }
        } catch {
          localStorage.removeItem('pw_admin_session');
        }
      }
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
      }
      return {};
    }

    if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      const session = { email, expiry: Date.now() + 8 * 60 * 60 * 1000 };
      localStorage.setItem('pw_admin_session', JSON.stringify(session));
      setUser({ id: 'demo-admin', email });
      return {};
    }

    return { error: 'Invalid email or password.' };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('pw_admin_session');
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, loading, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
