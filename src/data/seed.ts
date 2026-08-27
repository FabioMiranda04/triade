import type { Founder, Plan, Post, Speaker, TriadeEvent } from '@/types';

/**
 * Conteúdo inicial (mock) do app.
 *
 * IMPORTANTE: este é o único lugar onde conteúdo "de negócio" fica escrito à
 * mão. Quando o backend real entrar (Módulo 4/6), estes arrays viram a carga
 * inicial do banco e a UI não muda.
 */

/**
 * Histórico de edições reconstruído a partir do export oficial do Instagram
 * (Módulo 11, sessão 18) — datas, temas, palestrantes e fotos são todos
 * reais, cruzados entre legendas de posts/reels e picos de Stories no dia
 * (sinal de evento presencial ao vivo). Onde a legenda não confirma um
 * número de edição explícito, o título não afirma um — evita numeração
 * inventada num histórico que é público.
 */
export const events: TriadeEvent[] = [
  {
    id: 'ed-set25',
    title: 'Edição Especial — Casa Benedita',
    date: '2025-09-15',
    status: 'realizado',
    location: 'Casa Benedita, Goiânia, GO',
    speaker: 'Geórgia Maia',
    theme: 'Conexões verdadeiras, aprendizados compartilhados e um pouco de marketing',
    recapText:
      'Um encontro pensado para empreendedoras, profissionais autônomas e comerciantes expandirem sua rede — com direito a uma conversa sobre marketing com Geórgia Maia. A resposta de quem esteve na Casa Benedita confirmou: era isso que fazia falta.',
    recapMedia: [
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-especial-2025-09/foto-1.jpg',
        legenda: 'Aprendendo sobre marketing com Geórgia Maia',
      },
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-especial-2025-09/foto-2.jpg',
        legenda: 'No cantinho da marca',
      },
    ],
  },
  {
    id: 'ed-out25',
    title: 'Edição com Carla Martins',
    date: '2025-10-20',
    status: 'realizado',
    location: 'Goiânia, GO',
    speaker: 'Carla Martins',
    theme: 'Liderança feminina: o primeiro púlpito de uma mulher — sua família, sua casa e seu lar',
    recapText:
      'Carla Martins, especialista em liderança feminina, trouxe um tema pedido pelas próprias participantes: será que dá pra ter sucesso também dentro de casa? Um encontro sobre equilibrar pratos e papéis sem perder a essência.',
    recapMedia: [
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-carla-martins-2025-10/foto-1.jpg',
        legenda: 'Quando mulheres se encontram, tudo muda',
      },
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-carla-martins-2025-10/foto-2.jpg',
        legenda: 'Conectar, aprender e se inspirar',
      },
    ],
  },
  {
    id: 'ed6-nov25',
    title: '6ª Edição',
    date: '2025-11-17',
    status: 'realizado',
    location: 'Goiânia, GO',
    speaker: 'Idealizadoras da Tríade',
    theme: 'Acolher, inspirar e impulsionar mulheres — fechando o ano com chave de ouro',
    recapText:
      'Casa cheia para encerrar o ano: a 6ª edição reuniu quem já acredita no movimento criado por Lívia, Lia e Cris para acolher, inspirar e impulsionar mulheres, gerando conexões autênticas.',
    recapMedia: [
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/6a-edicao-2025-11/foto-1.jpg',
        legenda: 'Lívia, Lia e Cris com convidadas',
      },
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/6a-edicao-2025-11/foto-2.jpg',
        legenda: 'A vida é feita de boas conexões',
      },
    ],
  },
  {
    id: 'ed9-mar26',
    title: '9ª Edição',
    date: '2026-03-31',
    status: 'realizado',
    location: 'Goiânia, GO',
    speaker: 'Idealizadoras da Tríade',
    theme: 'Conexão, aprendizado e fortalecimento de vínculos',
    recapText:
      'A 9ª edição chegou com a mesma proposta desde o início: mesas que levam quem participa a um próximo nível, num ambiente feito pra conectar, aprender e fortalecer vínculos.',
    recapMedia: [
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/9a-edicao-2026-03/foto-1.jpg',
        legenda: 'Quando mulheres se encontram, tudo muda',
      },
    ],
  },
  {
    id: 'ed-mai26',
    title: 'Edição de Maio',
    date: '2026-05-12',
    status: 'realizado',
    location: 'Goiânia, GO',
    speaker: 'Idealizadoras da Tríade',
    theme: 'Conexões reais entre mulheres empreendedoras',
    recapText:
      'Mais uma tarde de conexões reais, com Lívia, Lia e Cris recebendo o grupo pessoalmente — prova de que o movimento que começou pequeno continua crescendo edição após edição.',
    recapMedia: [
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-2026-05/foto-1.jpg',
        legenda: 'Lívia, Lia, Cris e convidadas',
      },
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-2026-05/foto-2.jpg',
        legenda: 'No cantinho da marca',
      },
    ],
  },
  {
    id: 'ed11-ago26',
    title: '11ª Edição',
    date: '2026-08-11',
    status: 'realizado',
    location: 'Goiânia, GO',
    speaker: 'Idealizadoras da Tríade',
    theme: 'Conexões que geram oportunidades, crescimento e pertencimento',
    recapText:
      'A 11ª edição da Tríade Conecta reuniu quem já entendeu que crescer sozinha é mais lento — mais um encontro pra criar conexões reais e fortalecer negócios ao lado de quem compartilha do mesmo propósito.',
    recapMedia: [
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/11a-edicao-2026-08/foto-1.jpg',
        legenda: 'Roda de conversa',
      },
      {
        tipo: 'foto',
        url: 'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/11a-edicao-2026-08/foto-2.jpg',
        legenda: 'Lugar à mesa reservado',
      },
    ],
  },
  {
    id: 'jantar-casais-set26',
    title: 'Jantar da Tríade para Casais',
    date: '2026-09-30',
    status: 'em breve',
    location: 'Goiânia, GO',
    speaker: 'Idealizadoras da Tríade',
    theme: 'Uma noite para sair da rotina e se reconectar, às 19h',
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
    whatsapp: '+55 62 8287-0136',
  },
  {
    id: 'f2',
    initials: 'LC',
    name: 'Lia Chaves',
    role: 'Mentora',
    blurb: 'Advogada e consultora de imagem.',
    whatsapp: '+55 62 8131-7399',
  },
  {
    id: 'f3',
    initials: 'CM',
    name: 'Cris Miranda',
    role: 'Estilo',
    blurb: 'Contadora e consultora de estilo.',
    whatsapp: '+55 62 8165-1103',
  },
];

export const posts: Post[] = [
  {
    id: 'post-jantar-casais',
    author: 'Tríade Conecta',
    authorInitials: 'TC',
    subtitle: 'Jantar da Tríade para Casais · em breve',
    caption:
      'A pedidos das nossas queridas Tríades, uma noite para sair da rotina e se reconectar — 30 de setembro, às 19h. Garante sua vaga em Eventos ✨',
    baseLikes: 141,
    eventId: 'jantar-casais-set26',
    ctaLabel: 'Ver detalhes',
    showActions: true,
  },
  {
    id: 'post-recap',
    author: 'Lívia Duarte',
    authorInitials: 'LD',
    subtitle: 'idealizadora · edição com Carla Martins',
    caption:
      'Recordando a edição com Carla Martins, especialista em liderança feminina 🤍',
    baseLikes: 98,
    mediaGradient: 'linear-gradient(135deg, var(--ph-1), var(--ph-3))',
    showActions: true,
  },
];

export const timeline = [
  {
    id: 'tl1',
    label: '2025 · 6ª edição',
    text: 'Casa cheia pra fechar o ano com chave de ouro — o movimento criado por Lívia, Lia e Cris já reunia um grupo fiel de mulheres em Goiânia.',
  },
  {
    id: 'tl2',
    label: '2026 · 9ª edição',
    text: 'Conexão, aprendizado e fortalecimento de vínculos — o ritmo quase mensal segue firme.',
  },
  {
    id: 'tl3',
    label: '2026 · 11ª edição',
    text: 'Mais de uma dezena de encontros depois, a Tríade Conecta segue criando conexões reais e fortalecendo negócios em Goiânia.',
  },
];

export const seed = { events, speakers, plans };
