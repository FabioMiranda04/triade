import { useState } from 'react';
import type { FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { Icon } from '@/components/Icon';
import { ModalOverlay } from '@/components/ModalOverlay';

interface AccountSheetProps {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  onClose: () => void;
}

type Mode = 'entrar' | 'cadastrar' | 'confirmar-email';

/** Pop-up de conta: login/cadastro quando deslogada, perfil + sair quando logada. */
export function AccountSheet({ user, signIn, signUp, signOut, onClose }: AccountSheetProps) {
  const [mode, setMode] = useState<Mode>('entrar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    if (mode === 'entrar') {
      const result = await signIn(email, password);
      setSubmitting(false);
      if (result.error) setError(result.error);
      else onClose();
    } else {
      const result = await signUp(email, password, name);
      setSubmitting(false);
      if (result.error) setError(result.error);
      else if (result.needsConfirmation) setMode('confirmar-email');
      else onClose();
    }
  }

  if (user) {
    return (
      <ModalOverlay onClose={onClose}>
        <div
          className="modal-sheet glass-dark"
          role="dialog"
          aria-modal="true"
          aria-label="Sua conta"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
          <div className="modal-ph">
            <Icon name="user" size={26} />
          </div>
          <h2 className="modal-title">Sua conta</h2>
          <p className="modal-theme">{user.email}</p>
          <button
            className="btn btn-glass full"
            style={{ marginTop: 20 }}
            onClick={async () => {
              await signOut();
              onClose();
            }}
          >
            Sair da conta
          </button>
        </div>
      </ModalOverlay>
    );
  }

  if (mode === 'confirmar-email') {
    return (
      <ModalOverlay onClose={onClose}>
        <div
          className="modal-sheet glass-dark"
          role="dialog"
          aria-modal="true"
          aria-label="Confirme seu e-mail"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
          <div className="modal-ph">
            <Icon name="check" size={26} />
          </div>
          <h2 className="modal-title">Confira seu e-mail</h2>
          <p className="modal-theme">
            Mandamos um link de confirmação para <b>{email}</b>. Toque nele para ativar sua conta
            e depois volte aqui para entrar.
          </p>
          <button className="btn btn-primary full" style={{ marginTop: 16 }} onClick={onClose}>
            Entendi
          </button>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClose={onClose}>
      <form
        className="modal-sheet glass-dark"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'entrar' ? 'Entrar' : 'Criar conta'}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button type="button" className="modal-close" aria-label="Fechar" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <h2 className="modal-title">{mode === 'entrar' ? 'Entrar' : 'Criar conta'}</h2>
        <p className="modal-theme">
          {mode === 'entrar'
            ? 'Entre para curtir, confirmar presença e escolher seu plano.'
            : 'Crie sua conta para fazer parte da comunidade.'}
        </p>
        <div className="edit-fields">
          {mode === 'cadastrar' && (
            <label className="field">
              <span>Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          )}
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary full" disabled={submitting}>
          {submitting ? 'Só um instante...' : mode === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>
        <button
          type="button"
          className="modal-back"
          style={{ marginTop: 14, marginBottom: 0 }}
          onClick={() => {
            setError(null);
            setMode(mode === 'entrar' ? 'cadastrar' : 'entrar');
          }}
        >
          {mode === 'entrar' ? 'Ainda não tenho conta' : 'Já tenho conta'}
        </button>
      </form>
    </ModalOverlay>
  );
}
