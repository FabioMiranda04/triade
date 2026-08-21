import type { Founder, Plan, Post, Speaker, TriadeEvent } from '@/types';

/**
 * Conteúdo inicial (mock) do app.
 *
 * IMPORTANTE: este é o único lugar onde conteúdo "de negócio" fica escrito à
 * mão. Quando o backend real entrar (Módulo 4/6), estes arrays viram a carga
 * inicial do banco e a UI não muda.
 */

export const events: TriadeEvent[] = [
  {
    id: 'ed1',
    title: '1ª Edição — O início do movimento',
    date: '2025-04-12',
    status: 'realizado',
    location: 'Goiânia, GO',
    speaker: 'Idealizadoras da Tríade',
    theme: 'Conexões reais entre mulheres empreendedoras',
    spots: 65,
  },
  {
    id: 'ed2',
    title: '2ª Edição — Cultura e Gestão de Pessoas',
    date: '2025-08-23',
    status: 'realizado',
    location: 'Goiânia, GO',
    speaker: 'Marcela Zaidem',
    theme: 'Cultura, gestão e o olhar profundo sobre o feminino nos negócios',
    spots: 65,
  },
  {
    id: 'ed3',
    title: '3ª Edição — Gestão Financeira na prática',
    date: '2026-09-19',
    status: 'em breve',
    location: 'Goiânia, GO',
    speaker: 'Danielle Gouveia',
    theme: 'Finanças com clareza para quem empreende',
    spots: 85,
  },
];

export const speakers: Speaker[] = [
  {
    id: 'sp1',
    name: 'Marcela Zaidem',
    topic: 'Cultura e Gestão',
    bio: 'Especialista de renome nacional em cultura e gestão de pessoas.',
  },
  {
    id: 'sp2',
    name: 'Danielle Gouveia',
    topic: 'Gestão Financeira',
    bio: 'Referência em finanças aplicadas ao dia a dia de quem empreende.',
  },
  {
    id: 'sp3',
    name: 'Dani Morais Flor',
    topic: 'Relações Interpessoais',
    bio: 'Trabalha a escuta, a conexão genuína e o fortalecimento mútuo entre mulheres.',
  },
];

export const plans: Plan[] = [
  {
    id: 'pl1',
    name: 'Convidada',
    price: 0,
    period: 'grátis',
    featured: false,
    perks: [
      'Acesso à comunidade digital',
      'Conteúdo semanal sobre negócios e conexão',
      'Desconto no 1º encontro presencial',
    ],
  },
  {
    id: 'pl2',
    name: 'Membra Tríade',
    price: 97,
    period: '/mês',
    featured: true,
    perks: [
      'Tudo do plano Convidada',
      'Vaga garantida no encontro mensal',
      'Grupo exclusivo de trocas e indicações',
      'Descontos com marcas parceiras',
    ],
  },
  {
    id: 'pl3',
    name: 'Fundadora',
    price: 970,
    period: '/ano',
    featured: false,
    perks: [
      'Tudo do plano Membra Tríade',
      '2 meses grátis no plano anual',
      'Mentoria trimestral em grupo',
      'Prioridade em vagas VIP e brindes',
    ],
  },
];

export const founders: Founder[] = [
  {
    id: 'f1',
    initials: 'LD',
    name: 'Lívia Duarte',
    role: 'Gestora',
    blurb: 'Ex-Swarovski, hoje empreendedora.',
  },
  {
    id: 'f2',
    initials: 'LC',
    name: 'Lia Chaves',
    role: 'Mentora',
    blurb: 'Advogada e consultora de imagem.',
  },
  {
    id: 'f3',
    initials: 'CM',
    name: 'Cris Miranda',
    role: 'Estilo',
    blurb: 'Contadora e consultora de estilo.',
  },
];

export const posts: Post[] = [
  {
    id: 'post-ed3',
    author: 'Tríade Conecta',
    authorInitials: 'DG',
    subtitle: '3ª Edição · em breve',
    caption:
      'Gestão financeira na prática, com Danielle Gouveia — 19 de setembro, Goiânia. Garante sua vaga em Eventos ✨',
    baseLikes: 141,
    ctaTab: 'eventos',
    ctaLabel: 'Ver detalhes',
    showActions: true,
  },
  {
    id: 'post-recap',
    author: 'Lívia Duarte',
    authorInitials: 'LD',
    subtitle: 'idealizadora · 2ª edição',
    caption:
      'Recordando a 2ª edição, com Marcela Zaidem falando sobre cultura e gestão de pessoas 🤍',
    baseLikes: 98,
    mediaGradient: 'linear-gradient(135deg, var(--gold-soft), var(--wine))',
    showActions: true,
  },
];

export const timeline = [
  {
    id: 'tl1',
    label: '2025 · 1ª edição',
    text: 'O início do movimento — mulheres de diferentes trajetórias, a mesma vontade de crescer juntas.',
  },
  {
    id: 'tl2',
    label: '2025 · 2ª edição',
    text: 'Marcela Zaidem trouxe cultura e gestão de pessoas, com o olhar profundo sobre o feminino nos negócios.',
  },
  {
    id: 'tl3',
    label: '2026 · 3ª edição',
    text: 'Danielle Gouveia recebe a comunidade para falar de gestão financeira na prática.',
  },
];

export const seed = { events, speakers, plans };
