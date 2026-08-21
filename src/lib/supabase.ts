import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Cliente do Supabase.
 *
 * Se as variáveis não estiverem definidas, exporta `null` e o app cai no
 * provider local automaticamente (ver `src/lib/db/index.ts`). Isso mantém o
 * `npm run dev` funcionando sem nenhuma configuração.
 *
 * As variáveis precisam do prefixo `VITE_` para chegarem ao navegador.
 * Só use a chave **anon** aqui — ela é pública por natureza e a proteção
 * real vem das políticas de RLS no banco. A `service_role` NUNCA entra no
 * front-end.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/** Uso interno dos providers: garante que o cliente existe. */
export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local',
    );
  }
  return supabase;
}
