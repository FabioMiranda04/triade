# Última sessão interrompida

> Este arquivo cobre um cenário: a conversa acabar **no meio** de uma
> tarefa, antes de um ponto de parada natural (regra 15 do `CLAUDE.md`).
> Diferente do `CHANGELOG.md`/`ESTADO-DO-PROJETO.md`, que registram
> trabalho **concluído** — este registra trabalho **em andamento**, e volta
> para "nada pendente" assim que for retomado e terminado.

**Status: nada pendente de código.** Tudo o que a sessão 22
(02–03/09/2026) produziu está em `main` — commit `99fd7c1`. Branch e
`main` sincronizadas, nada sem commit.

## Trocando de máquina (web ↔ PC)

O estado do projeto vive no git e nestes docs, não na conversa. Para
retomar em outro lugar:

```bash
git clone https://github.com/FabioMiranda04/triade.git
cd triade && npm install && npm run dev
```

Depois, no Claude Code: leia `CLAUDE.md` (contrato do projeto, 2.3k tokens)
e este arquivo. `docs/ESTADO-DO-PROJETO.md` tem o estado detalhado.

**O que NÃO vem no git** (está no `.gitignore`, e é de propósito):

- `node_modules/` e `dist/` — `npm install` resolve;
- **`.env`** — copie de `.env.example` e preencha `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_ANON_KEY` (painel do Supabase → Settings → API). Sem ele o
  app roda com dado local, o que é cenário suportado (regra 10), mas você
  não vê o conteúdo real nem consegue editar como admin.

**O que VEM no git e vale saber:** as skills (`.claude/skills/`, incluindo
`caveman` e `ponytail`) e o `.claude/settings.json` com as permissões já
liberadas. Não precisa reinstalar nada.

## Cinco coisas que só você pode fazer

### 1. Rodar `supabase/migracao-perfis-privados.sql` — PRIORIDADE

Enquanto não rodar, **qualquer conta logada no app consegue ler a tabela
`profiles` inteira** pela API do Supabase: nome, `@` do Instagram e negócio
de todas as membras. O app não mostra mais isso (o diretório foi removido),
mas o banco continua entregando para quem pedir direto. Esta migração
derruba a política `perfis visiveis para logadas`. Um arquivo, uma
colagem, um Run.

### 2. Rodar `supabase/migracao-posts.sql` no SQL Editor

Um arquivo, uma colagem, um Run. Ele cria a tabela `public.posts` e insere
os três posts do Início. Idempotente — rodar de novo não duplica.

Enquanto não rodar: editar um post continua salvando só no navegador de
quem editou, mesmo sendo admin. Não é bug, é não ter onde gravar.

### 3. Trocar a senha do banco

A senha do Postgres foi colada no chat numa sessão anterior. Ela não foi
gravada em arquivo nenhum e não chegou a ser usada (TCP puro é bloqueado no
contêiner remoto), mas ficou no histórico da conversa. Supabase → Settings
→ Database → Reset database password.

O `schema.sql` e o `seed.sql` **já foram rodados** (01/09/2026): a tabela
`admins`, a função `curtidas_do_post()`, a Feira de Negócios e as seis
palestrantes estão no banco, confirmados por consulta.

**Para não precisar mais disso:** um Personal Access Token do Supabase
(`sbp_...`, criado em https://supabase.com/dashboard/account/tokens) deixa
o Claude aplicar migração sozinho pela Management API. Ver
`docs/SUPABASE.md`, seção "Rodar SQL sem abrir o SQL Editor" — inclusive o
que o token custa em risco.

### 4. Testar o anel azul numa janela anônima

No PC aparece um anel azul em volta do botão depois de clicar. **Não é do
app**: o CSS publicado tem `:focus{outline:none}`, uma varredura no CSS do
build não achou **nenhum** valor azulado, e em Chromium com clique de mouse
não aparece contorno nenhum.

Sobram duas hipóteses, e a janela anônima separa as duas: se o azul sumir,
é **extensão do navegador** (gerenciador de senha, corretor gramatical,
extensão de acessibilidade — todas desenham anel assim). Se continuar, é
caso novo: anote **qual navegador e versão** e o Claude ataca por outro
lado.

### 5. Corrigir o manual com quem o produziu

Página 03 do Manual de Marca, item "1. LOGOMARCA PRINCIPAL": a palavra está
escrita **"coneecta"**, com dois "e". As versões da página 06 estão certas,
e foi de lá que saiu a máscara do app — o código está correto. Mas aquela é
a página que um designer copiaria.

## Opcional, quando quiser

- **Cartaz da Feira/Jantar no post.** Hoje os posts usam fotos do acervo. O
  `.html` do Instagram não trouxe as imagens (só o HTML, sem a pasta
  `Instagram_files/`). Para trocar: mande o JPG, ou faça pelo app — Início
  → "..." → Editar → Foto do post, que já recorta em 4:5.
- **Notificação de evento** — última peça do Módulo 7 (a instalação já
  funciona). Precisa de push com VAPID e tabela de inscrições.

## Armadilhas de método (economizam horas)

Estas valem **para o ambiente remoto (web)**. No PC, as três primeiras
simplesmente não existem — é a principal razão para migrar.

1. **Google Fonts e Supabase não são alcançáveis do contêiner remoto**
   (ERR_CONNECTION_RESET). Toda captura sai em fonte de fallback e sem
   foto. Saída: baixar `.woff2` e as fotos com `curl` (que passa pelo
   proxy) e servir do disco via `ctx.route` no Playwright.
2. **Postgres (TCP puro) é bloqueado no remoto.** A senha do banco não
   ajuda ali; só HTTPS passa. No PC, `psql` conecta normalmente.
3. **O contêiner remoto é efêmero** — o que não está no git não sobrevive.
4. **`document.fonts.check()` mente** — devolve `true` mesmo com fallback.
   O que vale é a lista de faces com `status === 'loaded'`.
5. **Contraste só vale medido no pixel renderizado.** Calcular sobre os
   tokens ignora gradiente, `backdrop-filter` e a barra flutuante por cima.
   O jeito que funciona: apagar o texto (`color: transparent`), fotografar,
   ler o pixel do fundo, e pular elemento coberto pela tab bar.
6. **Ao ler pixel de captura, multiplique pelo `deviceScaleFactor`.**
   `getBoundingClientRect` devolve px CSS e a captura sai em px de
   dispositivo — sem a escala a leitura cai no quadrante superior esquerdo.
7. **Especificidade CSS morde.** `button.cal-cell.has-event` ganha de
   `.cal-cell.junta-dir`; a regra mais específica precisa do `button` na
   frente. Custou uma rodada no calendário.
8. **`Relationships: []` em toda entrada de `Tables`** no
   `src/types/database.ts`. Esquecer derruba o schema INTEIRO para `never`,
   e o erro aparece em tabelas que você nem tocou.
