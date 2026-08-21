import { requireSupabase } from '@/lib/supabase';
import { seed } from '@/data/seed';
import type { Plan, Speaker, TriadeEvent } from '@/types';
import type { EventRow, PlanRow, SpeakerRow } from '@/types/database';
import type { DataProvider } from './types';
import { engagement } from './prefs';

/**
 * Provider Supabase — conteúdo (eventos, palestrantes, planos) vem do banco.
 *
 * Engajamento (curtir/salvar/RSVP/plano escolhido) continua local: sem
 * autenticação não há usuária a quem atribuir esses registros. As tabelas
 * já estão previstas em `supabase/schema.sql` e entram no Módulo 2.
 *
 * Estratégia de falha: se a consulta falhar (sem rede, RLS bloqueando,
 * tabela vazia), o app cai no conteúdo de `seed.ts` em vez de mostrar tela
 * em branco. O erro vai para o console.
 */

function mapEvent(row: EventRow): TriadeEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    status: row.status,
    location: row.location,
    speaker: row.speaker,
    theme: row.theme,
    spots: row.spots,
  };
}

function mapSpeaker(row: SpeakerRow): Speaker {
  return { id: row.id, name: row.name, topic: row.topic, bio: row.bio };
}

function mapPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    period: row.period,
    featured: row.featured,
    perks: row.perks ?? [],
  };
}

/** Executa a consulta e cai no seed se der erro ou vier vazio. */
async function withFallback<TRow, TOut>(
  label: string,
  run: () => Promise<{ data: TRow[] | null; error: { message: string } | null }>,
  map: (row: TRow) => TOut,
  fallback: TOut[],
): Promise<TOut[]> {
  try {
    const { data, error } = await run();
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      console.warn(`[supabase] ${label}: nenhuma linha retornada — usando o seed local.`);
      return fallback;
    }
    return data.map(map);
  } catch (err) {
    console.error(`[supabase] falha ao buscar ${label} — usando o seed local.`, err);
    return fallback;
  }
}

export const supabaseProvider: DataProvider = {
  name: 'supabase',

  getEvents: () =>
    withFallback(
      'events',
      async () =>
        requireSupabase()
          .from('events')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true }),
      mapEvent,
      seed.events,
    ),

  getSpeakers: () =>
    withFallback(
      'speakers',
      async () =>
        requireSupabase()
          .from('speakers')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true }),
      mapSpeaker,
      seed.speakers,
    ),

  getPlans: () =>
    withFallback(
      'plans',
      async () =>
        requireSupabase()
          .from('plans')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true }),
      mapPlan,
      seed.plans,
    ),

  ...engagement,
};
