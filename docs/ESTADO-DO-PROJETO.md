# ESTADO DO PROJETO — Tríade Conecta (App)

> Estado **atual** do projeto. O histórico fica no `CHANGELOG.md`.
> Para regras de trabalho e convenções, veja o `CLAUDE.md` na raiz.

**Versão atual:** `v1.2.0`
**Última atualização:** 23/08/2026
**Módulo em desenvolvimento:** **Módulo 2 (autenticação) concluído** —
entrar/cadastrar/sair com Supabase Auth, **login com Google já habilitado
e confirmado funcionando de ponta a ponta** (testado até a tela real do
Google), e uma **área de perfil** (nome, bio, Instagram, negócio; foto
preenchida automaticamente ao entrar com Google). Curtir/salvar/RSVP/plano
gravam nas tabelas reais quando há usuária logada; sem login, ou sem
Supabase configurado, continua exatamente local como sempre foi.
**Navegação reestruturada** (23/08/2026): "Planos" saiu da tab bar e virou
o CTA "Quero ser membro!" sempre visível no cabeçalho; "Perfil" (com foto
de quem estiver logada) entrou no lugar, como último item da tab bar —
estratégia pensada pra vendas, pesquisada e decidida junto com o usuário.
Próximo passo: **Módulo 3** (feed real, diretório de membras). **Domínio
próprio** também está no roadmap (seção 7) — depende só de ter/comprar um.

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
- [x] **Eventos** com filtro (Todos / Em breve / Realizados) e RSVP
      persistido — confirmar e **cancelar presença** (mesmo botão, alterna).
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
      ponta a ponta** em 23/08/2026 (Google Cloud + painel do Supabase
      configurados; redireciona até a tela real do Google). Foto de perfil
      do Google preenche `profiles.avatar_url` sozinha no primeiro login
      (nunca sobrescreve uma foto já definida). Nova tela **"Editar
      perfil"** (`ProfileEditSheet.tsx`) — nome, bio, Instagram, negócio,
      gravando em `profiles` via `useAuth().updateProfile()`.
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
| `.claude/commands/` | Comandos/skills prontos para o Claude Code (inclui `design-systems`) |
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
- Sem fotos reais — todos os "espaços de imagem" são gradientes da marca.
- Sem pagamento integrado — escolher plano só grava a escolha localmente.
- Sem painel administrativo (a edição inline atual não substitui isso —
  ver item acima).
- Sem testes automatizados.
- Sem service worker (o manifest existe, mas não há modo offline).

## 6. Roadmap — próximos módulos

0. **Bugs/pendências reportados:**
   - Criar **tema escuro** para o app (paleta "Liquid Glass" ainda só tem
     versão clara).
   - `AccountSheet` ainda não tem "esqueci minha senha" — falta uma tela de
     recuperação (`supabase.auth.resetPasswordForEmail`), deixado de fora
     do Módulo 2 de propósito para não inflar o escopo.
   - ~~Bolha de notificação (badge do sino) presa no final da tela~~ —
     deixou de existir: o sino saiu do cabeçalho em 23/08/2026 (ver seção 2,
     navegação reestruturada).
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

## 7. Prioridades para uma versão apresentável a clientes

1. **Fotos reais no lugar dos gradientes** — maior salto de "protótipo" para
   "produto"; depende só do material. Onde trocar está no `DESIGN-SYSTEM.md`.
2. **Validar os 3 planos** (Convidada / Membra / Fundadora) — nomes e preços
   ainda são rascunho, marcados como "sugeridos" na própria tela.
3. **Mais 2–3 posts reais no feed** — bastidores, depoimento de participante.
4. **Tela de boas-vindas/splash** antes do feed, para a demo não abrir direto
   na Home.
5. **Publicar na Vercel e mandar o link** — hoje isso substitui com vantagem
   a antiga prévia em PDF.
6. **Rodar o `schema.sql` + `seed.sql` no Supabase** e configurar as variáveis
   na Vercel — a partir daí, ajustar datas e textos de evento vira edição de
   linha no painel, sem depender de deploy.
7. **Domínio próprio** (pedido em 23/08/2026, depende de você ter/comprar
   um): a Vercel já resolve isso em **Settings → Domains** — adiciona o
   domínio, aponta o DNS que ela indicar, e o HTTPS sai automático (detalhes
   em `docs/DEPLOY.md`, seção "Domínio próprio"). Duas coisas para lembrar
   quando isso acontecer: (1) trocar `VITE_SUPABASE_URL`/`ANON_KEY` não muda
   — o domínio novo não afeta a configuração do Supabase; (2) se o login com
   Google já estiver ativo, adicionar o domínio novo em "Authorized domains"
   na tela de consentimento OAuth do Google Cloud (o callback do Supabase
   continua sendo `https://zirrdajydxbydnyaebza.supabase.co/auth/v1/callback`,
   esse não muda nunca).

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
