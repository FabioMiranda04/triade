import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { db } from '@/lib/db';
import { AccountSheet } from '@/components/AccountSheet';

interface SignResult {
  error: string | null;
}

interface SignUpResult extends SignResult {
  /** true = precisa confirmar o e-mail antes de conseguir entrar */
  needsConfirmation: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<SignResult>;
  signOut: () => Promise<void>;
  /** Sempre abre o pop-up de conta (login/cadastro ou perfil, se já logada). */
  openAccount: () => void;
  /**
   * true se já há usuária logada (ou se o app roda sem Supabase — nesse
   * caso não há como logar, então a ação segue livre, como sempre foi).
   * false abre o pop-up de conta e bloqueia a ação chamadora.
   */
  requireAuth: () => boolean;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Já existe uma conta com esse e-mail.',
  'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar — veja sua caixa de entrada.',
};

function translateAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? message;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Sessão da usuária (Supabase Auth) + o pop-up de conta, num só lugar. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<SignUpResult> => {
    if (!supabase) return { error: 'Conta indisponível sem o Supabase configurado.', needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: translateAuthError(error.message), needsConfirmation: false };
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<SignResult> => {
    if (!supabase) return { error: 'Conta indisponível sem o Supabase configurado.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? translateAuthError(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const openAccount = useCallback(() => setSheetOpen(true), []);

  const requireAuth = useCallback((): boolean => {
    if (db.name !== 'supabase' || user) return true;
    setSheetOpen(true);
    return false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, openAccount, requireAuth }}>
      {children}
      {sheetOpen && (
        <AccountSheet
          user={user}
          signIn={signIn}
          signUp={signUp}
          signOut={signOut}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
