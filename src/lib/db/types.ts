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
     Hoje sempre local: sem autenticação (Módulo 2) não existe usuária a
     quem atribuir curtida/presença no servidor. Ver supabase/schema.sql. */
  isLiked(postId: string): boolean;
  toggleLike(postId: string): boolean;
  isSaved(postId: string): boolean;
  toggleSave(postId: string): boolean;
  hasRsvp(eventId: string): boolean;
  rsvpEvent(eventId: string): string[];
  getChosenPlan(): string | null;
  choosePlan(planId: string): boolean;
}
