import { requireSupabase } from '@/lib/supabase';
import { seed } from '@/data/seed';
import type { Plan, Speaker, TriadeEvent } from '@/types';
import type { EventRow, PlanRow, SpeakerRow } from '@/types/database';
import type { DataProvider } from './types';
import { engagement } from './prefs';

/**
 * Provider Supabase — conteúdo (eventos, palestrantes, planos) vem do banco.
 *
 * Engajamento (curtir/salvar/RSVP/plano escolhido) vai para o Supabase
 * **só quando há usuária logada** (Módulo 2) — as tabelas já existem no
 * projeto real, com RLS restrita por `auth.uid()`. Sem sessão, cada método
 * cai no exato mesmo comportamento local de sempre (`engagement`, de
 * `prefs.ts`) — é o que faz o app continuar livre para quem não quer criar
 * conta, com o gate de login ficando na UI (`useAuth().requireAuth()`), não
 * aqui.
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
    recapText: row.recap_text ?? undefined,
    recapMedia: row.recap_media && row.recap_media.length > 0 ? row.recap_media : undefined,
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

async function getUserId(): Promise<string | null> {
  const { data } = await requireSupabase().auth.getSession();
  return data.session?.user.id ?? null;
}

async function myRsvpIds(uid: string): Promise<string[]> {
  const { data } = await requireSupabase().from('rsvps').select('event_id').eq('user_id', uid);
  return (data ?? []).map((row) => row.event_id);
}

async function isLiked(postId: string): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return engagement.isLiked(postId);
  const { data } = await requireSupabase()
    .from('post_engagements')
    .select('post_id')
    .eq('user_id', uid)
    .eq('post_id', postId)
    .eq('kind', 'like')
    .maybeSingle();
  return !!data;
}

async function toggleLike(postId: string): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return engagement.toggleLike(postId);
  const client = requireSupabase();
  if (await isLiked(postId)) {
    await client.from('post_engagements').delete().eq('user_id', uid).eq('post_id', postId).eq('kind', 'like');
    return false;
  }
  await client.from('post_engagements').insert({ user_id: uid, post_id: postId, kind: 'like' });
  return true;
}

async function isSaved(postId: string): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return engagement.isSaved(postId);
  const { data } = await requireSupabase()
    .from('post_engagements')
    .select('post_id')
    .eq('user_id', uid)
    .eq('post_id', postId)
    .eq('kind', 'save')
    .maybeSingle();
  return !!data;
}

async function toggleSave(postId: string): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return engagement.toggleSave(postId);
  const client = requireSupabase();
  if (await isSaved(postId)) {
    await client.from('post_engagements').delete().eq('user_id', uid).eq('post_id', postId).eq('kind', 'save');
    return false;
  }
  await client.from('post_engagements').insert({ user_id: uid, post_id: postId, kind: 'save' });
  return true;
}

async function hasRsvp(eventId: string): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return engagement.hasRsvp(eventId);
  const { data } = await requireSupabase()
    .from('rsvps')
    .select('event_id')
    .eq('user_id', uid)
    .eq('event_id', eventId)
    .maybeSingle();
  return !!data;
}

async function rsvpEvent(eventId: string): Promise<string[]> {
  const uid = await getUserId();
  if (!uid) return engagement.rsvpEvent(eventId);
  await requireSupabase().from('rsvps').upsert({ user_id: uid, event_id: eventId });
  return myRsvpIds(uid);
}

async function cancelRsvp(eventId: string): Promise<string[]> {
  const uid = await getUserId();
  if (!uid) return engagement.cancelRsvp(eventId);
  await requireSupabase().from('rsvps').delete().eq('user_id', uid).eq('event_id', eventId);
  return myRsvpIds(uid);
}

async function getChosenPlan(): Promise<string | null> {
  const uid = await getUserId();
  if (!uid) return engagement.getChosenPlan();
  const { data } = await requireSupabase()
    .from('plan_selections')
    .select('plan_id')
    .eq('user_id', uid)
    .maybeSingle();
  return data?.plan_id ?? null;
}

async function choosePlan(planId: string): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return engagement.choosePlan(planId);
  const { error } = await requireSupabase()
    .from('plan_selections')
    .upsert({ user_id: uid, plan_id: planId, status: 'selecionado' });
  return !error;
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

  isLiked,
  toggleLike,
  isSaved,
  toggleSave,
  hasRsvp,
  rsvpEvent,
  cancelRsvp,
  getChosenPlan,
  choosePlan,
};







