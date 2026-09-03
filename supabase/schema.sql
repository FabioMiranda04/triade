-- =============================================================
--  Tríade Conecta — schema do Supabase
--  Rode este arquivo inteiro no SQL Editor do Supabase.
--  É idempotente: pode rodar de novo sem quebrar nada.
-- =============================================================

-- -------------------------------------------------------------
-- 1. CONTEÚDO PÚBLICO
--    Lido pelo app com a chave anon. Escrita só pelo painel do
--    Supabase (ou pelo painel admin do Módulo 5, com service_role).
-- -------------------------------------------------------------

create table if not exists public.events (
  id          text primary key,
  title       text        not null,
  date        date        not null,
  status      text        not null check (status in ('realizado', 'em breve')),
  location    text        not null default '',
  speaker     text        not null default '',
  theme       text        not null default '',
  spots       integer,
  sort_order  integer     not null default 0,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.speakers (
  id          text primary key,
  name        text        not null,
  topic       text        not null default '',
  bio         text        not null default '',
  sort_order  integer     not null default 0,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.plans (
  id          text primary key,
  name        text        not null,
  price       numeric     not null default 0,
  period      text        not null default '',
  featured    boolean     not null default false,
  perks       text[]      not null default '{}',
  sort_order  integer     not null default 0,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2. RLS — Row Level Security
--    Sem isto, ou o app não lê nada, ou qualquer pessoa escreve.
--    Política: leitura pública apenas de linhas publicadas;
--    nenhuma escrita pela chave anon.
-- -------------------------------------------------------------

alter table public.events   enable row level security;
alter table public.speakers enable row level security;
alter table public.plans    enable row level security;

drop policy if exists "leitura publica de eventos" on public.events;
create policy "leitura publica de eventos"
  on public.events for select
  to anon, authenticated
  using (published = true);

drop policy if exists "leitura publica de palestrantes" on public.speakers;
create policy "leitura publica de palestrantes"
  on public.speakers for select
  to anon, authenticated
  using (published = true);

drop policy if exists "leitura publica de planos" on public.plans;
create policy "leitura publica de planos"
  on public.plans for select
  to anon, authenticated
  using (published = true);

-- -------------------------------------------------------------
-- 3. updated_at automático
-- -------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists speakers_updated_at on public.speakers;
create trigger speakers_updated_at
  before update on public.speakers
  for each row execute function public.set_updated_at();

drop trigger if exists plans_updated_at on public.plans;
create trigger plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();


-- =============================================================
--  4. MÓDULO 2 — perfil e engajamento por usuária
--
--  Ainda NÃO usado pelo app: sem autenticação não existe usuária
--  a quem atribuir curtida, presença ou plano. Curtidas, salvos,
--  RSVP e plano escolhido continuam no localStorage por enquanto.
--
--  Deixado pronto aqui para o Módulo 2. As tabelas são criadas
--  (não custam nada vazias) e já nascem com RLS restrita: cada
--  usuária só enxerga e altera as próprias linhas.
-- =============================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  bio         text,
  instagram   text,
  business    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.rsvps (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  event_id    text        not null references public.events(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table if not exists public.post_engagements (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  post_id     text        not null,
  kind        text        not null check (kind in ('like', 'save')),
  created_at  timestamptz not null default now(),
  primary key (user_id, post_id, kind)
);

create table if not exists public.plan_selections (
  user_id     uuid        primary key references auth.users(id) on delete cascade,
  plan_id     text        not null references public.plans(id),
  status      text        not null default 'selecionado'
                          check (status in ('selecionado', 'ativo', 'cancelado')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles         enable row level security;
alter table public.rsvps            enable row level security;
alter table public.post_engagements enable row level security;
alter table public.plan_selections  enable row level security;

-- perfis: PRIVADOS. Cada uma lê e edita só o próprio.
--
-- Até 03/09/2026 a política de leitura era `using (true)` para
-- `authenticated`, pensada num diretório de membras. O diretório foi
-- removido a pedido do dono da comunidade: nome, negócio, bio e Instagram
-- são dado pessoal, e o front usa a chave `anon`, que é pública — bastava
-- criar uma conta para ler a tabela inteira. A política larga não era
-- "quase" um problema: era o problema.
--
-- Se um dia existir diretório, ele não volta assim. As opções certas são
-- uma coluna de consentimento (`perfil_publico boolean default false`) com
-- a política restrita a ela, ou uma view/função `security definer`
-- expondo só os campos escolhidos.
drop policy if exists "perfis visiveis para logadas" on public.profiles;

drop policy if exists "cada uma edita seu perfil" on public.profiles;
create policy "cada uma edita seu perfil"
  on public.profiles for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- engajamento: estritamente privado por usuária.
drop policy if exists "cada uma gerencia seus rsvps" on public.rsvps;
create policy "cada uma gerencia seus rsvps"
  on public.rsvps for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cada uma gerencia seu engajamento" on public.post_engagements;
create policy "cada uma gerencia seu engajamento"
  on public.post_engagements for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cada uma gerencia seu plano" on public.plan_selections;
create policy "cada uma gerencia seu plano"
  on public.plan_selections for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cria o perfil automaticamente quando alguém se cadastra
-- (full_name/avatar_url vêm do cadastro por e-mail ou, no login com Google,
-- do próprio Google via raw_user_meta_data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================
--  5. MÓDULO 9 — retrospectiva das edições (calendário + histórico)
--
--  Cada evento "realizado" pode ganhar um texto de retrospectiva e uma
--  galeria de fotos/vídeos, mostrados no pop-up de histórico em artigo.
--  `recap_media` é um array de { tipo: 'foto' | 'vídeo', url, legenda? } —
--  `url` de foto ainda é um gradiente CSS (placeholder, sem fotos reais,
--  ver seção 7 do CLAUDE.md) até entrar material de verdade.
-- =============================================================

alter table public.events add column if not exists recap_text text;
alter table public.events add column if not exists recap_media jsonb not null default '[]'::jsonb;

-- =============================================================
--  Migração (Módulo 11, 26/08/2026): `spots` vira opcional — nem toda
--  edição real reconstruída do Instagram tem número de vagas conhecido.
-- =============================================================

alter table public.events alter column spots drop not null;
alter table public.events alter column spots drop default;

-- =============================================================
--  6. MÓDULO 5 (início, 31/08/2026) — quem pode ESCREVER conteúdo
--
--  Até aqui o app lia do banco e nunca escrevia: a edição pelo menu "..."
--  gravava só no navegador (`localContent.ts`), de propósito. O motivo é
--  que o front usa a chave `anon`, que é pública — abrir escrita com ela
--  deixaria qualquer visitante alterar o conteúdo da comunidade e subir
--  arquivo no Storage.
--
--  A permissão nasce aqui, e nasce fora do alcance da usuária.
-- =============================================================

-- Tabela separada, e não uma coluna `is_admin` em `profiles`, por um
-- motivo concreto: a política de `profiles` é `for all` sobre a própria
-- linha, então uma coluna ali seria gravável pela própria dona — qualquer
-- pessoa se promoveria a admin com uma chamada de update. Aqui não existe
-- política de escrita nenhuma: entra na lista quem for inserido pelo SQL
-- Editor do painel (que roda como dono, acima da RLS).
create table if not exists public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  nota        text,
  created_at  timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Leitura só da própria linha: o app precisa saber se mostra a UI de
-- edição, mas ninguém precisa da lista de quem mais é admin.
drop policy if exists "cada uma ve se e admin" on public.admins;
create policy "cada uma ve se e admin"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

-- `security definer` porque as políticas abaixo consultam esta tabela: sem
-- isso a consulta rodaria sob a RLS de quem chamou, que só enxerga a
-- própria linha — o que por acaso funciona, mas depende de um detalhe
-- frágil. `stable` deixa o Postgres avaliar uma vez por consulta em vez de
-- uma vez por linha. `search_path` fixo é obrigatório em `security
-- definer`: sem ele, um schema malicioso no path poderia sequestrar a
-- resolução dos nomes.
create or replace function public.e_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

revoke all on function public.e_admin() from public;
grant execute on function public.e_admin() to authenticated;

-- Escrita de conteúdo: só admin. A leitura pública continua como estava —
-- as políticas de select da seção 2 não são tocadas.
drop policy if exists "admin escreve eventos" on public.events;
create policy "admin escreve eventos"
  on public.events for all to authenticated
  using (public.e_admin()) with check (public.e_admin());

drop policy if exists "admin escreve palestrantes" on public.speakers;
create policy "admin escreve palestrantes"
  on public.speakers for all to authenticated
  using (public.e_admin()) with check (public.e_admin());

drop policy if exists "admin escreve planos" on public.plans;
create policy "admin escreve planos"
  on public.plans for all to authenticated
  using (public.e_admin()) with check (public.e_admin());

-- Storage: o bucket `media` é público para leitura (foi assim que as fotos
-- do Módulo 11 entraram no app). A escrita passa a existir, e só para
-- admin. Se estas linhas falharem com "must be owner of table objects",
-- rode-as pelo SQL Editor do painel, que tem o dono certo.
drop policy if exists "admin sobe midia" on storage.objects;
create policy "admin sobe midia"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.e_admin());

drop policy if exists "admin troca midia" on storage.objects;
create policy "admin troca midia"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.e_admin())
  with check (bucket_id = 'media' and public.e_admin());

drop policy if exists "admin apaga midia" on storage.objects;
create policy "admin apaga midia"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.e_admin());

-- Para virar admin (rode UMA vez, trocando o e-mail):
--   insert into public.admins (user_id, nota)
--   select id, 'sócia' from auth.users where email = 'voce@exemplo.com'
--   on conflict (user_id) do nothing;

-- =============================================================
--  Migração (01/09/2026): evento pode durar mais de um dia.
--  A Feira de Negócios acontece em 11 E 12 de setembro; com um
--  único `date` a segunda data simplesmente não existia no app.
--  Nulo = evento de um dia só, que é o caso de todos os outros.
-- =============================================================

alter table public.events add column if not exists end_date date;

-- =============================================================
--  Migração (01/09/2026): curtidas de verdade e o admin da casa.
-- =============================================================

-- `post_engagements` é estritamente privada por usuária: cada uma só lê a
-- própria linha. Isso é o certo — ninguém precisa saber quem curtiu o quê —
-- mas torna impossível contar do cliente. Uma função `security definer`
-- devolve só o total, que é a única parte pública do dado.
create or replace function public.curtidas_do_post(p_post_id text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.post_engagements
  where post_id = p_post_id and kind = 'like'
$$;

revoke all on function public.curtidas_do_post(text) from public;
grant execute on function public.curtidas_do_post(text) to anon, authenticated;

-- O admin da casa. Idempotente: rodar de novo não duplica.
insert into public.admins (user_id, nota)
select id, 'idealizador do app'
from auth.users
where email = 'fabiomirandago@gmail.com'
on conflict (user_id) do nothing;

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
