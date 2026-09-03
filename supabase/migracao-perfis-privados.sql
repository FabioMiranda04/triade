-- =============================================================
--  URGENTE — 03/09/2026: perfil de membra vira privado
--
--  Cole no SQL Editor do Supabase e rode. É uma linha de efeito.
--
--  O QUE ESTÁ ACONTECENDO AGORA, sem isto: a política
--  "perfis visiveis para logadas" permite que QUALQUER conta autenticada
--  leia a tabela `profiles` inteira — nome, bio, negócio e Instagram de
--  todas as membras. O front usa a chave `anon`, que é pública e está no
--  bundle do site: basta alguém criar uma conta para consultar tudo.
--
--  Tirar a tela do app (feito em d3bedf0) esconde do app, NÃO do banco.
--  Quem fecha é isto.
--
--  Depois de rodar, cada pessoa passa a ler e editar apenas a própria
--  linha — que é o que a política "cada uma edita seu perfil", já
--  existente, garante.
-- =============================================================

drop policy if exists "perfis visiveis para logadas" on public.profiles;

-- Conferência: deve sobrar só a política "cada uma edita seu perfil".
select policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'profiles';
