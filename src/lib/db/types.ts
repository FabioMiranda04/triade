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
  /** Total de curtidas do post, de todo mundo. 0 sem Supabase configurado. */
  contarCurtidas(postId: string): Promise<number>;
  toggleLike(postId: string): Promise<boolean>;
  isSaved(postId: string): Promise<boolean>;
  toggleSave(postId: string): Promise<boolean>;
  hasRsvp(eventId: string): Promise<boolean>;
  rsvpEvent(eventId: string): Promise<string[]>;
  cancelRsvp(eventId: string): Promise<string[]>;
  getChosenPlan(): Promise<string | null>;
  choosePlan(planId: string): Promise<boolean>;

  /* ---- edição de conteúdo (Módulo 5) ----
     Escrever conteúdo é privilégio, não função de qualquer usuária logada:
     o front usa a chave `anon`, que é pública. Quem escreve é quem está na
     tabela `admins` do Supabase, e essa lista só é alterada pelo SQL
     Editor do painel — ver seção 6 do `supabase/schema.sql`.

     Quando `podeEditarConteudo()` é `false` — sem Supabase, sem login, ou
     logada mas sem permissão — a UI mantém exatamente o comportamento de
     sempre: a edição fica no navegador, via `localContent.ts`. */

  /** `true` só para quem está na tabela `admins`. */
  podeEditarConteudo(): Promise<boolean>;

  /**
   * Sobe um arquivo para o bucket `media` e devolve a URL pública.
   * `pasta` agrupa por assunto (ex: o slug da edição).
   * Lança se não houver permissão — quem chama já deve ter checado
   * `podeEditarConteudo()`.
   */
  uploadMedia(arquivo: File, pasta: string): Promise<string>;

  /** Grava o evento no banco (insert ou update pelo `id`). */
  saveEvent(evento: TriadeEvent): Promise<void>;
}
