/**
 * Tipos das tabelas do Supabase.
 *
 * Espelham `supabase/schema.sql`. Ao alterar o schema, atualize aqui —
 * ou gere automaticamente:
 *
 *   npx supabase gen types typescript --project-id <ID> > src/types/database.ts
 *
 * Note que o banco usa snake_case e o app usa camelCase; a conversão
 * acontece em `src/lib/db/supabaseProvider.ts`.
 *
 * IMPORTANTE: as linhas (`*Row`) precisam ser `type`, nunca `interface`.
 * O `@supabase/supabase-js` v2 exige que cada linha satisfaça
 * `Record<string, unknown>` para inferir o schema tipado — e uma
 * `interface` (diferente de um `type` com o mesmo formato) não satisfaz
 * essa checagem estrutural no TypeScript. Se isso quebrar de novo, todo
 * `.from(tabela)` cai silenciosamente para `never` sem erro nenhum na
 * declaração — só aparece bem depois, ao usar o resultado (ex:
 * `Property 'x' does not exist on type 'never'`).
 */

import type { EventRecapMedia } from '@/types';

export type EventRow = {
  id: string;
  title: string;
  date: string;
  status: 'realizado' | 'em breve';
  location: string;
  speaker: string;
  theme: string;
  spots: number | null;
  recap_text: string | null;
  recap_media: EventRecapMedia[] | null;
  sort_order: number;
  published: boolean;
}

export type SpeakerRow = {
  id: string;
  name: string;
  topic: string;
  bio: string;
  sort_order: number;
  published: boolean;
}

export type PlanRow = {
  id: string;
  name: string;
  price: number;
  period: string;
  featured: boolean;
  perks: string[];
  sort_order: number;
  published: boolean;
}

export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram: string | null;
  business: string | null;
  created_at: string;
  updated_at: string;
}

export type RsvpRow = {
  user_id: string;
  event_id: string;
  created_at: string;
}

export type PostEngagementRow = {
  user_id: string;
  post_id: string;
  kind: 'like' | 'save';
  created_at: string;
}

export type PlanSelectionRow = {
  user_id: string;
  plan_id: string;
  status: 'selecionado' | 'ativo' | 'cancelado';
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: Partial<EventRow> & Pick<EventRow, 'id' | 'title' | 'date' | 'status'>;
        Update: Partial<EventRow>;
        Relationships: [];
      };
      speakers: {
        Row: SpeakerRow;
        Insert: Partial<SpeakerRow> & Pick<SpeakerRow, 'id' | 'name'>;
        Update: Partial<SpeakerRow>;
        Relationships: [];
      };
      plans: {
        Row: PlanRow;
        Insert: Partial<PlanRow> & Pick<PlanRow, 'id' | 'name' | 'price'>;
        Update: Partial<PlanRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, 'id'>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      rsvps: {
        Row: RsvpRow;
        Insert: Partial<RsvpRow> & Pick<RsvpRow, 'user_id' | 'event_id'>;
        Update: Partial<RsvpRow>;
        Relationships: [];
      };
      post_engagements: {
        Row: PostEngagementRow;
        Insert: Partial<PostEngagementRow> & Pick<PostEngagementRow, 'user_id' | 'post_id' | 'kind'>;
        Update: Partial<PostEngagementRow>;
        Relationships: [];
      };
      plan_selections: {
        Row: PlanSelectionRow;
        Insert: Partial<PlanSelectionRow> & Pick<PlanSelectionRow, 'user_id' | 'plan_id'>;
        Update: Partial<PlanSelectionRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
