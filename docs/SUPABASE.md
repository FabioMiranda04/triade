# Supabase — banco de dados

O app funciona **sem** Supabase (cai em dados locais). Ligar o banco é
opcional até o Módulo 2 — mas é o que permite editar eventos, palestrantes e
planos sem publicar código novo.

## Como está montado hoje

| Dado | Onde vive | Por quê |
|---|---|---|
| Eventos, palestrantes, planos | **Supabase** | conteúdo público, editável sem deploy |
| Curtidas, salvos, RSVP, plano escolhido | **localStorage** | sem login não há usuária a quem atribuir |

As tabelas de engajamento por usuária (`profiles`, `rsvps`,
`post_engagements`, `plan_selections`) **já existem no projeto real**
(confirmado ao vivo em 23/08/2026, não é só o `schema.sql` do repositório),
com RLS restrita. A **autenticação por e-mail/senha também já está
habilitada** no projeto Supabase — confirmação de e-mail obrigatória
(`mailer_autoconfirm: false`), nenhum login social ligado.

**Módulo 2 concluído** (23/08/2026): `src/context/AuthContext.tsx` +
`src/components/AccountSheet.tsx` fazem entrar/cadastrar/sair, e
`supabaseProvider` grava curtida/salvo/RSVP/plano nas tabelas acima quando
há sessão ativa — sem sessão, cai no mesmo comportamento local de sempre.
Nenhuma configuração nova foi necessária no painel do Supabase, só código
do app.

## Pendente: rodar o `schema.sql`/`seed.sql` de novo (colunas de retrospectiva)

O Módulo 9 (23/08/2026) acrescentou `recap_text` e `recap_media` à tabela
`events` (retrospectiva em artigo das edições realizadas — texto + galeria).
As duas colunas **só existem no `schema.sql`/`seed.sql` do repositório até
agora** — o banco real do projeto ainda não tem essas colunas, porque essa é
uma ação em sistema externo que não roda sozinha (é o SQL Editor do
Supabase, não código do app). Até rodar, o app continua funcionando
normalmente: o pop-up de retrospectiva só mostra "Em breve, o registro
completo dessa edição" em vez do conteúdo (degradação graciosa, não é bug).
Para ativar: **SQL Editor → cole o `schema.sql` inteiro → Run** (é
idempotente, `alter table ... add column if not exists`, não afeta as
colunas existentes) e, se quiser o texto/galeria de exemplo das duas
primeiras edições, rode o `seed.sql` de novo também.

## Login com Google (OAuth) — ✅ configurado e funcionando

**Confirmado de ponta a ponta em produção em 23/08/2026**
(`triade-sand.vercel.app`). Uma confirmação anterior no mesmo dia tinha
verificado só até a tela de login do Google, sem completar o fluxo de
volta — o login na verdade **não funcionava**: faltava a URL do site em
**Authentication → URL Configuration → Redirect URLs** no painel do
Supabase. Sem essa entrada, o Supabase recebe a resposta do Google mas não
sabe pra onde te devolver, e falha essa última perna do fluxo em silêncio
(sintomas: não redireciona de volta, tab bar não troca o ícone pela foto).
Corrigido adicionando `https://triade-sand.vercel.app` (com e sem barra no
final, pra não depender de normalização) à lista — **essa lista precisa
ganhar uma entrada nova toda vez que um domínio novo apontar pro app**
(inclusive quando o domínio próprio do projeto existir, ver
`docs/DEPLOY.md`).

O restante da configuração abaixo (Google Cloud + painel do Supabase)
segue documentado como referência, caso precise recriar as credenciais ou
configurar um segundo ambiente:

1. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):
   - Crie um projeto (ou use um existente).
   - **APIs & Services → OAuth consent screen**: tipo **Externo**, nome do
     app ("Tríade Conecta"), e-mail de suporte. Quando o domínio próprio
     existir (ver seção de domínio no `ESTADO-DO-PROJETO.md`), adicione-o
     em "Authorized domains" aqui também.
   - **APIs & Services → Credentials → Create Credentials → OAuth client
     ID** → tipo **Web application**.
   - Em **Authorized redirect URIs**, adicione exatamente:
     ```
     https://zirrdajydxbydnyaebza.supabase.co/auth/v1/callback
     ```
     (esse é o callback do **seu** projeto Supabase — é fixo, não muda
     quando o domínio do app mudar, porque quem recebe o retorno do Google
     é o Supabase, não o Vercel).
   - Copie o **Client ID** e o **Client Secret** gerados.
2. **Painel do Supabase** → **Authentication → Providers → Google** →
   habilite → cole o Client ID e o Client Secret → **Save**.
3. Pronto — não precisa mexer em nenhuma variável de ambiente do app nem
   fazer deploy novo. Teste clicando em "Continuar com o Google" no app.

## Configurar (10 minutos)

1. Crie um projeto em [supabase.com](https://supabase.com) — região **South
   America (São Paulo)**, que é a mais próxima de Goiânia.
2. **SQL Editor → New query** → cole `supabase/schema.sql` → Run.
3. Nova query → cole `supabase/seed.sql` → Run.
4. **Project Settings → API** → copie `Project URL` e a chave `anon public`.
5. Na raiz do projeto, crie `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

6. `npm run dev`. No console do navegador não deve aparecer nenhum aviso
   `[supabase]` — se aparecer, o app está caindo no seed local (veja abaixo).

## Na Vercel

Project → **Settings → Environment Variables** → adicione as duas variáveis
em **Production**, **Preview** e **Development**. Depois **redeploy**:
variável de ambiente só entra no bundle em build novo.

## Chaves: o que é seguro

A chave **anon** vai para o navegador — isso é normal e por design. Quem
abrir o DevTools vai vê-la, e tudo bem: quem protege os dados é o **RLS**.

A chave **service_role** ignora o RLS por completo. Ela **nunca** entra em
código de front-end, nem em variável `VITE_*` (o prefixo `VITE_` significa
"publicar no bundle"). Ela só é usada em servidor — no Módulo 5, num
endpoint do painel admin.

## O RLS deste projeto

- `events`, `speakers`, `plans`: qualquer pessoa **lê** as linhas com
  `published = true`. Ninguém escreve pela chave anon — edição é pelo painel
  do Supabase (Table Editor).
- `profiles`: usuárias logadas veem todos os perfis (para o diretório do
  Módulo 3), mas cada uma só edita o próprio.
- `rsvps`, `post_engagements`, `plan_selections`: estritamente privados —
  `auth.uid() = user_id` para ler e escrever.

Se você criar uma tabela nova, **ligue o RLS**. Sem política, a tabela fica
invisível para o app; sem RLS, fica aberta para todo mundo.

## Editar conteúdo no dia a dia

**Table Editor** no painel do Supabase. Mudou um horário de evento? Edite a
linha, salve, recarregue o app — sem deploy. Para tirar algo do ar sem
apagar, desmarque `published`. A ordem na tela vem de `sort_order`.

## Quando algo falha

O provider do Supabase **não deixa a tela em branco**: se a consulta falhar
(sem rede, RLS bloqueando, tabela vazia), o app cai no conteúdo de
`src/data/seed.ts` e registra no console:

```
[supabase] falha ao buscar events — usando o seed local.
```

Se você vê o conteúdo antigo e não o do banco, é isso. Causas comuns:

| Sintoma | Causa provável |
|---|---|
| `nenhuma linha retornada` | o `seed.sql` não rodou, ou `published = false` |
| erro de permissão / `permission denied` | RLS ligado sem política de select |
| erro de URL ou chave inválida | `.env.local` errado, ou faltou reiniciar o `npm run dev` |
| funciona local, não na Vercel | variáveis não configuradas lá, ou faltou redeploy |

Variável de ambiente é lida na inicialização do Vite — depois de editar
`.env.local`, **reinicie o servidor**.

## Rodar SQL sem abrir o SQL Editor

O Claude **não consegue** conectar no Postgres a partir do contêiner de
trabalho: a política de rede de lá libera só HTTPS, e banco é TCP puro
(a senha do banco, portanto, não resolve nada ali — e não deve ser
colada em conversa: se for, troque em Settings → Database → Reset
database password).

O que funciona é a **Management API**, que aceita SQL por HTTPS:

```
POST https://api.supabase.com/v1/projects/zirrdajydxbydnyaebza/database/query
Authorization: Bearer sbp_...
{"query": "..."}
```

O `sbp_...` é um **Personal Access Token**, criado em
https://supabase.com/dashboard/account/tokens. Com ele numa sessão, o
Claude aplica migração sozinho e você não abre mais o SQL Editor.

Duas coisas antes de criar um: o token vale para a **conta inteira**, não
só este projeto, e ignora RLS (é dono). Trate como senha: passe em uma
sessão, revogue quando o trabalho terminar.

## Migrações

Por enquanto, dois arquivos SQL versionados (`schema.sql` + `seed.sql`), ambos
idempotentes. Quando o schema começar a mudar com frequência, vale adotar a
CLI oficial:

```bash
npx supabase link --project-ref <ID>
npx supabase db diff -f nome_da_mudanca
```

## Tipos TypeScript

`src/types/database.ts` espelha o schema à mão. Depois de mudar tabelas,
regenere:

```bash
npx supabase gen types typescript --project-id <ID> > src/types/database.ts
```

O banco usa `snake_case` e o app usa `camelCase` — a conversão fica isolada
nas funções `mapEvent` / `mapSpeaker` / `mapPlan` do
`src/lib/db/supabaseProvider.ts`.

---

## Dar permissão de edição a alguém (Módulo 5, 31/08/2026)

O app passou a poder **gravar conteúdo no banco** e **subir fotos para o
Storage** — mas só para quem estiver na tabela `admins`. Todo o resto do
mundo continua com a edição local de sempre, no próprio navegador.

Isso não é excesso de zelo: o front usa a chave `anon`, que é **pública** e
vai no bundle. Se a escrita fosse liberada para qualquer usuária logada,
bastaria criar uma conta para apagar as edições da comunidade ou encher o
Storage. Por isso a lista de admins **não tem tela** e não é editável pelo
app — ela só muda por aqui.

### 1. Rodar a migração

No painel do Supabase → **SQL Editor**, rode o `supabase/schema.sql`
inteiro de novo (ele é idempotente: rodar duas vezes não quebra nada). A
parte nova é a **seção 6**, que cria a tabela `admins`, a função
`e_admin()` e as políticas de escrita de `events`, `speakers`, `plans` e do
bucket `media`.

Se as políticas do Storage falharem com *"must be owner of table objects"*,
é porque foram rodadas fora do SQL Editor. Rode-as por lá.

### 2. Se marcar como admin

Com a conta já criada no app (entre uma vez pelo app antes), rode:

```sql
insert into public.admins (user_id, nota)
select id, 'sócia' from auth.users where email = 'seu-email@exemplo.com'
on conflict (user_id) do nothing;
```

Confira:

```sql
select u.email, a.nota, a.created_at
from public.admins a join auth.users u on u.id = a.user_id;
```

### 3. Testar

Abra o app **logada**, vá em Eventos → menu "..." → Editar. No topo do
formulário tem que aparecer *"Você tem permissão de edição: o que salvar
aqui vale para todo mundo."* Se aparecer a frase sobre "só neste aparelho",
a conta não está na lista — confira se o e-mail bate e se você entrou com
a mesma conta (login com Google e login com e-mail/senha criam usuárias
diferentes se os e-mails forem diferentes).

Marque o evento como **Realizado** para o bloco de fotos aparecer: a
galeria só existe para edição que já aconteceu.

### Para tirar a permissão

```sql
delete from public.admins where user_id = (
  select id from auth.users where email = 'seu-email@exemplo.com'
);
```
