-- =============================================================
--  MIGRAÇÃO ÚNICA — 01/09/2026
--
--  Cole ESTE arquivo inteiro no SQL Editor do Supabase e rode.
--  É só isto: cria a tabela `posts` e põe os três posts do Início
--  dentro dela. Idempotente — rodar de novo não duplica nada.
--
--  Já está tudo também no `schema.sql` e no `seed.sql`; este
--  arquivo existe só para você não precisar rodar os dois inteiros.
-- =============================================================

-- =============================================================
--  Migração (01/09/2026): post vira conteúdo de verdade.
--
--  Até aqui o post do Início era o único conteúdo que não tinha
--  tabela: vivia no `seed.ts` e só podia ser editado no overlay
--  local. Ou seja, a admin trocava a foto e ninguém mais via.
--  Mesmo desenho das outras tabelas de conteúdo: leitura pública
--  do que está publicado, escrita só para quem está em `admins`.
-- =============================================================

create table if not exists public.posts (
  id               text    primary key,
  author           text    not null,
  author_initials  text    not null,
  subtitle         text    not null default '',
  caption          text    not null,
  media_url        text,
  media_gradient   text,
  -- `set null` e não `cascade`: apagar um evento não deve apagar o post
  -- que falava dele; ele vira um post comum.
  event_id         text    references public.events(id) on delete set null,
  cta_tab          text,
  cta_label        text,
  show_actions     boolean not null default true,
  sort_order       integer not null default 0,
  published        boolean not null default true,
  updated_at       timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "leitura publica de posts" on public.posts;
create policy "leitura publica de posts"
  on public.posts for select
  to anon, authenticated
  using (published = true);

drop policy if exists "admin escreve posts" on public.posts;
create policy "admin escreve posts"
  on public.posts for all to authenticated
  using (public.e_admin()) with check (public.e_admin());

-- =============================================================
--  Posts do Início. Mesmo desenho das outras tabelas: idempotente,
--  o `on conflict` atualiza o que mudou. A ordem (`sort_order`) só
--  vale como desempate — quem manda no destaque é a data do evento
--  vinculado, decidida na tela (`Home.tsx`).
-- =============================================================

insert into public.posts
  (id, author, author_initials, subtitle, caption, media_url, event_id, cta_label, sort_order)
values
  ('post-feira-negocios', 'Tríade Conecta', 'TC', 'Feira de Negócios · 11 e 12 de setembro',
   'Seu negócio merece ser visto ✨ Seja um expositor da Feira de Negócios Tríade — dois dias de conexões que geram oportunidades e negócios que transformam.

11 e 12 de setembro, no Decorado Bambuí. Moda, beleza, casa e talks reunidos num só lugar, com o público que já é da Tríade.

Como expositora você: conecta-se com novos clientes e parceiros · dá visibilidade à sua marca · fortalece seu network e gera novas parcerias · impulsiona suas vendas e leva sua marca mais longe.

Vagas limitadas. Fale com a gente e garanta a sua.',
   'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/6a-edicao-2025-11/foto-2.jpg', 'feira-negocios-set26', 'Ver detalhes', 1),
  ('post-jantar-casais', 'Tríade Conecta', 'TC', 'Jantar da Tríade para Casais · 30 de setembro',
   'A pedidos das nossas queridas Tríades, uma noite para sair da rotina e se reconectar — 30 de setembro, às 19h, na Villa América, com talk da terapeuta Valéria Ruiz ✨',
   'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-2026-05/foto-1.jpg', 'jantar-casais-set26', 'Ver detalhes', 2),
  ('post-recap', 'Lívia Duarte', 'LD', 'idealizadora · edição com Carla Martins',
   'Recordando a edição com Carla Martins, especialista em liderança feminina 🤍',
   'https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-carla-martins-2025-10/foto-1.jpg', null, null, 3)
on conflict (id) do update set
  author = excluded.author,
  author_initials = excluded.author_initials,
  subtitle = excluded.subtitle,
  caption = excluded.caption,
  media_url = excluded.media_url,
  event_id = excluded.event_id,
  cta_label = excluded.cta_label,
  sort_order = excluded.sort_order;
