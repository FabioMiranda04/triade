# CHANGELOG — Tríade Conecta (App)

> Histórico versionado do projeto. Entradas mais recentes primeiro.
> Para o estado atual (o que importa para continuar o trabalho), veja
> `ESTADO-DO-PROJETO.md` — este arquivo é o "como chegamos aqui", não
> precisa ser lido por completo a cada sessão.

Formato de versão: `vMAJOR.MINOR.0` — MAJOR sobe quando o módulo/escopo
muda (ex: sair do Módulo 1 para o Módulo 2); MINOR sobe a cada sessão de
desenvolvimento dentro do mesmo módulo.

---

## v0.9.0 — Configurações do app + tab bar flutuante (estilo Uber) como opção
**Sessão 9 — 23/08/2026**

- **Tela de Configurações** (`SettingsSheet.tsx`), acessível por um ícone de
  engrenagem novo no cabeçalho, com lista agrupada estilo iOS (seção em
  caixa alta, linhas com checkmark — `.ios-group`/`.ios-row` em
  `components.css`).
- **Tab bar com dois estilos, trocáveis nas Configurações** (pedido
  explícito do usuário: "salve como opção de dev", não substituir a atual):
  - **Padrão** — o estilo original, fixo e borda a borda.
  - **Padrão 2** — pílula flutuante e compacta, estilo Uber.
  A escolha persiste no aparelho via `TabBarStyleContext` (novo, em
  `src/context/`) e não muda o espaço reservado no rodapé entre um estilo e
  outro — só a aparência interna do `<nav>` muda, então nenhuma tela
  precisou de ajuste.
- **Bug de verdade encontrado e corrigido**: o pop-up de Configurações,
  por nascer dentro do `<header>` (que tem `backdrop-filter` via `.glass`),
  renderizava espremido dentro da caixinha do cabeçalho em vez de cobrir a
  tela — no Chrome, um ancestral com `backdrop-filter` vira o "containing
  block" de `position: fixed`. Corrigido de forma definitiva com
  `ModalOverlay.tsx` (novo): todo pop-up agora renderiza via
  `createPortal` direto em `document.body`, então a posição dele na árvore
  de componentes nunca mais pode causar esse problema. `EventModal` e
  `EditSheet` foram migrados para o mesmo componente.
- **Validado** com `tsc --noEmit`, `vite build`, e testes de ponta a ponta
  com Playwright (trocar de estilo, navegar por todas as abas, recarregar a
  página, voltar ao padrão — sem erros de console).

**Arquivos gerados/alterados:** `src/components/{SettingsSheet,
ModalOverlay,EventModal,EditSheet,TabBar,TopBar,Icon}.tsx`,
`src/context/TabBarStyleContext.tsx`, `src/App.tsx`,
`src/styles/{components,layout}.css`

---

## v0.8.0 — Desconfirmar presença em eventos
**Sessão 8 — 23/08/2026**

- **Cancelar presença**: o botão "Presença confirmada ✓" na aba Eventos
  agora funciona como alternância — tocar de novo desconfirma ("Presença
  confirmada ✓ · cancelar"). Novo método `cancelRsvp` no `DataProvider`
  (`src/lib/db/prefs.ts`, mixin `engagement`, compartilhado pelos dois
  providers automaticamente) e na tela `Eventos.tsx`.
- **Validado** com `tsc --noEmit`, `vite build` e teste de ponta a ponta
  (confirmar → cancelar → recarregar a página → estado correto persistido).

**Arquivos gerados/alterados:** `src/lib/db/{prefs,types}.ts`,
`src/components/EventCard.tsx`, `src/screens/Eventos.tsx`,
`src/styles/components.css`

---

## v0.7.0 — Pop-ups unificados, animação corrigida (jank de backdrop-filter) e planejamento do Módulo 7
**Sessão 7 — 23/08/2026**

- **Feedback visual do pop-up de WhatsApp aplicado**: centralizado na tela
  (em vez de bottom sheet), ícone oficial do WhatsApp (glifo real, selo
  verde `--whatsapp: #25d366`, em vez do desenho aproximado da sessão
  anterior), cargo trocado pelo telefone de cada sócia, sócias em ordem
  alfabética (sem hierarquia visual entre elas), cor de fundo dos cards
  trocada para um gradiente vinho/dourado translúcido, e título mais
  convidativo ("Fale com a gente!"). Removido também o emoji 🤍 do fim da
  mensagem do WhatsApp, que não renderizava (aparecia como `�`).
- **Diagnóstico de animação travada, com medição real** (Playwright + CDP
  `Emulation.setCPUThrottlingRate`, contagem de frames via
  `requestAnimationFrame`): a causa era **`backdrop-filter: blur()` tendo
  que recalcular a cada quadro** — tanto por causa do `scale()` na animação
  de entrada do pop-up quanto, de forma contínua, por causa do fundo
  animado (`.mesh`) se mexendo atrás dele o tempo todo enquanto o pop-up
  ficava aberto. Medido antes/depois: pior quadro caiu de ~117ms para
  ~50ms na entrada, e o pop-up aberto e parado foi de instável para
  **16.7ms constante (60fps)** depois da correção.
  - `useModalEffects` (novo hook, `src/hooks/`): pausa a animação do
    `.mesh` (`body.modal-open .mesh span { animation-play-state: paused }`)
    enquanto qualquer pop-up estiver aberto, e centraliza o fechar-no-Esc
    que antes estava duplicado em `EventModal` e `EditSheet`.
  - Animação de entrada (`modalup`) e de troca de etapa (`stepin`) passam a
    usar só `translateY` + opacidade — nunca `scale` — em elementos com
    `backdrop-filter`.
- **Todos os pop-ups do app unificados num único padrão visual**: `EditSheet`
  (formulários de evento/palestrante/post) deixa de ser um bottom sheet
  claro e passa a ser centralizado e escuro (`glass-dark`), igual ao
  `EventModal` — mesmo comportamento, mesma cor de fundo, mesma animação.
- **Planejamento do Módulo 7** (pedido em 23/08/2026, ainda não
  implementado): atalho na tela de início (Android/iOS) + notificações de
  evento/abertura de ingressos — documentado em
  `docs/ESTADO-DO-PROJETO.md`, seção 6, com a dependência real (login antes
  de notificação por usuária) e as duas rotas possíveis (push de verdade
  via Service Worker/Web Push + backend, ou lembrete só com o app aberto).
- **Validado** com `tsc --noEmit` (strict), `vite build`, e testes visuais/
  de performance com Playwright (mobile 375px e desktop 1440px, com e sem
  CPU throttling).

**Arquivos gerados/alterados:** `src/hooks/useModalEffects.ts`,
`src/components/{EventModal,EditSheet,Icon}.tsx`, `src/lib/whatsapp.ts`,
`src/styles/{components,layout,tokens}.css`, `docs/ESTADO-DO-PROJETO.md`

---

## v0.6.0 — Pop-up de evento com compra via WhatsApp + edição inline de conteúdo
**Sessão 6 — 23/08/2026**

- **Pop-up "Detalhes do evento"** (`EventModal.tsx`): tocar no post em
  destaque da Início abre um pop-up com tema, data, local, palestrante e
  vagas. Botão **"Quero participar"** leva a um segundo passo do mesmo
  pop-up com as **3 sócias** (Lívia, Lia, Cris) — cada uma abre o WhatsApp
  (`wa.me`) com uma mensagem pronta citando o evento e a data. Números
  ficam em `founders[].whatsapp` (`src/data/seed.ts`); a montagem do link e
  da mensagem está em `src/lib/whatsapp.ts`.
- **Edição de conteúdo estilo Instagram, só no aparelho** (sem autenticação,
  não grava no Supabase — decisão explícita para não expor escrita pública
  no banco antes do Módulo 2):
  - Novo componente `Kebab.tsx` — botão "..." com menu flutuante de cantos
    arredondados, igual ao padrão Instagram (usado no post em destaque, nos
    cards de evento e na bio da palestrante).
  - Novo componente `EditSheet.tsx` — bottom sheet genérico para
    formulários, com `EventEditSheet`, `SpeakerEditSheet` e `PostEditSheet`
    por cima dele.
  - Novo `src/lib/db/localContent.ts` — overlay de edições/criações em
    localStorage, aplicado sobre o resultado de `db.getEvents()` /
    `db.getSpeakers()` (funciona com os dois providers, local ou Supabase,
    já que a edição nunca sai do navegador).
  - Eventos e Palestrantes ganharam botão de criar novo item
    (`+ Novo evento` / célula `+ Nova`); o post em destaque da Início ganhou
    edição de legenda, texto do botão e evento vinculado.
- **Correção de bug pré-existente**: o toast (`Toast.tsx`) ficava com uma
  pequena pastilha residual visível perto do rodapé mesmo sem mensagem —
  o deslocamento para escondê-lo era proporcional ao tamanho da própria
  caixa, que encolhe a quase nada quando o texto está vazio. Corrigido
  adicionando `opacity: 0` (além do `transform`) no estado escondido.
- 6 ícones novos em `Icon.tsx`: `chevronLeft`, `close`, `users`, `whatsapp`,
  `edit`, `plus`.
- **Testado de ponta a ponta com Playwright** (headless, viewport 375px):
  fluxo completo do pop-up até os 3 links `wa.me` corretos, edição e criação
  de evento/palestrante com persistência após reload, sem erros de console.
- **Validado** com `tsc --noEmit` (strict) e `vite build`.

**Arquivos gerados/alterados:** `src/components/EventModal.tsx`,
`Kebab.tsx`, `EditSheet.tsx`, `EventEditSheet.tsx`, `SpeakerEditSheet.tsx`,
`PostEditSheet.tsx`, `src/lib/whatsapp.ts`, `src/lib/db/localContent.ts`,
`src/components/{EventCard,PostCard,Icon}.tsx`,
`src/screens/{Home,Eventos,Palestrantes}.tsx`, `src/data/seed.ts`,
`src/types/index.ts`, `src/styles/components.css`

---

## v0.5.0 — Supabase como banco de dados
**Sessão 5**

- **Decisão**: o banco do projeto passa a ser o **Supabase** (Postgres +
  RLS), substituindo o plano anterior de usar o banco do Bubble.
- **Camada de dados reestruturada** em `src/lib/db/`, com dois providers
  atrás da mesma interface `DataProvider`:
  - `supabaseProvider` — conteúdo vindo do Postgres;
  - `localProvider` — localStorage, usado quando não há credenciais.
  A escolha é **automática** pelas variáveis de ambiente, então o app
  continua rodando após um clone limpo, sem configurar nada.
- **Leitura de conteúdo virou assíncrona** em ambos os providers (mesmo no
  local), para que ligar ou desligar o Supabase não exija mexer em nenhum
  componente. Criado o hook `useAsyncData` e o componente `<Skeleton>` para
  os estados de carregamento.
- **Divisão explícita de responsabilidade**: conteúdo (eventos, palestrantes,
  planos) no Supabase; engajamento (curtir, salvar, RSVP, plano escolhido)
  segue no localStorage — sem autenticação não há usuária a quem atribuir
  esses registros.
- **`supabase/schema.sql`** criado, idempotente: tabelas `events`,
  `speakers` e `plans` com RLS de leitura pública apenas para linhas
  publicadas, triggers de `updated_at`, e — já prontas para o Módulo 2 — as
  tabelas `profiles`, `rsvps`, `post_engagements` e `plan_selections` com RLS
  restrita por `auth.uid()`, além do trigger que cria o perfil no cadastro.
- **`supabase/seed.sql`** criado, espelhando `src/data/seed.ts`, com upsert
  para poder rodar de novo sem duplicar.
- **Degradação graciosa**: falha de consulta, RLS bloqueando ou tabela vazia
  fazem o app cair no conteúdo local com aviso no console, em vez de tela
  branca.
- **Tipos do banco** em `src/types/database.ts`, com a conversão
  snake_case → camelCase isolada nos mapeadores do provider.
- **`docs/SUPABASE.md`** criado: configuração em 10 minutos, o que é seguro
  expor (anon sim, service_role nunca), explicação do RLS do projeto, edição
  de conteúdo no dia a dia e tabela de diagnóstico de falhas.
- Finalizados os itens pendentes da sessão anterior: CI no GitHub Actions
  (typecheck + build, de propósito sem credenciais), quatro comandos do
  Claude Code em `.claude/commands/`, e configurações do VS Code.
- **Validado** com `tsc --noEmit` (strict) e `vite build`.

**Arquivos gerados/alterados:** `src/lib/db/*`, `src/lib/supabase.ts`,
`src/types/database.ts`, `src/hooks/useAsyncData.ts`,
`src/components/Skeleton.tsx`, telas `Eventos`/`Palestrantes`/`Planos`,
`supabase/schema.sql`, `supabase/seed.sql`, `docs/SUPABASE.md`, `CLAUDE.md`,
`README.md`, `docs/ARQUITETURA.md`, `.env.example`, `.github/workflows/ci.yml`,
`.claude/commands/*`

---

## v0.4.0 — Migração do Bubble para código (GitHub + Vercel)
**Sessão 4**

- **Decisão**: sair do Bubble.io e do HTML único. O projeto passa a ser um
  repositório de código real, trabalhado no VS Code com o Claude Code,
  versionado no GitHub (`FabioMiranda04/triade`) e hospedado na Vercel.
- **Stack escolhida**: Vite + React 18 + TypeScript (strict) +
  react-router-dom + CSS puro com variáveis. Sem Tailwind, sem biblioteca de
  ícones — o visual pronto foi migrado, não reescrito.
- **Mesmas 5 telas, mesmas funcionalidades**: feed com curtir/duplo
  toque/salvar, Sobre com idealizadoras e trajetória, Eventos com filtro e
  RSVP, Palestrantes em grade com bio, Planos com seleção persistida e bloco
  de patrocínio.
- **CSS migrado com valores idênticos** ao protótipo, reorganizado em quatro
  arquivos: `tokens.css`, `base.css`, `layout.css`, `components.css`.
- **Navegação virou rotas reais** (`/`, `/sobre`, `/eventos`,
  `/palestrantes`, `/planos`) em vez de troca de painel por JavaScript —
  ganha deep link, botão voltar do Android e URL compartilhável.
- **Camada de dados tipada**: `TriadeData` virou `src/lib/storage.ts`, com
  tipos em `src/types/` e conteúdo em `src/data/seed.ts`. Mantido o namespace
  `triade_` no localStorage, então dados do protótipo continuam válidos.
- **Ícones** viraram um componente `<Icon name="..." />` com SVG inline.
- **Gesto de duplo toque** reimplementado com detecção por `pointerup`, mais
  confiável em mobile do que `ondblclick`.
- **Infra criada**: `CLAUDE.md` (regras do projeto para o Claude Code),
  `docs/ARQUITETURA.md`, `docs/DESIGN-SYSTEM.md`, `docs/DEPLOY.md`,
  `vercel.json` com rewrite de SPA, `.gitignore`, `.editorconfig`,
  `.prettierrc`, CI no GitHub Actions (typecheck + build), comandos do Claude
  Code em `.claude/commands/`, manifest de PWA.
- **HTML original preservado** em `legacy/` como referência visual.
- **Validado** com `tsc --noEmit` (strict) e `vite build` — sem erros.

**Arquivos gerados/alterados:** projeto inteiro (`src/`, `docs/`, `CLAUDE.md`,
`README.md`, `vercel.json`, `index.html`, configs)

---

## v0.3.0 — App shell single-file + navegação estilo Instagram
**Sessão 3**

- Reescrita completa da entrega em **um único arquivo HTML**
  (`TRIADE-APP-TESTE-BUBBLE.html`), pensado especificamente para colar num
  único elemento HTML do Bubble e testar como um app de verdade.
- As 5 telas (Início, Sobre, Eventos, Palestrantes, Planos) viraram
  **painéis trocados via JavaScript** (SPA simples), sem reload de página.
- **Barra de navegação inferior redesenhada**: de uma pílula flutuante para
  uma **barra fixa, borda a borda, ancorada exatamente no fundo da tela**
  (`position:fixed` dentro de um shell `100vh` com flexbox), igual ao padrão
  do Instagram no iPhone. Usa `env(safe-area-inset-bottom)` para respeitar a
  área de gestos.
- Estrutura de "app shell": header fixo no topo (logo + busca + sino), área
  de conteúdo com scroll independente, tab bar fixa embaixo — em vez de uma
  página comum que rola inteira.
- Conteúdo da Home reformulado em **formato de feed/post** (estilo rede
  social): avatar, nome, imagem, ações de curtir/comentar/compartilhar/
  salvar, com **like por duplo toque na imagem** (gesto clássico do
  Instagram) e contagem de curtidas dinâmica.
- Curtidas e itens salvos agora persistem no `localStorage` e voltam a
  aparecer corretamente ao recarregar a página.
- Testado com automação (Playwright) em 4 tamanhos de tela (iPhone SE,
  iPhone Pro, Android médio, tablet): sem erros de JavaScript, barra sempre
  ancorada na borda inferior, troca de painéis confirmada
  programaticamente.

**Arquivos gerados/alterados:** `TRIADE-APP-TESTE-BUBBLE.html`

---

## v0.2.0 — Redesign "Liquid Glass"
**Sessão 2**

- Design visual anterior (editorial/clássico) **substituído por completo**
  a pedido do cliente, buscando um visual moderno, inspirado em redes
  sociais (Instagram) e no design "Liquid Glass" da Apple (iOS 26).
- Pesquisa na web sobre os princípios do Liquid Glass (Apple) e sobre
  técnicas atuais de glassmorphism/mesh gradient em CSS antes de
  implementar.
- Novo sistema de design implementado:
  - Painéis de vidro translúcido (`backdrop-filter: blur + saturate`) com
    brilho superior simulando reflexo de luz.
  - Fundo com manchas de cor desfocadas e fixas (mesh gradient) nas cores
    da marca, com flutuação lenta via CSS.
  - Barra superior de vidro + tab bar inferior fixa (primeira versão, em
    formato de pílula flutuante — depois evoluída na v0.3).
  - Fileira de "stories" no topo da Página Inicial.
  - Tipografia trocada para `Fraunces` + `Instrument Serif` (itálico) +
    `Inter`.
  - Paleta ajustada para tom areia + vinho + dourado/blush.
  - Marca de setas triplas do logo mantida como elemento de assinatura,
    agora em formato de badge de vidro circular.
- As 5 páginas HTML foram **completamente regeradas** com o novo visual
  (mesma estrutura de conteúdo do v0.1.0, camada visual nova).
- Prévia em PDF navegável **recriada usando Chromium real via Playwright**
  (em vez do conversor antigo, que não suportava `backdrop-filter` e não
  mostrava o efeito de vidro corretamente).
- `CONTEXTO-PROJETO.md` atualizado com uma seção descrevendo o redesign.

**Arquivos gerados/alterados:** `01-pagina-inicial.html` … `05-planos.html`,
`Triade-Conecta-Modulo1-Preview.pdf`, `CONTEXTO-PROJETO.md`

---

## v0.1.0 — Módulo 1: Landing Page (primeira versão)
**Sessão 1**

- Recebido o material de marca da Tríade Conecta (PDF de patrocínio) com:
  posicionamento ("mulheres • negócios • conexões"), as 3 idealizadoras
  (Lívia Duarte, Lia Chaves, Cris Miranda), histórico das 2 primeiras
  edições, palestrantes convidadas, formato do evento, público-alvo e
  cotas de patrocínio (R$ 1.500/edição). Também recebido um protótipo HTML
  anterior (feito no Bubble) como referência de estrutura de app.
- Definido o escopo do **Módulo 1 — Landing Page**, com 5 telas: Página
  inicial, Sobre a Tríade, Eventos, Palestrantes, Planos de assinatura.
- Decisão de arquitetura de dados em 3 fases: **localStorage (agora) → 
  Bubble Database (produção) → Supabase (se/quando necessário)**, abstraída
  atrás de um único objeto `TriadeData` no JS para que a migração troque só
  a implementação, não o HTML/CSS.
- Primeira versão visual: editorial/clássica (`Playfair Display` +
  `Playball` + `Inter`, paleta marfim/vinho/dourado), 5 arquivos HTML
  separados e navegáveis por link relativo, cada um autocontido
  (CSS+JS inline) para colar em elementos HTML do Bubble.
- Criados os primeiros documentos de apoio: `PLANO-DE-ACAO.md` (roadmap,
  como inserir no Bubble, próximos módulos sugeridos) e
  `CONTEXTO-PROJETO.md` (contexto de marca e decisões técnicas).
- A pedido do cliente, as 5 páginas foram reunidas numa **prévia única em
  PDF navegável** (capa + marcadores/bookmarks por seção), gerada
  inicialmente com `wkhtmltopdf` (depois substituído na v0.2.0 por não
  suportar o efeito de vidro).

**Arquivos gerados:** `01-pagina-inicial.html` … `05-planos.html`,
`PLANO-DE-ACAO.md`, `CONTEXTO-PROJETO.md`,
`Triade-Conecta-Modulo1-Preview.pdf`

---

## Como adicionar uma nova entrada

No início da próxima sessão de desenvolvimento, copie o modelo abaixo para
o **topo** deste arquivo (mantendo as entradas antigas abaixo) e preencha
ao final da sessão:

```md
## vX.Y.0 — <título curto da sessão>
**Sessão N**

- O que foi pedido / decidido.
- O que foi implementado (bullets objetivos).
- O que foi testado/validado.

**Arquivos gerados/alterados:** `arquivo1.html`, `arquivo2.md`
```

Depois, atualize o `ESTADO-DO-PROJETO.md` conforme o protocolo descrito na
seção 9 daquele arquivo.
