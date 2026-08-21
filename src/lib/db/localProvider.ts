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

  ...engagement,
};
