# ESTADO DO PROJETO — Tríade Conecta (App)

> Estado **atual** do projeto. O histórico fica no `CHANGELOG.md`.
> Para regras de trabalho e convenções, veja o `CLAUDE.md` na raiz.

**Versão atual:** `v0.7.0`
**Última atualização:** 23/08/2026
**Módulo em desenvolvimento:** Módulo 1 concluído; banco (Supabase) ligado; pop-up de evento com compra via WhatsApp e edição inline de conteúdo (só no aparelho) prontos, com todos os pop-ups unificados num único padrão visual (centralizado, fundo escuro) e otimizados; próximo é o Módulo 2 (autenticação) — Módulo 7 (instalar como app + notificações) planejado para depois dele

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
      persistido.
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
- [x] **Edição de conteúdo estilo Instagram** (menu "..." com "Editar",
      `Kebab.tsx`/`EditSheet.tsx`) para eventos, palestrantes e o post em
      destaque, incluindo criar novo evento/palestrante — tudo salvo só no
      navegador via `src/lib/db/localContent.ts` (nunca grava no Supabase,
      não há autenticação ainda).
- [x] **Infra de repositório**: `CLAUDE.md`, docs, `.gitignore`,
      `vercel.json` (com rewrite de SPA), CI do GitHub Actions rodando
      typecheck + build, comandos do Claude Code em `.claude/commands/`.
- [x] **Build validado** (`tsc` strict + `vite build`) sem erros nem avisos.

## 3. Arquitetura atual (resumo)

- **Stack:** Vite + React 18 + TypeScript + react-router-dom + CSS puro.
- **Dados:** o objeto `db` (`src/lib/db/`) é a única fronteira de
  persistência. Conteúdo (eventos, palestrantes, planos) vem do **Supabase**;
  engajamento (curtir, salvar, RSVP, plano) fica no **localStorage** até
  existir login.
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
| `.env.example` | Modelo das variáveis; copiar para `.env.local` |
| `legacy/` | HTML original do Bubble, só referência — **não editar** |
| `vercel.json` | Configuração de deploy (inclui rewrite de SPA) |
| `.claude/commands/` | Comandos prontos para o Claude Code |
| `.github/workflows/ci.yml` | Typecheck + build em cada push/PR |

## 5. O que NÃO foi feito ainda (importante não presumir)

- Sem autenticação/login real — não existe conta de usuária.
- **Engajamento não vai para o banco**: curtidas, salvos, RSVP e plano
  escolhido ficam no localStorage, por navegador. Sem login não há a quem
  atribuir. As tabelas existem no schema, esperando o Módulo 2.
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

0. **Bugs/pendências reportados (antes ou junto do Módulo 2):**
   - Bolha de notificação (badge do sino) não some e fica presa no final da
     tela — bug de interface a corrigir.
   - Criar **tema escuro** para o app (paleta "Liquid Glass" ainda só tem
     versão clara).
1. **Módulo 2 — Autenticação e perfil**: cadastro/login com **Supabase Auth**,
   foto e dados da usuária, onboarding curto. Criar
   `src/context/AuthContext.tsx` ligado a `onAuthStateChange`. Neste módulo,
   mover o engajamento do localStorage para as tabelas já criadas — o que
   exige tornar assíncronas as funções de engajamento do `DataProvider`.
2. **Módulo 3 — Área de membras**: feed real, diretório de membras, "minhas
   inscrições".
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
   - Faz mais sentido vir **depois do Módulo 2** (autenticação): sem login
     não há onde guardar "essa usuária quer ser avisada desse evento", e
     notificação para todo mundo indiscriminadamente tende a ser ignorada/
     desinstalada.

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
