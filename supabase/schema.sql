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
  spots       integer     not null default 0,
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

-- perfis: qualquer pessoa logada vê (diretório de membras do Módulo 3),
-- mas só a dona edita o próprio.
drop policy if exists "perfis visiveis para logadas" on public.profiles;
create policy "perfis visiveis para logadas"
  on public.profiles for select to authenticated using (true);

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
