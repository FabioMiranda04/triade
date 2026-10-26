// Código compartilhado das Edge Functions de ingresso — SPEC-003.
// Roda no Deno do Supabase, não no Vite: fica fora do `tsconfig` do app.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export const INFINITEPAY = 'https://api.checkout.infinitepay.io';

/** Segredo de Edge Function, nunca `VITE_*` (R11 / SPEC-002 D3). */
export function segredo(nome: string): string {
  const valor = Deno.env.get(nome);
  if (!valor) throw new Error(`secret ${nome} não configurado`);
  return valor;
}

/** Cliente com service_role: só ele escreve em `tickets` (não há política de escrita). */
export function admin() {
  return createClient(segredo('SUPABASE_URL'), segredo('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
}

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
