import { requireSupabase } from '@/lib/supabase';
import { seed } from '@/data/seed';
import type { Plan, Post, Speaker, TriadeEvent } from '@/types';
import type { EventRow, PlanRow, PostRow, SpeakerRow } from '@/types/database';
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
    endDate: row.end_date ?? undefined,
    status: row.status,
    location: row.location,
    speaker: row.speaker,
    theme: row.theme,
    spots: row.spots || undefined,
    recapText: row.recap_text ?? undefined,
    recapMedia: row.recap_media && row.recap_media.length > 0 ? row.recap_media : undefined,
  };
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    author: row.author,
    authorInitials: row.author_initials,
    subtitle: row.subtitle,
    caption: row.caption,
    mediaUrl: row.media_url ?? undefined,
    mediaGradient: row.media_gradient ?? undefined,
    eventId: row.event_id ?? undefined,
    ctaTab: (row.cta_tab as Post['ctaTab']) ?? undefined,
    ctaLabel: row.cta_label ?? undefined,
    showActions: row.show_actions,
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

async function contarCurtidas(postId: string): Promise<number> {
  const { data, error } = await requireSupabase().rpc('curtidas_do_post', { p_post_id: postId });
  if (error) {
    console.error('[triade] não deu para contar as curtidas:', error.message);
    return 0;
  }
  return data ?? 0;
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


/* ---------------- edição de conteúdo (Módulo 5) ---------------- */

/** Bucket público do Storage onde a mídia real do app vive desde o Módulo 11. */
const BUCKET = 'media';

async function podeEditarConteudo(): Promise<boolean> {
  const supabase = requireSupabase();
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user) return false;
  // A política de select da tabela devolve só a própria linha, então esta
  // consulta responde exatamente "eu sou admin?" e nada além disso.
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', sessao.user.id)
    .maybeSingle();
  if (error) {
    console.error('[triade] não deu para verificar permissão de edição:', error.message);
    return false;
  }
  return data !== null;
}

/**
 * Nome de arquivo seguro e único.
 *
 * Sem isto, subir "Foto da Lívia (1).JPG" gera uma chave com espaço,
 * parêntese e acento — que sobrevive ao upload mas volta escapada na URL
 * pública e quebra na hora de exibir. O carimbo de tempo evita que duas
 * fotos com o mesmo nome se sobrescrevam.
 */
function nomeSeguro(original: string): string {
  const ponto = original.lastIndexOf('.');
  const ext = ponto > 0 ? original.slice(ponto + 1).toLowerCase() : 'jpg';
  const base = (ponto > 0 ? original.slice(0, ponto) : original)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'foto';
  return `${base}-${Date.now()}.${ext.replace(/[^a-z0-9]/g, '') || 'jpg'}`;
}

async function uploadMedia(arquivo: File, pasta: string): Promise<string> {
  const supabase = requireSupabase();
  const caminho = `${pasta}/${nomeSeguro(arquivo.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, arquivo, { contentType: arquivo.type || 'image/jpeg', upsert: false });
  if (error) throw new Error(`Falha ao subir a imagem: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  return data.publicUrl;
}

async function savePost(post: Post): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('posts').upsert({
    id: post.id,
    author: post.author,
    author_initials: post.authorInitials,
    subtitle: post.subtitle,
    caption: post.caption,
    media_url: post.mediaUrl ?? null,
    media_gradient: post.mediaGradient ?? null,
    event_id: post.eventId ?? null,
    cta_tab: post.ctaTab ?? null,
    cta_label: post.ctaLabel ?? null,
    show_actions: post.showActions,
  });
  if (error) throw new Error(`Falha ao salvar o post: ${error.message}`);
}

async function saveSpeaker(palestrante: Speaker): Promise<void> {
  const { error } = await requireSupabase().from('speakers').upsert({
    id: palestrante.id,
    name: palestrante.name,
    topic: palestrante.topic,
    bio: palestrante.bio,
  });
  if (error) throw new Error(`Falha ao salvar a palestrante: ${error.message}`);
}

async function savePlan(plano: Plan): Promise<void> {
  const { error } = await requireSupabase().from('plans').upsert({
    id: plano.id,
    name: plano.name,
    price: plano.price,
    period: plano.period,
    featured: plano.featured,
    perks: plano.perks,
  });
  if (error) throw new Error(`Falha ao salvar o plano: ${error.message}`);
}

async function saveEvent(evento: TriadeEvent): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('events').upsert({
    id: evento.id,
    title: evento.title,
    date: evento.date,
    end_date: evento.endDate ?? null,
    status: evento.status,
    location: evento.location,
    speaker: evento.speaker,
    theme: evento.theme,
    spots: evento.spots ?? null,
    recap_text: evento.recapText ?? null,
    recap_media: evento.recapMedia ?? [],
  });
  if (error) throw new Error(`Falha ao salvar o evento: ${error.message}`);
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

  getPosts: () =>
    withFallback(
      'posts',
      async () =>
        requireSupabase()
          .from('posts')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true }),
      mapPost,
      seed.posts,
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
  contarCurtidas,
  toggleLike,
  isSaved,
  toggleSave,
  hasRsvp,
  rsvpEvent,
  cancelRsvp,
  getChosenPlan,
  choosePlan,

  podeEditarConteudo,
  uploadMedia,
  saveEvent,
  savePost,
  saveSpeaker,
  savePlan,
};







