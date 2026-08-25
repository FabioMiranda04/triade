-- =============================================================
--  Tríade Conecta — conteúdo inicial
--  Rode DEPOIS do schema.sql, no SQL Editor do Supabase.
--
--  Espelha `src/data/seed.ts`. Pode rodar de novo: usa upsert,
--  então atualiza o que já existe em vez de duplicar.
--
--  ATENÇÃO: os planos abaixo (nomes e preços) ainda são um
--  RASCUNHO a validar com as idealizadoras.
-- =============================================================

insert into public.events (id, title, date, status, location, speaker, theme, spots, sort_order, recap_text, recap_media)
values
  ('ed1', '1ª Edição — O início do movimento', '2025-04-12', 'realizado', 'Goiânia, GO',
   'Idealizadoras da Tríade', 'Conexões reais entre mulheres empreendedoras', 65, 1,
   'A primeira edição marcou o início do movimento: mulheres de trajetórias diferentes, reunidas por uma tarde inteira, trocando experiência em vez de cartão de visita. Lívia, Lia e Cris abriram o encontro contando por que a Tríade nasceu — e a resposta do público confirmou que fazia falta um espaço assim em Goiânia.',
   '[{"tipo":"foto","url":"linear-gradient(150deg, var(--ph-1), var(--ph-2))","legenda":"Abertura do encontro"},{"tipo":"foto","url":"linear-gradient(150deg, var(--ph-2), var(--ph-3))","legenda":"Roda de conversa"}]'::jsonb),
  ('ed2', '2ª Edição — Cultura e Gestão de Pessoas', '2025-08-23', 'realizado', 'Goiânia, GO',
   'Marcela Zaidem', 'Cultura, gestão e o olhar profundo sobre o feminino nos negócios', 65, 2,
   'Marcela Zaidem trouxe um olhar prático sobre cultura organizacional para quem lidera pequenos times — e sobre como o jeito feminino de gerir pessoas é, na maioria das vezes, o maior ativo escondido de um negócio. A conversa continuou muito depois do horário previsto de encerramento.',
   '[{"tipo":"foto","url":"linear-gradient(150deg, var(--ph-3), var(--ph-4))","legenda":"Marcela Zaidem no palco"},{"tipo":"foto","url":"linear-gradient(150deg, var(--ph-1), var(--ph-5))","legenda":"Networking depois da palestra"}]'::jsonb),
  ('ed3', '3ª Edição — Gestão Financeira na prática', '2026-09-19', 'em breve', 'Goiânia, GO',
   'Danielle Gouveia', 'Finanças com clareza para quem empreende', 85, 3, null, '[]'::jsonb)
on conflict (id) do update set
  title = excluded.title,
  date = excluded.date,
  status = excluded.status,
  location = excluded.location,
  speaker = excluded.speaker,
  theme = excluded.theme,
  spots = excluded.spots,
  sort_order = excluded.sort_order,
  recap_text = excluded.recap_text,
  recap_media = excluded.recap_media;

insert into public.speakers (id, name, topic, bio, sort_order)
values
  ('sp1', 'Marcela Zaidem', 'Cultura e Gestão',
   'Especialista de renome nacional em cultura e gestão de pessoas.', 1),
  ('sp2', 'Danielle Gouveia', 'Gestão Financeira',
   'Referência em finanças aplicadas ao dia a dia de quem empreende.', 2),
  ('sp3', 'Dani Morais Flor', 'Relações Interpessoais',
   'Trabalha a escuta, a conexão genuína e o fortalecimento mútuo entre mulheres.', 3)
on conflict (id) do update set
  name = excluded.name,
  topic = excluded.topic,
  bio = excluded.bio,
  sort_order = excluded.sort_order;

insert into public.plans (id, name, price, period, featured, perks, sort_order)
values
  ('pl1', 'Convidada', 0, 'grátis', false, array[
    'Acesso à comunidade digital',
    'Conteúdo semanal sobre negócios e conexão',
    'Desconto no 1º encontro presencial'
  ], 1),
  ('pl2', 'Membra Tríade', 97, '/mês', true, array[
    'Tudo do plano Convidada',
    'Vaga garantida no encontro mensal',
    'Grupo exclusivo de trocas e indicações',
    'Descontos com marcas parceiras'
  ], 2),
  ('pl3', 'Fundadora', 970, '/ano', false, array[
    'Tudo do plano Membra Tríade',
    '2 meses grátis no plano anual',
    'Mentoria trimestral em grupo',
    'Prioridade em vagas VIP e brindes'
  ], 3)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  period = excluded.period,
  featured = excluded.featured,
  perks = excluded.perks,
  sort_order = excluded.sort_order;
