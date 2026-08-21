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
 */

export interface EventRow {
  id: string;
  title: string;
  date: string;
  status: 'realizado' | 'em breve';
  location: string;
  speaker: string;
  theme: string;
  spots: number;
  sort_order: number;
  published: boolean;
}

export interface SpeakerRow {
  id: string;
  name: string;
  topic: string;
  bio: string;
  sort_order: number;
  published: boolean;
}

export interface PlanRow {
  id: string;
  name: string;
  price: number;
  period: string;
  featured: boolean;
  perks: string[];
  sort_order: number;
  published: boolean;
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: Partial<EventRow> & Pick<EventRow, 'id' | 'title' | 'date' | 'status'>;
        Update: Partial<EventRow>;
      };
      speakers: {
        Row: SpeakerRow;
        Insert: Partial<SpeakerRow> & Pick<SpeakerRow, 'id' | 'name'>;
        Update: Partial<SpeakerRow>;
      };
      plans: {
        Row: PlanRow;
        Insert: Partial<PlanRow> & Pick<PlanRow, 'id' | 'name' | 'price'>;
        Update: Partial<PlanRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
