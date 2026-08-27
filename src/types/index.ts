/**
 * Tipos do domínio Tríade Conecta.
 * Estes tipos são o contrato entre a camada de dados (src/lib/storage.ts)
 * e a UI. Ao migrar para Supabase/Bubble DB, mantenha os mesmos tipos.
 */

export type EventStatus = 'realizado' | 'em breve';

export interface EventRecapMedia {
  tipo: 'foto' | 'vídeo';
  /** URL real (vídeo, ou foto quando já houver material real) ou gradiente CSS (placeholder de foto) */
  url: string;
  legenda?: string;
}

export interface TriadeEvent {
  id: string;
  title: string;
  /** ISO date, ex: "2026-09-19" */
  date: string;
  status: EventStatus;
  location: string;
  speaker: string;
  theme: string;
  /** número de vagas — omitido quando ainda não decidido (ex: evento recém-anunciado) */
  spots?: number;
  /** retrospectiva em texto — só eventos "realizado" costumam ter */
  recapText?: string;
  /** galeria de fotos/vídeos da retrospectiva — só eventos "realizado" costumam ter */
  recapMedia?: EventRecapMedia[];
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
  /** WhatsApp com DDI/DDD, em qualquer formatação (ex: "+55 62 8165-1103") */
  whatsapp: string;
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
  /** aba para onde o CTA leva, se houver (ignorado quando `eventId` existe) */
  ctaTab?: TabId;
  /** id do evento em `data/seed.ts` — quando presente, o CTA abre o pop-up de detalhes do evento em vez de navegar */
  eventId?: string;
  ctaLabel?: string;
  showActions: boolean;
}

export type TabId = 'inicio' | 'sobre' | 'eventos' | 'palestrantes' | 'planos';

export type EventFilter = 'todos' | EventStatus;
