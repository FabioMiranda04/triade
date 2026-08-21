import { isSupabaseConfigured } from '@/lib/supabase';
import { localProvider } from './localProvider';
import { supabaseProvider } from './supabaseProvider';
import { resetLocal } from './prefs';
import type { DataProvider } from './types';

/**
 * `db` é o ÚNICO objeto que a UI usa para ler ou gravar dados.
 *
 * O provider é escolhido pelas variáveis de ambiente:
 *   - VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY definidas → Supabase
 *   - caso contrário                                       → local
 *
 * Ou seja: quem clona o repositório roda `npm run dev` e o app funciona sem
 * configurar nada; quando as chaves entram (local ou na Vercel), o mesmo
 * código passa a ler do banco.
 */
export const db: DataProvider = isSupabaseConfigured ? supabaseProvider : localProvider;

/** Limpa as preferências locais — só para desenvolvimento. */
export const resetLocalData = resetLocal;

export type { DataProvider } from './types';
