import { seed } from '@/data/seed';
import type { Plan, Speaker, TriadeEvent } from '@/types';
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
  getSpeakers: async (): Promise<Speaker[]> => readCache('speakers', seed.speakers),
  getPlans: async (): Promise<Plan[]> => readCache('plans', seed.plans),

  // Sem Supabase configurado não há autenticação possível — engajamento
  // é sempre local, só embrulhado em Promise para bater com a interface.
  isLiked: async (postId) => engagement.isLiked(postId),
  toggleLike: async (postId) => engagement.toggleLike(postId),
  isSaved: async (postId) => engagement.isSaved(postId),
  toggleSave: async (postId) => engagement.toggleSave(postId),
  hasRsvp: async (eventId) => engagement.hasRsvp(eventId),
  rsvpEvent: async (eventId) => engagement.rsvpEvent(eventId),
  cancelRsvp: async (eventId) => engagement.cancelRsvp(eventId),
  getChosenPlan: async () => engagement.getChosenPlan(),
  choosePlan: async (planId) => engagement.choosePlan(planId),
};
