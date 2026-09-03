import { seed } from '@/data/seed';
import type { Member, Plan, Post, Speaker, TriadeEvent } from '@/types';
import type { DataProvider } from './types';
import { engagement, readCache } from './prefs';

/**
 * Provider local — o app roda 100% no navegador, sem backend.
 *
 * É o padrão quando não há credenciais do Supabase configuradas, então
 * `npm run dev` funciona logo após o clone, sem nenhum setup.
 */
export const localProvider: DataProvider = {
  name: 'local',

  getEvents: async (): Promise<TriadeEvent[]> => readCache('events', seed.events),
  getPosts: async (): Promise<Post[]> => readCache('posts', seed.posts),
  getSpeakers: async (): Promise<Speaker[]> => readCache('speakers', seed.speakers),
  getPlans: async (): Promise<Plan[]> => readCache('plans', seed.plans),
  // Sem banco não existe comunidade: um diretório com gente de mentira
  // seria pior que um diretório vazio.
  getMembers: async (): Promise<Member[]> => [],

  // Sem Supabase configurado não há autenticação possível — engajamento
  // é sempre local, só embrulhado em Promise para bater com a interface.
  isLiked: async (postId) => engagement.isLiked(postId),
  // Sem banco não existe "curtida de todo mundo": a única que existe é a
  // desta aba. Mostrar um número inventado seria pior que mostrar zero.
  contarCurtidas: async (postId) => (engagement.isLiked(postId) ? 1 : 0),
  toggleLike: async (postId) => engagement.toggleLike(postId),
  isSaved: async (postId) => engagement.isSaved(postId),
  toggleSave: async (postId) => engagement.toggleSave(postId),
  hasRsvp: async (eventId) => engagement.hasRsvp(eventId),
  rsvpEvent: async (eventId) => engagement.rsvpEvent(eventId),
  cancelRsvp: async (eventId) => engagement.cancelRsvp(eventId),
  getChosenPlan: async () => engagement.getChosenPlan(),
  choosePlan: async (planId) => engagement.choosePlan(planId),

  // Sem backend não há a quem pedir permissão nem para onde subir arquivo.
  // A UI lê este `false` e mantém a edição no navegador, como sempre foi —
  // é o que faz `npm run dev` continuar mostrando o app inteiro logo após
  // o clone (regra 10 do CLAUDE.md).
  podeEditarConteudo: async () => false,
  uploadMedia: async () => {
    throw new Error('Sem Supabase configurado: não há para onde subir a imagem.');
  },
  saveEvent: async () => {
    throw new Error('Sem Supabase configurado: o evento é salvo só neste aparelho.');
  },
  savePost: async () => {
    throw new Error('Sem Supabase configurado: o post é salvo só neste aparelho.');
  },
  saveSpeaker: async () => {
    throw new Error('Sem Supabase configurado: a palestrante é salva só neste aparelho.');
  },
  savePlan: async () => {
    throw new Error('Sem Supabase configurado: o plano é salvo só neste aparelho.');
  },
};
