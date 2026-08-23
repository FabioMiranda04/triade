import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { db } from '@/lib/db';
import { AccountSheet } from '@/components/AccountSheet';
import type { ProfileRow } from '@/types/database';

type ProfileEdits = Partial<Pick<ProfileRow, 'full_name' | 'bio' | 'instagram' | 'business'>>;

interface SignResult {
  error: string | null;
}

interface SignUpResult extends SignResult {
  /** true = precisa confirmar o e-mail antes de conseguir entrar */
  needsConfirmation: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: ProfileRow | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<SignResult>;
  /** Redireciona para o consentimento do Google — só volta pro app depois. */
  signInWithGoogle: () => Promise<SignResult>;
  signOut: () => Promise<void>;
  /** Atualiza nome/bio/Instagram/negócio do perfil da usuária logada. */
  updateProfile: (patch: ProfileEdits) => Promise<SignResult>;
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
  const [profile, setProfile] = useState<ProfileRow | null>(null);
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

  // Carrega o perfil da usuária logada e, se ainda não tem foto, preenche
  // com a do Google (nunca sobrescreve uma foto que a usuária já tenha).
  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    let alive = true;
    const client = supabase;
    client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!alive) return;
        let row = data;
        const googleAvatar = user.user_metadata?.avatar_url as string | undefined;
        if (row && !row.avatar_url && googleAvatar) {
          const { data: updated } = await client
            .from('profiles')
            .update({ avatar_url: googleAvatar })
            .eq('id', user.id)
            .select('*')
            .maybeSingle();
          row = updated ?? row;
        }
        if (alive) setProfile(row ?? null);
      });
    return () => {
      alive = false;
    };
  }, [user]);

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

  const signInWithGoogle = useCallback(async (): Promise<SignResult> => {
    if (!supabase) return { error: 'Conta indisponível sem o Supabase configurado.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error: error ? translateAuthError(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfileEdits): Promise<SignResult> => {
      if (!supabase || !user) return { error: 'Sem sessão.' };
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', user.id)
        .select('*')
        .maybeSingle();
      if (error) return { error: error.message };
      setProfile(data ?? null);
      return { error: null };
    },
    [user],
  );

  const openAccount = useCallback(() => setSheetOpen(true), []);

  const requireAuth = useCallback((): boolean => {
    if (db.name !== 'supabase' || user) return true;
    setSheetOpen(true);
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        openAccount,
        requireAuth,
      }}
    >
      {children}
      {sheetOpen && (
        <AccountSheet
          user={user}
          profile={profile}
          signIn={signIn}
          signUp={signUp}
          signInWithGoogle={signInWithGoogle}
          signOut={signOut}
          updateProfile={updateProfile}
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
