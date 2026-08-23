import type { Plan, Speaker, TriadeEvent } from '@/types';

/**
 * Contrato da camada de dados.
 *
 * TUDO é assíncrono, mesmo no provider local — assim a UI não precisa mudar
 * quando o dado passa a vir da rede (Supabase). Esta é a fronteira: nenhum
 * componente deve conhecer `localStorage` nem o cliente do Supabase.
 */
export interface DataProvider {
  /** nome do provider ativo, útil para debug e para o rodapé de dev */
  readonly name: 'local' | 'supabase';

  /* ---- conteúdo (leitura) ---- */
  getEvents(): Promise<TriadeEvent[]>;
  getSpeakers(): Promise<Speaker[]>;
  getPlans(): Promise<Plan[]>;

  /* ---- engajamento da usuária ----
     Assíncrono desde o Módulo 2: com usuária logada e Supabase configurado,
     lê/grava nas tabelas de `supabase/schema.sql` (RLS por `auth.uid()`).
     Sem login (ou sem Supabase configurado), cada método cai exatamente no
     mesmo comportamento local de antes — ver `prefs.ts` (`engagement`). */
  isLiked(postId: string): Promise<boolean>;
  toggleLike(postId: string): Promise<boolean>;
  isSaved(postId: string): Promise<boolean>;
  toggleSave(postId: string): Promise<boolean>;
  hasRsvp(eventId: string): Promise<boolean>;
  rsvpEvent(eventId: string): Promise<string[]>;
  cancelRsvp(eventId: string): Promise<string[]>;
  getChosenPlan(): Promise<string | null>;
  choosePlan(planId: string): Promise<boolean>;
}
