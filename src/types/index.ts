/**
 * Tipos do domínio Tríade Conecta.
 * Estes tipos são o contrato entre a camada de dados (src/lib/storage.ts)
 * e a UI. Ao migrar para Supabase/Bubble DB, mantenha os mesmos tipos.
 */

export type EventStatus = 'realizado' | 'em breve';

export interface TriadeEvent {
  id: string;
  title: string;
  /** ISO date, ex: "2026-09-19" */
  date: string;
  status: EventStatus;
  location: string;
  speaker: string;
  theme: string;
  spots: number;
}

export interface Speaker {
  id: string;
  name: string;
  topic: string;
  bio: string;
}

export interface Plan {
  id: string;
  name: string;
  /** 0 = grátis */
  price: number;
  /** ex: "/mês", "/ano", "grátis" */
  period: string;
  featured: boolean;
  perks: string[];
}

export interface Founder {
  id: string;
  initials: string;
  name: string;
  role: string;
  blurb: string;
}

export interface Post {
  id: string;
  author: string;
  authorInitials: string;
  subtitle: string;
  caption: string;
  /** curtidas base (mock) — a curtida da usuária é somada em cima */
  baseLikes: number;
  /** gradiente CSS opcional para a área de imagem */
  mediaGradient?: string;
  /** aba para onde o CTA leva, se houver */
  ctaTab?: TabId;
  ctaLabel?: string;
  showActions: boolean;
}

export type TabId = 'inicio' | 'sobre' | 'eventos' | 'palestrantes' | 'planos';

export type EventFilter = 'todos' | EventStatus;
