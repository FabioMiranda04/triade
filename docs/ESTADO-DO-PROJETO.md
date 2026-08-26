# ESTADO DO PROJETO — Tríade Conecta (App)

> Estado **atual** do projeto. O histórico fica no `CHANGELOG.md`.
> Para regras de trabalho e convenções, veja o `CLAUDE.md` na raiz.

**Versão atual:** `v2.5.0`
**Última atualização:** 26/08/2026
**Última sessão (16, 25/08/2026):** entrou o **tema "Ônix"** (preto,
branco e detalhes dourados), selecionável em **Configurações → Aparência**
— pedido a partir de um questionamento de uma das sócias sobre a paleta.
O tema **Pérola** continua sendo o padrão e ficou pixel a pixel idêntico
(verificado por comparação de capturas antes/depois em 21 de 22 telas; a
22ª é o próprio pop-up de Configurações, que ganhou a seção nova). Por
baixo, o que entrou não foi um "modo escuro" e sim um **sistema de temas**:
`tokens.css` em três camadas (marca → papéis semânticos → temas), com
`layout.css`/`components.css` consumindo só a camada semântica. Adicionar
um terceiro tema agora é um bloco de variáveis + uma entrada em `THEMES`,
sem tocar em componente — receita na seção 1.3 do `docs/DESIGN-SYSTEM.md`.
Detalhes no `CHANGELOG.md`, entrada `v2.3.0`. Numa segunda rodada
(`v2.4.0`), com o tema já no ar, passou a revisão de UI/UX: o tema claro
virou **Pérola** (par com Ônix), o cabeçalho ficou borda a borda, a
amostra do tema virou uma mini-tela do app, os alvos de toque do feed
subiram para 38px sem mexer no desenho, e a tab bar "Padrão 2" virou um
grupo **de fato flutuante** — o conteúdo passa por baixo dela, o que
trocou de propósito uma invariante do manual (§6.2).

**Público-alvo (redefinido em 26/08/2026):** empreendedoras de **~35 anos
ou mais**, acostumadas ao Instagram. Isso é régua de design, não perfil de
marketing: a calibragem é ficar **um degrau acima** da densidade do
Instagram (cuja legenda tem ~14px), não replicá-la nem exagerar para o
outro lado.

**Última sessão (17, 26/08/2026):** auditoria de UI/UX com medição
automatizada e as correções que saíram dela. O app passou a ter escala
tipográfica em `rem` — ou seja, **respeita o tamanho de fonte que a
usuária escolheu no celular**, o que antes era ignorado por completo. O
**Ônix virou o tema padrão** e a **barra flutuante virou a navegação
padrão, agora com rótulo de texto** em cada item. A fileira de "stories"
saiu do Início (era navegação duplicada disfarçada de story). Contraste do
tema Pérola corrigido: de 3 reprovações no critério AA para zero.
Detalhes e números no `CHANGELOG.md`, entrada `v2.5.0`.

**Próximo passo combinado:** **Módulo 11** — trazer o material real do
Instagram (ver seção 6, item 10, e seção 7, item 1). É o único item da
lista que depende de uma ação sua antes de qualquer código.

**Módulo em desenvolvimento:** **Módulo 9 (Eventos: calendário +
retrospectiva) concluído no código** — controle Lista/Calendário, card
grande do próximo evento, grade 3 colunas das edições anteriores com
scroll infinito e busca, `EventCalendar.tsx` novo, `EventRecapModal.tsx`
novo (retrospectiva em artigo). **Pendente**: rodar o `schema.sql`/
`seed.sql` atualizados contra o Supabase real (colunas `recap_text`/
`recap_media`) — ver `docs/SUPABASE.md`. **Módulo 11 (mídia real)
planejado** — estratégia definida (export oficial do Instagram, não
scraping), `content-raw/instagram-export/` pronta pra receber o material,
código do `EventRecapModal.tsx` já pronto pra fotos reais; falta o usuário
criar o bucket `media` no Storage do Supabase (não é algo que dá pra fazer
por código) e trazer o export. Módulos 8 e 10 (Sobre e Palestrantes)
continuam só planejados, ver seção 6.
Módulo 2 (autenticação) segue concluído — entrar/cadastrar/sair com
Supabase Auth (e-mail/senha) **e login com Google, os dois confirmados
funcionando de ponta a ponta em produção** (`triade-sand.vercel.app`,
23/08/2026). O Google especificamente só passou a funcionar depois de um
bug real corrigido nesta data — ver "Login com Google" logo abaixo. Área
de perfil editável (foto do Google entra automática, agora um pouco maior
na tab bar pra se destacar). Curtir/salvar/RSVP/plano gravam nas tabelas
reais quando há usuária logada; sem login, ou sem Supabase configurado,
continua local. Navegação reestruturada em 23/08/2026: CTA "Quero ser
membro!" no cabeçalho + "Perfil" na tab bar. Próximo passo: **Módulo 3**
(feed real, diretório de membras) ou completar os Módulos 8/10 já
detalhados. **Domínio próprio**: passo a passo completo já documentado
(`docs/DEPLOY.md`), só falta comprar.

**Login com Google — bug real corrigido em 23/08/2026**: apesar de
documentado como "confirmado" numa sessão anterior, o login parava sem
completar (não redirecionava de volta pro app, tab bar não trocava o
ícone pela foto). Causa raiz: a URL do site publicado
(`https://triade-sand.vercel.app`) **não estava na lista "Redirect URLs"**
de Authentication → URL Configuration do painel do Supabase — sem isso, o
Supabase recebe a resposta do Google mas não sabe pra onde te devolver, e
falha essa última perna do fluxo em silêncio. Corrigido pelo usuário no
painel do Supabase, com o app já testado em produção depois disso. Um
segundo problema secundário também corrigido nesta sessão: instâncias do
`npm run dev` esquecidas rodando (portas 5173–5180) faziam o servidor
local cair sempre numa porta diferente, o que quebraria esse mesmo tipo de
lista de URLs permitidas em ambiente local — encerradas.

---

## 1. Resumo em uma frase

App de comunidade para mulheres empreendedoras (encontros presenciais mensais
em Goiânia), com visual "Liquid Glass" e navegação estilo Instagram — agora
um **projeto de código real** (Vite + React + TypeScript), com banco no
**Supabase**, versionado no GitHub e hospedado na Vercel.

Contexto de marca completo está no `CHANGELOG.md`, entrada `v0.1.0`.

## 2. Status atual — o que já está pronto ✅

- [x] **Migração do protótipo Bubble para código.** O HTML único virou um
      projeto Vite + React 18 + TypeScript strict, com as **mesmas 5 telas e
      as mesmas funcionalidades**, pronto para rodar no VS Code e evoluir com
      o Claude Code.
- [x] **Sistema de design "Liquid Glass"** migrado com valores idênticos,
      agora organizado em `src/styles/` (tokens · base · layout · componentes).
- [x] **App shell nativo**: header fixo de vidro, área de conteúdo com scroll
      próprio, tab bar inferior fixa borda a borda com `safe-area-inset`.
- [x] **Rotas reais** (`/`, `/sobre`, `/eventos`, `/palestrantes`, `/planos`)
      — deep link, botão voltar do Android e URLs compartilháveis funcionam.
- [x] **Feed** com posts, curtir (inclusive por **duplo toque**), salvar,
      compartilhar e comentar (os dois últimos ainda como toast "em breve").
- [x] **Sobre** com perfil da comunidade, estatísticas, as 3 idealizadoras e
      a trajetória das edições.
- [x] **Eventos redesenhado (Módulo 9, 23/08/2026)**: controle Lista/
      Calendário (no lugar do antigo filtro Todos/Em breve/Realizados);
      modo Lista com o próximo evento em card grande
      (`EventCard variant="featured"`) + grade 3 colunas das edições
      anteriores com scroll infinito e busca; modo Calendário
      (`EventCalendar.tsx`, mês corrente, marcador nos dias com evento);
      retrospectiva em artigo (`EventRecapModal.tsx`, texto + galeria de
      fotos/vídeos) ao tocar numa edição já realizada. RSVP continua
      persistido — confirmar e **cancelar presença** (mesmo botão,
      alterna). Colunas `recap_text`/`recap_media` pendentes de rodar no
      Supabase real (ver seção 0 abaixo e `docs/SUPABASE.md`).
- [x] **Palestrantes** em grade, com bio ao tocar.
- [x] **Planos** com seleção persistida e bloco de patrocínio.
- [x] **Camada de dados com dois providers** (`src/lib/db/`), tipada e
      assíncrona: **Supabase** quando há credenciais, **local** quando não há.
      A escolha é automática — o app roda sem configurar nada.
- [x] **Schema do Supabase pronto** (`supabase/schema.sql`): tabelas de
      conteúdo com RLS de leitura pública, triggers de `updated_at`, e as
      tabelas do Módulo 2 (`profiles`, `rsvps`, `post_engagements`,
      `plan_selections`) já criadas com RLS restrita por usuária.
- [x] **Seed SQL idempotente** (`supabase/seed.sql`) espelhando
      `src/data/seed.ts`.
- [x] **Degradação graciosa**: se o Supabase falhar, o app cai no conteúdo
      local e avisa no console em vez de mostrar tela branca.
- [x] **Estados de carregamento** (`<Skeleton>`) nas telas que buscam dados.
- [x] **Pop-up "Detalhes do evento"** a partir do post em destaque da
      Início, com botão "Quero participar" → 3 sócias no WhatsApp
      (`EventModal.tsx`, `src/lib/whatsapp.ts`, números em
      `founders[].whatsapp`).
- [x] **Configurações do app** (ícone de engrenagem no cabeçalho,
      `SettingsSheet.tsx`, lista estilo iOS) — hoje só a opção de estilo da
      tab bar (Padrão / Padrão 2 flutuante estilo Uber), persistida via
      `TabBarStyleContext`. Todo pop-up do app passa por
      `ModalOverlay.tsx` (portal para `document.body` — evita o bug de
      `backdrop-filter` quebrando `position: fixed` de pop-ups nascidos
      dentro de componentes com vidro, como o cabeçalho).
- [x] **Edição de conteúdo estilo Instagram** (menu "..." com "Editar",
      `Kebab.tsx`/`EditSheet.tsx`) para eventos, palestrantes e o post em
      destaque, incluindo criar novo evento/palestrante — tudo salvo só no
      navegador via `src/lib/db/localContent.ts` (nunca grava no Supabase,
      não há autenticação ainda).
- [x] **Tipografia que respeita a usuária** (26/08/2026): escala em `rem`
      (`--fs-*`), piso de 12px, texto corrido em 16px. O conteúdo escala
      junto com o ajuste de fonte do celular; o "cromo" (rótulo da tab bar,
      botões do cabeçalho) usa `clamp` e para de crescer antes de quebrar o
      layout. Nenhum `font-size` em px sobrou no projeto.
- [x] **Navegação com rótulo** (26/08/2026): a barra flutuante virou o
      padrão e cada item tem o nome escrito embaixo do ícone. Antes eram
      cinco ícones mudos.
- [x] **Dois temas visuais** (25/08/2026, padrão trocado para o Ônix em 26/08): **Pérola** (padrão, o visual
      original) e **Ônix** (preto, branco e detalhes dourados), trocáveis
      em Configurações → Aparência e salvos no aparelho
      (`ThemeContext`). O tema é um `data-theme` no `<html>` + um bloco de
      variáveis em `tokens.css`; nenhum componente conhece o tema ativo.
      Inclui `theme-color` da barra de status, `color-scheme` dos
      controles nativos e aplicação antes do primeiro quadro (sem
      piscada).
- [x] **Manual de UI/UX vivo** (`docs/DESIGN-SYSTEM.md`, reescrito por
      completo em 23/08/2026) + skill `design-systems`
      (`.claude/commands/design-systems.md`) que aplica o checklist do
      manual — invocar antes de qualquer tela, componente, pop-up, ícone,
      animação ou navegação nova.
- [x] **Autenticação (Módulo 2)**: entrar/cadastrar/sair com Supabase Auth
      (e-mail/senha, confirmação de e-mail respeitada), pop-up
      `AccountSheet.tsx`, ícone de conta no cabeçalho. `useAuth().requireAuth()`
      é o gate — curtir, confirmar presença e escolher plano pedem login
      **só** se o Supabase estiver configurado; sem ele, segue livre como
      sempre. Engajamento (`isLiked`/`toggleLike`/`isSaved`/`toggleSave`/
      `hasRsvp`/`rsvpEvent`/`cancelRsvp`/`getChosenPlan`/`choosePlan`) agora
      assíncrono de propósito, gravando no Supabase quando há sessão.
- [x] **Login com Google + área de perfil**: botão "Continuar com o Google"
      no `AccountSheet` (`signInWithGoogle`) — **confirmado funcionando de
      ponta a ponta em produção** (`triade-sand.vercel.app`), testado de
      verdade em 23/08/2026 depois de corrigir a URL de retorno ausente em
      "Redirect URLs" no painel do Supabase (ver nota no topo deste
      arquivo). Foto de perfil do Google preenche `profiles.avatar_url`
      sozinha no primeiro login (nunca sobrescreve uma foto já definida) e
      aparece na tab bar (`.tab-avatar`, um pouco maior que os outros
      ícones desde 23/08/2026). Nova tela **"Editar perfil"**
      (`ProfileEditSheet.tsx`) — nome, bio, Instagram, negócio, gravando em
      `profiles` via `useAuth().updateProfile()`.
- [x] **Navegação reestruturada para vender melhor** (23/08/2026, pesquisado
      e decidido junto com o usuário): "Planos" saiu da tab bar e virou o
      CTA **"Quero ser membro!"** (`.btn-cta-member`), sempre visível no
      cabeçalho de toda tela — não só numa aba que a pessoa precisa lembrar
      de visitar. "Perfil" entrou na tab bar como último item (padrão
      Instagram/TikTok: foto de quem estiver logada, ou ícone genérico),
      no lugar de Planos — a tab bar continua com 5 itens. Busca e
      notificações saíram do cabeçalho (eram só placeholders "em breve").
- [x] **Infra de repositório**: `CLAUDE.md`, docs, `.gitignore`,
      `vercel.json` (com rewrite de SPA), CI do GitHub Actions rodando
      typecheck + build, comandos do Claude Code em `.claude/commands/`.
- [x] **Build validado** (`tsc` strict + `vite build`) sem erros nem avisos.

## 3. Arquitetura atual (resumo)

- **Stack:** Vite + React 18 + TypeScript + react-router-dom + CSS puro.
- **Dados:** o objeto `db` (`src/lib/db/`) é a única fronteira de
  persistência. Conteúdo (eventos, palestrantes, planos) vem do **Supabase**;
  engajamento (curtir, salvar, RSVP, plano) vai para o **Supabase quando há
  login**, senão fica no **localStorage** (mesmo comportamento de sempre).
- **Conteúdo de fallback:** `src/data/seed.ts`, espelhado em
  `supabase/seed.sql`.
- **Ícones:** SVG inline em `src/components/Icon.tsx`, sem biblioteca.
- **Dependências de runtime:** React, ReactDOM, Router e `@supabase/supabase-js`.

Detalhes em `ARQUITETURA.md`, `SUPABASE.md` e `DESIGN-SYSTEM.md`.

## 4. Arquivos e pastas

| Caminho | O que é |
|---|---|
| `CLAUDE.md` | Regras e contexto para o Claude Code — ler primeiro |
| `src/` | O app (telas, componentes, hooks, dados, estilos) |
| `supabase/` | `schema.sql` (tabelas + RLS) e `seed.sql` (conteúdo inicial) |
| `docs/` | Esta documentação |
| `docs/DESIGN-SYSTEM.md` | **Manual de UI/UX** — tokens, pop-ups, ícones, animação, navegação. Ler antes de mexer em interface. |
| `.env.example` | Modelo das variáveis; copiar para `.env.local` |
| `legacy/` | HTML original do Bubble, só referência — **não editar** |
| `vercel.json` | Configuração de deploy (inclui rewrite de SPA) |
| `.claude/commands/` | Comandos/skills prontos para o Claude Code (inclui `design-systems` e `revisar-mobile`) |
| `src/styles/tokens.css` | **Onde toda cor vive.** Três camadas: paleta de marca → papéis semânticos → blocos de tema. Nenhum outro arquivo sabe qual tema está ativo. |
| `src/context/ThemeContext.tsx` | Tema visual (Pérola / Ônix): grava `data-theme` no `<html>`, persiste no aparelho e sincroniza a `<meta name="theme-color">` |
| `content-raw/` | Pasta de trabalho local para o export do Instagram — **ignorada pelo Git**, nunca commitar o conteúdo |
| `.github/workflows/ci.yml` | Typecheck + build em cada push/PR |

## 5. O que NÃO foi feito ainda (importante não presumir)

- **Login com Google já funciona de ponta a ponta** (confirmado em
  23/08/2026 — Google Cloud + painel do Supabase configurados). Nenhum
  outro login social (Apple, Facebook...) foi implementado.
- **Perfil editável existe, mas é o básico**: nome, bio, Instagram, negócio.
  Sem upload de foto própria (só a do Google, automática), sem onboarding,
  sem "esqueci minha senha".
- **Edição de conteúdo dentro do app é só local** (menu "..." → Editar, ver
  seção 2) — não existe gravação real no Supabase por trás dela, de
  propósito: sem autenticação, qualquer chave que grave no banco no
  front-end seria pública. Para editar de verdade hoje ainda é o Table
  Editor do Supabase. O Módulo 5 troca esse overlay local pela gravação
  real, já com login exigindo uma conta de administradora.
- Sem fotos reais — todos os "espaços de imagem" são gradientes, agora pela
  escala `--ph-1..5`, que responde ao tema. É exatamente o que o Módulo 11
  resolve, e é o próximo passo.
- **Os temas são escolha manual.** Não existe seguir o tema do sistema
  (`prefers-color-scheme`) nem trocar por horário; quem não abrir
  Configurações continua no Pérola para sempre. Se um dia isso for
  desejado, o gancho é o `ThemeProvider` — nada mais precisa mudar.
- Sem pagamento integrado — escolher plano só grava a escolha localmente.
- Sem painel administrativo (a edição inline atual não substitui isso —
  ver item acima).
- Sem testes automatizados.
- Sem service worker (o manifest existe, mas não há modo offline).

## 6. Roadmap — próximos módulos

0. **Bugs/pendências reportados:**
   - ~~Onda 2 da auditoria~~ — **concluída em 26/08/2026**: alvos de toque
     a 44px, CTA e engrenagem separados, abas Lista/Calendário a 44px,
     botão de comentar (que só dizia "em breve") removido, e os estilos da
     barra renomeados para "Barra flutuante" / "Barra fixa" com miniatura.
   - Da auditoria, segue em aberto só o que é **decisão de produto**: tela
     de boas-vindas na primeira abertura (hoje a usuária cai direto no
     feed, sem nada explicando o que é a Tríade) e fotos reais no lugar dos
     gradientes — este último é o próprio Módulo 11.
   - ~~Criar **tema escuro** para o app~~ — **resolvido em 25/08/2026**,
     e melhor que o pedido original: em vez de um modo escuro solto,
     entrou um sistema de temas com o **Ônix** (preto/branco/dourado)
     escolhido em Configurações → Aparência. Ver `CHANGELOG.md` `v2.3.0` e
     `DESIGN-SYSTEM.md` seção 1.
   - `AccountSheet` ainda não tem "esqueci minha senha" — falta uma tela de
     recuperação (`supabase.auth.resetPasswordForEmail`), deixado de fora
     do Módulo 2 de propósito para não inflar o escopo.
   - ~~Bolha de notificação (badge do sino) presa no final da tela~~ —
     deixou de existir: o sino saiu do cabeçalho em 23/08/2026 (ver seção 2,
     navegação reestruturada).
   - ~~Calendário na tela Eventos~~ — **resolvido em 23/08/2026**:
     `EventCalendar.tsx` novo, desenhado do zero (não foi encontrada
     nenhuma versão anterior no código, no `git log` nem no `legacy/` — o
     usuário lembrava de algo que não existia neste repositório). Ver
     Módulo 9 na seção 6.
1. ~~Módulo 2 — Autenticação~~ **✅ concluído em 23/08/2026.** Entrar/
   cadastrar/sair com Supabase Auth; curtir/RSVP/plano gravam nas tabelas
   reais quando logada. Ver seção 2.
2. **Módulo 3 — Área de membras**: feed real e diretório de membras
   (`profiles` já tem RLS pública para leitura entre logadas, pensada pra
   isso), "minhas inscrições". O perfil editável em si já saiu do Módulo 2.
3. **Módulo 4 — Assinaturas e pagamento**: cobrança recorrente
   (Stripe/Pagar.me), provavelmente via Edge Function do Supabase para o
   webhook. A tabela `plan_selections` já prevê o campo `status`.
4. **Módulo 5 — Painel administrativo**: trocar o overlay local de
   `src/lib/db/localContent.ts` (edição "..." → Editar, ver seção 2) por
   gravação real no Supabase, com RLS restrita a uma conta de
   administradora — a UI de edição já existe, falta o backend com
   permissão.
5. **Módulo 6 — Migração de dados**: localStorage → banco, conforme entrarem
   usuárias reais.
6. **Módulo 7 — Instalar como app + notificações de evento** (pedido em
   23/08/2026): atalho na tela de início do celular (Android e iOS) e avisos
   de quando é o próximo evento / quando abrem os ingressos.
   - **Atalho na tela de início** é a parte simples: o projeto já tem um
     `manifest.json` (falta confirmar se `display: standalone`, ícones
     192/512px e `apple-touch-icon` estão corretos); com isso o Android
     mostra o prompt de instalar sozinho, e no iOS a usuária instala via
     Safari → Compartilhar → "Adicionar à Tela de Início". Não depende de
     nenhum outro módulo.
   - **Notificações depende de decisão de arquitetura, não é só front-end**:
     push de verdade (o app avisa mesmo fechado) exige Service Worker +
     Web Push (chave VAPID) + um backend que dispare o envio na hora certa
     (Supabase Edge Function agendada, provavelmente), e no iOS só funciona
     se o app já estiver instalado como atalho (regra do próprio iOS/Safari,
     não do projeto). Alternativa mais simples, sem backend novo: lembrete
     só enquanto o app está aberto (Notification API local), que cobre menos
     casos mas não exige infraestrutura de envio.
   - O pré-requisito que faltava (login, pra saber "essa usuária quer ser
     avisada desse evento") **já está pronto** desde o Módulo 2 — este
     módulo pode começar quando fizer sentido de prioridade.
7. **Módulo 8 — Sobre: mídias e relatos** (pedido em 23/08/2026): a tela
   `Sobre` (`src/screens/Sobre.tsx`) hoje só tem o card de perfil, as 3
   idealizadoras e a timeline em texto (`founders`/`timeline` de
   `data/seed.ts`) — sem fotos, sem vídeo, sem depoimento de participante.
   Escopo:
   - **Galeria de mídia** (fotos/vídeos de edições passadas): grade de
     miniaturas (gradiente da marca por padrão — ver prioridade 1 da seção
     7, ainda sem fotos reais) que abre em pop-up **via `ModalOverlay`**
     (lightbox) ao tocar; vídeo entra como link do YouTube/Instagram, iframe
     simples, sem dependência nova.
   - **Relatos** (depoimentos de participantes): novo tipo de conteúdo — card
     com citação + nome + negócio da depoente, alimentado do mesmo jeito que
     o resto (`data/seed.ts` no modo local, tabela própria no Supabase).
   - Dados novos, seguindo a receita de 5 passos da seção 6 do `CLAUDE.md`
     (schema → `database.ts` → `types/index.ts` → `supabaseProvider.ts` →
     `data/seed.ts`):
     - Tabela `about_media`: id, tipo (`foto`/`vídeo`), url/gradiente,
       legenda, evento relacionado (opcional).
     - Tabela `testimonials`: id, nome, negócio/cargo, citação, evento
       relacionado (opcional).
   - Edição pelo app: mesmo padrão do menu "..." → Editar (overlay local em
     `localContent.ts`) até existir o Módulo 5 (painel administrativo).
   - Em aberto para a próxima sessão: perguntar se já existe material real
     (fotos/vídeos/depoimentos) para entrar agora, ou se a tela nasce com
     placeholders esperando o material depois.
8. ~~Módulo 9 — Eventos: calendário + nova visualização + histórico em
   artigo~~ **✅ concluído no código em 23/08/2026** (planejado e
   implementado na mesma sessão — decisões de layout tomadas com o usuário
   antes de codar). Redesenho completo de `src/screens/Eventos.tsx`:
   controle **Lista/Calendário** no topo (no lugar do antigo filtro Todos/
   Em breve/Realizados); modo Lista com o **próximo evento em card grande**
   (`EventCard variant="featured"`) + `SectionHead` "Edições anteriores" +
   **grade 3 colunas** (`.event-grid`/`.event-cell`, mesmo padrão da grade
   de Palestrantes) com **scroll infinito** (`useInfiniteReveal`,
   `IntersectionObserver`, +9 por vez, sem paginação real — dataset ainda
   pequeno) + **busca** (`.ev-search`, abaixo da grade, filtra por texto
   client-side); modo Calendário com `EventCalendar.tsx` novo (mês
   corrente, marcador nos dias com evento, tocar num dia volta pro modo
   Lista e abre o card certo). Retrospectiva em artigo
   (`EventRecapModal.tsx`, via `ModalOverlay`, texto + galeria de fotos/
   vídeos) ao tocar numa edição já realizada — `TriadeEvent` ganhou
   `recapText?`/`recapMedia?`. Múltiplos eventos futuros ao mesmo tempo:
   decisão do usuário foi não tratar por ora (ritmo é mensal). O calendário
   que o usuário lembrava de uma versão anterior **não foi encontrado**
   nem no código, nem no `git log`, nem no `legacy/` — este é desenhado do
   zero. Validado com `tsc -b` + `vite build` + Playwright em 375px.
   **Pendente**: `recap_text`/`recap_media` só existem em
   `supabase/schema.sql`/`seed.sql` — rodar contra o projeto Supabase real
   (ver `docs/SUPABASE.md`). Detalhes completos no `docs/CHANGELOG.md`,
   entrada `v2.0.0`.
9. **Módulo 10 — Palestrantes: pop-up completo por palestrante** (pedido
   em 23/08/2026): hoje tocar num quadro da grade
   (`src/screens/Palestrantes.tsx`) abre um card **inline**
   (`.pal-detail`) só com tópico + bio — não é um pop-up de verdade, o que
   já é uma violação da regra 14 do `CLAUDE.md` (todo pop-up passa por
   `ModalOverlay`). Plano: virar `SpeakerModal.tsx` de verdade, via
   `ModalOverlay`, com:
   - Redes sociais (Instagram, LinkedIn, site) — precisa de ícones novos em
     `Icon.tsx` (hoje só existe `whatsapp` entre ícones de rede/contato).
   - Presenças na Tríade: lista das edições em que a palestrante já
     participou. Hoje `TriadeEvent.speaker` é texto livre — avaliar nessa
     sessão se vale trocar por um `speakerId` (mais confiável pra cruzar os
     dados) ou cruzar por nome mesmo.
   - Informações de contato (e-mail e/ou WhatsApp) e cursos oferecidos
     (lista de nome + link + descrição curta).
   - `Speaker` (`types/index.ts`) ganha campos novos: `instagram?`,
     `linkedin?`, `website?`, `email?`, `whatsapp?`, `courses?: { name,
     url?, description }[]` — mesma receita de 5 passos da seção 6 do
     `CLAUDE.md` (schema → `database.ts` → `types/index.ts` →
     `supabaseProvider.ts` → `data/seed.ts`).
   - O menu "..." → Editar (`Kebab`/`SpeakerEditSheet`) continua dentro do
     modal, só que o formulário precisa ganhar os campos novos também.
10. **Módulo 11 — Infraestrutura de mídia real (Supabase Storage)**
    — **⏭️ PRÓXIMO PASSO, combinado em 25/08/2026.**

    **Atenção ao vocabulário — "API do Instagram" e "export do Instagram"
    são duas coisas diferentes, e a decisão do projeto é a segunda:**

    | | Export oficial (**o plano**) | Graph API do Instagram |
    |---|---|---|
    | O que é | Você pede seus dados em Configurações → Central de Privacidade → Baixar suas informações, e o Instagram manda um `.zip` | Interface de programação da Meta, consultada por código |
    | Preparo | Nenhum — dois cliques no app | App na Meta for Developers, conta Business/Creator ligada a uma Página do Facebook, token de acesso, revisão de permissões |
    | O que devolve | Fotos/vídeos **originais**, em boa qualidade, com legenda e data | Mídia via URLs **temporárias** (expiram em horas), qualidade já processada |
    | Custo de manutenção | Zero — é uma vez só | Token expira e precisa ser renovado |
    | Serve para | Trazer o acervo das edições passadas de uma vez | Manter um feed sincronizado ao vivo |

    Para o que a Tríade precisa agora — pegar o acervo de 7+ edições e
    subir para o Storage **uma vez** — o export ganha em tudo: não exige
    app na Meta, não expira e entrega arquivo original. A Graph API só
    valeria a pena se o objetivo virasse "o app espelha o Instagram
    sozinho, para sempre", que não é o caso (as fotos entram por curadoria,
    escolhidas por edição). Se um dia esse objetivo mudar, o item vira um
    módulo próprio — não é uma troca de ferramenta, é outro escopo.

    Escopo original (mantido): hoje o app só tem gradientes CSS como
    "imagem" — este módulo é o que permite entrar fotos/vídeos de verdade
    pras galerias dos Módulos 8 (Sobre) e 9 (retrospectiva de Eventos), com
    volume grande esperado (mais de 7 edições + outros eventos, conforme o
    usuário). Origem do material: export oficial do Instagram (seção 7,
    item 1) — **não** scraping, decisão já tomada e justificada lá.
    - **Passo 0 (usuário)**: pedir o export (seção 7, item 1), extrair o(s)
      `.zip` e colocar o conteúdo em
      `content-raw/instagram-export/` na raiz do projeto — pasta já criada
      (`content-raw/README.md` explica a estrutura esperada), **ignorada
      pelo Git de propósito** (`.gitignore`): é material de trabalho local,
      nunca deve ser commitado (pode ter volume grande e não é conteúdo do
      app, é matéria-prima). Pode jogar a estrutura exata que o Instagram
      gera, sem reorganizar nada.
    - **Passo 1 — curadoria** (Claude Code, quando o usuário avisar que o
      material chegou): localizar os JSON relevantes dentro do export
      (`posts_1.json`, `stories.json` — nome varia por versão do
      exportador), cruzar as datas das publicações com `TriadeEvent.date`
      em `data/seed.ts` pra saber de qual edição é cada foto, e propor ao
      usuário quais fotos usar por edição (curadoria assistida — confirma/
      exclui, não é automático demais pra não escolher mal).
    - **Passo 2 — bucket no Supabase Storage**: criar um bucket público
      (ex: `media`) pelo painel do Supabase (Storage → New bucket →
      público). RLS de Storage: leitura pública (`select` liberado pra
      `anon`), escrita restrita — mesma lógica das tabelas de conteúdo hoje
      (sem escrita pública pela chave `anon`, regra 11 do `CLAUDE.md`).
      Upload em lote: pelo painel manualmente no início (mais simples,
      controlado) ou um script local rodado pelo usuário na própria
      máquina com a chave `service_role` (**nunca** num script que vai pro
      front-end/repositório — só uso local, pontual, pra popular o bucket).
    - ~~**Passo 3 — plugar no app**~~ **✅ código já pronto** (23/08/2026):
      `EventRecapModal.tsx` agora detecta sozinho se `media.url` é o
      gradiente placeholder (`começa com "linear-gradient"`) ou uma URL
      real — no segundo caso já renderiza `<img src={media.url}>` mantendo
      o `aspect-ratio` quadrado (`.recap-photo img`, regra 5 do
      `docs/DESIGN-SYSTEM.md`). Ou seja: assim que `TriadeEvent.recapMedia[].url`
      passar a ser uma URL real do Storage
      (`https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/...`)
      em vez do gradiente, a foto real já aparece sem precisar tocar em
      código de novo. Mesma lógica de detecção **ainda falta portar** pra
      galeria do Módulo 8 (Sobre) quando ele for implementado.
    - Imagens de câmera/celular costumam vir pesadas (vários MB) —
      redimensionar/otimizar antes do upload pra não pesar o carregamento
      no app (mobile-first, regra 1 do `CLAUDE.md`).

## 7. Prioridades para uma versão apresentável a clientes

1. **Fotos reais no lugar dos gradientes** — maior salto de "protótipo" para
   "produto"; **depende só do material, e é o próximo passo combinado**
   (Módulo 11, seção 6, item 10). Onde trocar está no `DESIGN-SYSTEM.md`.
   O código já está pronto dos dois lados: `EventRecapModal` detecta
   sozinho se a URL é gradiente ou foto real, e a escala `--ph-1..5` faz o
   placeholder acompanhar o tema enquanto a foto não chega.
   **Estratégia de origem do material** (definida em 23/08/2026): em vez de
   scraping do Instagram (violaria os Termos de Uso da Meta e arrisca a
   conta ser bloqueada por atividade automatizada — descartado), usar a
   ferramenta **oficial** do próprio Instagram de exportar dados:
   1. Quem administra @triade.conecta acessa **Configurações → Central de
      Privacidade → Baixar suas informações**
      (ou direto em [accountscenter.instagram.com](https://accountscenter.instagram.com)
      → Suas informações e permissões → Exportar suas informações).
   2. Seleciona as categorias — dá pra escolher **Publicações, Stories e
      Reels** separadamente; **Destaques** não é uma categoria própria no
      export porque tecnicamente são só uma seleção de Stories arquivados
      fixada no perfil — vêm inclusos dentro de "Stories" (o Instagram
      arquiva toda story automaticamente por padrão). Formato **JSON**
      (mais fácil de processar) e o período (recomendado: desde o início da
      Tríade, pra pegar as 3 edições).
   3. O Instagram gera um arquivo pra baixar (pode levar minutos a horas,
      eles avisam por notificação/e-mail) — vem com as legendas, datas e as
      fotos/vídeos originais em boa qualidade.
   4. O usuário manda o arquivo (ou só a pasta relevante) nesta conversa —
      a partir daí, virar conteúdo real é: **Sobre** (Módulo 8 — galeria de
      mídia e relatos) e **Eventos** (Módulo 9 — `recapMedia` das edições
      já realizadas) puxam desse material; feed (`data/seed.ts` → `posts`)
      também pode ganhar 2–3 posts reais dali (ver item 3 abaixo).
2. **Validar os 3 planos** (Convidada / Membra / Fundadora) — nomes e preços
   ainda são rascunho, marcados como "sugeridos" na própria tela.
3. **Mais 2–3 posts reais no feed** — bastidores, depoimento de participante.
4. **Tela de boas-vindas/splash** antes do feed, para a demo não abrir direto
   na Home.
5. ~~**Publicar na Vercel e mandar o link**~~ — **feito e no ar**
   (`triade-sand.vercel.app`); publicar virou rotina: todo push na `main`
   vai para produção sozinho.
6. **Rodar o `schema.sql` + `seed.sql` no Supabase** e configurar as variáveis
   na Vercel — a partir daí, ajustar datas e textos de evento vira edição de
   linha no painel, sem depender de deploy.
7. **Domínio próprio** (pedido em 23/08/2026, ainda não comprado): guia
   completo — onde registrar (`.com.br` no Registro.br é o recomendado,
   ~R$40/ano; alternativa `.com` via Cloudflare Registrar/Namecheap,
   ~US$9–15/ano), passo a passo (Vercel → Supabase → Google Cloud) e por
   que isso sozinho **não** troca o texto "zirrdajydxbydnyaebza.supabase.co"
   pela marca na tela do Google (precisaria do Custom Domain do Supabase
   Auth, recurso pago à parte) — tudo em `docs/DEPLOY.md`, seção "Domínio
   próprio".

## 8. Protocolo de atualização (toda sessão futura)

1. Nova entrada no topo do `CHANGELOG.md` (versão, data, o que mudou,
   arquivos afetados).
2. Atualizar as seções **2**, **4**, **5** e **6/7** deste arquivo — ele deve
   sempre poder ser lido sozinho e dar o quadro completo.
3. Atualizar o cabeçalho (versão, data, módulo) no topo desta página.
4. Se alguma regra do projeto mudou, refletir no `CLAUDE.md`.
5. Se o schema do banco mudou, manter coerentes: `supabase/schema.sql`,
   `supabase/seed.sql`, `src/types/database.ts`, os mapeadores do
   `supabaseProvider.ts`, `src/data/seed.ts` e `docs/SUPABASE.md`.
