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
com RLS restrita, esperando o lado do app do Módulo 2. A **autenticação por
e-mail/senha também já está habilitada** no projeto Supabase — confirmação
de e-mail obrigatória (`mailer_autoconfirm: false`), nenhum login social
ligado. Ou seja: o Módulo 2 não precisa de nenhuma configuração nova no
painel do Supabase, só o código do app (`AuthContext`, telas de entrar/
cadastrar, e as funções de engajamento do `DataProvider` virando
assíncronas).

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
