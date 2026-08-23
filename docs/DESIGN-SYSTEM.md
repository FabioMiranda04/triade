# Design System — "Liquid Glass"

> Manual de UI/UX do app Tríade Conecta. Se você vai desenhar ou construir
> qualquer tela, componente, pop-up, ícone ou animação nova, **leia este
> arquivo inteiro antes de escrever CSS**. Ele é a fonte da verdade — quando
> o sistema mudar, este arquivo muda junto (ver seção 11).
>
> Invoque a skill `design-systems` para carregar este checklist automaticamente.

Visual inspirado no Liquid Glass da Apple e na linguagem de navegação do
Instagram/iOS, com a paleta de marca da Tríade. Todos os valores numéricos
vivem em `src/styles/tokens.css` — nunca em componente.

---

## 1. Tokens (`src/styles/tokens.css`)

### Cores

| Token | Valor | Uso |
|---|---|---|
| `--sand` | `#F4EEE3` | fundo do app |
| `--sand-deep` | `#EAE1D1` | miolo dos stories |
| `--ink` | `#231C1A` | texto principal (sobre fundo claro) |
| `--ink-70` / `--ink-45` | opacidades de `--ink` | texto secundário / terciário (sobre fundo claro) |
| `--wine` | `#7C2A3D` | destaque, CTA, eyebrow |
| `--wine-deep` | `#511B29` | fim do gradiente do CTA |
| `--gold` | `#C79A55` | acento, item salvo, ponto ativo da tab |
| `--gold-soft` | `#EFDCB8` | gradientes, pill "em breve" |
| `--plum` | `#4A2140` | mancha do fundo |
| `--blush` | `#E7B3A0` | mancha do fundo, gradientes |
| `--whatsapp` | `#25D366` | **só** no selo do botão de WhatsApp (`.wa-badge`) |
| `--danger` | `#E5484D` | estado de erro em formulário (`.auth-error`) |

`--whatsapp` é a única cor de marca de terceiros no sistema. Regra: se um
dia precisar de outra marca externa (ex: Instagram, um provedor de
pagamento), o hex dela vira token aqui também — nunca hardcoded dentro de
um componente. Cor de marca própria da Tríade nunca sai da paleta acima.

Sobre fundo escuro (`.glass-dark`, todo pop-up), o texto usa `--sand` e
`rgba(244, 238, 227, N)` para as variações de opacidade — `--ink-70`/`-45`
são pensados para fundo claro e ficam ilegíveis em cima de `glass-dark`.

### Raios e espaçamento

| Token | Valor | Uso |
|---|---|---|
| `--r-xl` | `28px` | pop-ups (`.modal-sheet`), profile card |
| `--r-lg` | `22px` | `.glass` genérico, cabeçalho |
| `--r-md` | `14px` | cards de conteúdo, botões de formulário, badges |

### Safe area

`--safe-t` / `--safe-b` = `env(safe-area-inset-top/bottom, 0px)`. Todo
elemento fixo/flutuante que toca a borda de cima ou de baixo da tela
(header, tab bar, pop-ups) precisa somar isso ao padding — sem isso a UI
invade a ilha dinâmica ou a barra de gestos do iPhone.

### Tipografia

| Fonte | Papel |
|---|---|
| **Fraunces** (`--font-display`) | títulos, preços, números de estatística |
| **Instrument Serif** itálico (`--font-script`) | assinatura da marca, nomes das idealizadoras |
| **Inter** (`--font-ui`) | todo o resto (padrão do `body`) |

Carregadas por `<link>` do Google Fonts no `index.html`.

---

## 2. Vidro ("Liquid Glass")

| Classe | `backdrop-filter`? | Uso |
|---|---|---|
| `.glass` | sim, `blur(20px) saturate(160%)` | cards claros no feed/listas (`.post`, `.ev-card`) |
| `.glass-strong` | **não** | superfícies claras opacas (segmented control, toast, kebab menu) |
| `.glass-dark` | sim, `blur(24px) saturate(160%)` | **todo pop-up**, tab bar, plano em destaque, citação |

`.sheen` é a faixa diagonal de luz sobre o vidro (opcional, decorativa,
`position:absolute; inset:0;` dentro de um `.glass`).

**Regra de performance, não é só estética — ver seção 9.** Nunca anime
`scale`, `width` ou `height` num elemento com `backdrop-filter`. Anime só
`transform: translate(...)` e `opacity`.

---

## 3. Marca

As **três setas** do logo são o elemento de assinatura, reaproveitadas como
badge circular de vidro em vários pontos. Componente: `<Mark size={30} />`
(`src/components/Brand.tsx`). O tamanho alimenta a variável CSS `--m`.

---

## 4. Pop-ups e modais

**Todo pop-up do app segue um único padrão visual**: centralizado na tela,
fundo `glass-dark`, cantos totalmente arredondados (`--r-xl`). Não existe
mais variante "bottom sheet" nem variante clara — isso foi unificado
depois de feedback explícito do usuário (ver `docs/CHANGELOG.md`, v0.7.0).
Não reintroduza nenhuma das duas sem perguntar antes.

### 4.1 `ModalOverlay` — use sempre, nunca escreva `<div className="modal-overlay">` à mão

```tsx
<ModalOverlay onClose={onClose}>
  <div className="modal-sheet glass-dark" role="dialog" aria-modal="true"
       aria-label="..." onClick={(e) => e.stopPropagation()}>
    {/* conteúdo do pop-up */}
  </div>
</ModalOverlay>
```

`src/components/ModalOverlay.tsx` faz duas coisas obrigatórias para
qualquer pop-up:

1. **Renderiza via `createPortal(..., document.body)`.** Um pop-up que
   nasce como filho de um componente com `backdrop-filter` (ex: o
   `TopBar`, que é `.app-top.glass`) tem seu `position: fixed` quebrado no
   Chrome — o ancestral com `backdrop-filter` vira o "containing block" e
   o overlay fica espremido dentro da caixinha do ancestral em vez de
   cobrir a tela. Isso já aconteceu (`SettingsSheet`, sessão 9) e o portal
   resolve de vez, independente de onde o pop-up é montado na árvore.
2. **Chama `useModalEffects(onClose)`**, que fecha no Esc e pausa a
   animação do `.mesh` de fundo (`body.modal-open .mesh span`) enquanto o
   pop-up estiver aberto — ver seção 9 sobre por que isso importa.

### 4.2 Inventário de pop-ups existentes

| Componente | O que é | Passos internos |
|---|---|---|
| `EventModal.tsx` | Detalhes do evento em destaque | 1) detalhes 2) "Quero participar" → 3 sócias no WhatsApp |
| `EditSheet.tsx` | Formulário genérico de criar/editar | usado por `EventEditSheet`, `SpeakerEditSheet`, `PostEditSheet` |
| `SettingsSheet.tsx` | Configurações do app | lista agrupada estilo iOS |
| `AccountSheet.tsx` | Conta da usuária | deslogada: entrar/cadastrar (alterna) → cadastro pode levar a "confira seu e-mail"; logada: e-mail + sair |

Troca de passo dentro do **mesmo** pop-up (ex: detalhes → contatos): envolva
o conteúdo de cada passo num `<div className="modal-step" key="nome-do-passo">`
— o `key` diferente faz o React remontar e a animação `stepin` tocar de novo.

### 4.3 Formulário (`EditSheet` + `.field`)

Campos usam `<label className="field"><span>Rótulo</span><input .../></label>`.
Fundo do input é claro (`rgba(255,255,255,0.65)`) mesmo dentro do
`glass-dark` — contraste de propósito, não bug. Rótulo (`.field span`) usa
`rgba(244,238,227,0.7)`, nunca `--ink-70` (ilegível no fundo escuro).

### 4.4 Lista agrupada estilo iOS (`.ios-group` / `.ios-row`)

Usada em `SettingsSheet`. Um `.ios-section-label` (rótulo em caixa alta) +
`.ios-group` (container com cantos arredondados) + várias `.ios-row`
(linha clicável, com separador fino entre elas, checkmark opcional à
direita). Use este padrão para qualquer tela de preferências/configurações
futura — não invente outro estilo de lista para isso.

### 4.5 Menu "..." (`Kebab.tsx`)

Botão de três pontos + popover customizado com cantos arredondados,
estilo Instagram — usado em `EventCard`, na bio da palestrante e no post
em destaque para a ação "Editar". Não usa `ModalOverlay` (não é
tela-cheia, é um popover pequeno ancorado ao botão) mas segue a mesma
paleta/animação do resto do sistema (`glass-strong`, pop de escala rápido).

```tsx
<Kebab label="Opções do evento" actions={[{ label: 'Editar', icon: 'edit', onClick: fn }]} />
```

---

## 5. Ícones (`src/components/Icon.tsx`)

Dois estilos coexistem de propósito:

1. **Linha fina (padrão)**: `<svg fill="none" stroke="currentColor" strokeWidth={1.9}>`
   definido uma vez no componente `<Icon>`. A maioria dos ícones (`heart`,
   `calendar`, `pin`, `edit`, `settings`, `chevronRight`...) só precisa
   declarar o `<path>` com esse contorno herdado.
2. **Preenchido (glifo de marca)**: quando o ícone precisa ser reconhecível
   como logo de terceiro (hoje só `whatsapp`), o `<path>` individual
   sobrescreve com `fill="currentColor" stroke="none"` — o padrão já usado
   por `heartFill`/`bookmarkFill`. Nunca force um logo de marca a virar
   contorno fino só por "consistência" — description perde o reconhecimento
   visual da marca.

Para adicionar um ícone: `viewBox="0 0 24 24"`, acrescente a chave em
`IconName` e o path em `PATHS`. Ícones atuais: `heart(Fill)`,
`bookmark(Fill)`, `comment`, `share`, `more`, `search`, `bell`, `home`,
`calendar`, `mic`, `sparkle`, `check`, `pin`, `chevronRight`,
`chevronLeft`, `close`, `users`, `whatsapp`, `edit`, `plus`, `settings`.

---

## 6. Navegação

### 6.1 Header (`TopBar.tsx`)

Logo (volta pro Início) + `.top-actions` com botões `.icon-btn` (38×38px,
círculo). Hoje: buscar, notificações, configurações (engrenagem). Um pop-up
aberto a partir daqui **precisa** de `ModalOverlay` (ver 4.1) por causa do
`backdrop-filter` do próprio header.

### 6.2 Tab bar (`TabBar.tsx`) — dois estilos, escolha do usuário

A tab bar tem duas aparências, trocáveis em **Configurações → Navegação**
(`TabBarStyleContext`, persistida no aparelho):

- **"Padrão"** — fixa, borda a borda, com o item central (Eventos) em
  badge circular destacado. O estilo original do app.
- **"Padrão 2"** — pílula flutuante e compacta, estilo Uber
  (`.tab-pill`, todos os itens uniformes, o item ativo ganha um fundo
  translúcido em vez do badge circular).

**Importante para manutenção**: o `<nav className="tabbar">` reserva
*sempre* a mesma altura no layout flex de `.app`, independente do estilo
— só a aparência interna muda (borda a borda vs. `.tab-pill` arredondada).
Isso existe de propósito para `.app-main` nunca precisar recalcular
tamanho ou ganhar padding condicional: ao adicionar um 3º estilo no
futuro, mantenha essa invariante.

### 6.3 Regra: variação de UI vira opção em Configurações, não substituição silenciosa

Quando o pedido for "quero que X pareça com [referência]" sem dizer
"troque"/"substitua", trate como candidato a **opção em Configurações**
(como a tab bar acima), não como redesign definitivo que apaga o anterior.
Confirme com o usuário qual dos dois ele quer antes de remover a versão
atual.

---

## 7. Movimento e animação

**Curva de easing padrão do sistema**: `cubic-bezier(0.16, 1, 0.3, 1)`
("ease-out-expo") — todo pop-up, troca de passo, stagger de lista e menu
kebab usa essa curva. Não introduza uma curva diferente sem motivo visual
concreto; a consistência da curva é o que faz a UI parecer "um sistema" em
vez de vários componentes animados por pessoas diferentes.

### Catálogo de keyframes

| Keyframe | Onde | O que faz |
|---|---|---|
| `modalfade` | `.modal-overlay` | fade simples do fundo escurecido |
| `modalup` | `.modal-sheet` | entrada: só `translateY(24px)→0` + opacidade — **nunca `scale`** (backdrop-filter, ver seção 9) |
| `stepin` | `.modal-step` | troca de passo dentro do pop-up: `translateY(8px)` + opacidade |
| `contactin` | `.wa-btn` | entrada em cascata dos cards de contato (`animation-delay` por `:nth-child`, `animation-fill-mode: backwards`) |
| `kebabpop` | `.kebab-menu` | popover do menu "...": `scale(0.9)→1` + opacidade — ok usar `scale` aqui, **não tem** `backdrop-filter` |
| `panelin` | `.panel` | troca de aba: fade + 6px para cima |
| `heartpop` | `.heart-burst` | coração do duplo toque no feed |
| `float1/2/3` | `.mesh span` | manchas de fundo, loops de 20–30s — **pausam** enquanto um pop-up está aberto (seção 9) |

### Feedback de toque

Todo elemento interativo (botão, item de kebab, linha de `.ios-row`, campo
de formulário) tem uma transição curta (`0.12–0.18s`) e um estado
`:active` (`scale(0.96–0.98)` ou mudança sutil de fundo) — nunca depender
só do estado `:hover`/`:focus` padrão do navegador, que não existe em
touch.

### Acessibilidade de movimento

`base.css` já zera **toda** duração de animação/transição sob
`prefers-reduced-motion: reduce`, globalmente. Uma animação nova não
precisa (e não deve) reimplementar essa guarda — só não entre em conflito
com ela (ex: não faça a lógica do componente depender de "quando a
animação termina" via JS sem checar `matchMedia`, já que ela pode terminar
instantaneamente).

---

## 8. Componentes de UI (mapa rápido)

| Classe / Componente | O que é |
|---|---|
| `.post` + `<PostCard>` | card de feed: avatar, imagem, ações, legenda, kebab opcional |
| `.stories` + `<Stories>` | fileira circular no topo do Início |
| `.ev-card` + `<EventCard>` | card de edição do evento, RSVP (alterna confirmar/cancelar) e kebab |
| `.plan-card` + `<PlanCard>` | card de plano; `featured` usa vidro escuro |
| `.pal-grid` / `.pal-cell` / `.pal-add` | grade 3 colunas de palestrantes + célula de adicionar |
| `.segmented` | filtro de eventos (Todos / Em breve / Realizados) |
| `.sec-head` + `<SectionHead>` | eyebrow + título + descrição |
| `.btn` `.btn-primary` `.btn-glass` `.full` | botões |
| `.toast` + `useToast()` | mensagem curta no rodapé (~2,2s) |
| `.mesh` + `<MeshBackground>` | manchas de cor desfocadas do fundo |
| `ModalOverlay` | portal + efeitos compartilhados de todo pop-up (seção 4.1) |
| `EventModal` / `EditSheet` / `SettingsSheet` / `AccountSheet` | pop-ups (seção 4.2) |
| `.auth-error` | mensagem de erro de formulário (`--danger`) |
| `.wa-btn` / `.wa-badge` | card de contato com cor de marca (gradiente vinho/dourado translúcido) |
| `Kebab` / `.kebab-menu` | menu "..." estilo Instagram (seção 4.5) |
| `.ios-group` / `.ios-row` | lista agrupada estilo iOS (seção 4.4) |
| `.add-tile` | botão tracejado "+ Novo X" no fim/topo de uma lista |
| `TabBar` (Padrão / Padrão 2) | navegação inferior (seção 6.2) |

---

## 9. Performance — regra crítica de `backdrop-filter`

Aprendido com um bug real (sessão 7, relatado pelo usuário como "animação
travada", medido com Playwright + CPU throttling): **um elemento com
`backdrop-filter` precisa recalcular o desfoque do fundo a cada quadro
sempre que (a) o próprio elemento muda de tamanho/posição via `scale`, ou
(b) qualquer coisa atrás dele continua se mexendo.** Isso é caro, escala
com a área em pixels da tela (por isso é pior em desktop que em mobile), e
o segundo caso é **contínuo** — dura o tempo inteiro em que o pop-up fica
aberto, não só na entrada.

Duas regras não-negociáveis para qualquer elemento com `backdrop-filter`
(`.glass`, `.glass-dark`, `.modal-sheet`):

1. **Anime só `translate`/`opacity`.** Nunca `scale`, `width`, `height`,
   `top`/`left` sem `transform`.
2. **Pause qualquer coisa que se mexa atrás dele enquanto estiver visível.**
   É exatamente o que `useModalEffects` faz com o `.mesh` — reuse o hook,
   não escreva um novo efeito de abrir/fechar.

Medido: sem essas regras, pior quadro chegava a ~117ms (stutter bem
visível); com elas, entrada cai para ~50ms (custo de montagem, praticamente
irredutível) e o pop-up aberto e parado fica em 16,7ms constante = 60fps.

---

## 10. Regras gerais

1. Sem hex solto em componente — use as variáveis de `tokens.css`. Cor de
   marca de terceiro nova também vira token (seção 1).
2. Alvo de toque mínimo confortável: ~38–44px.
3. Todo pop-up passa por `ModalOverlay` (seção 4.1) — nunca um
   `<div className="modal-overlay">` cru.
4. Nunca `scale`/resize num elemento com `backdrop-filter` (seção 9).
5. Imagens hoje são gradientes da marca. Ao entrar foto real, troque o
   `background` de `.post-media` / `.ev-card .ph` / `.pal-cell` por `<img>`
   mantendo o mesmo `aspect-ratio`.
6. A tab bar suporta bem até 5 itens em telas de 360px, em qualquer um dos
   dois estilos.
7. Uma variação visual nova de algo que já existe é uma opção em
   Configurações até o usuário confirmar que deve substituir o original
   (seção 6.3).
8. Verifique toda mudança de UI em 375px de largura antes de considerar
   pronta (regra 1 do `CLAUDE.md`).

---

## 11. Manter este documento vivo

Sempre que uma sessão de trabalho mudar algo coberto aqui — um token novo,
um componente de pop-up novo, uma regra de animação, um ícone, um padrão
de navegação — atualize a seção correspondente **na mesma sessão**, junto
com `docs/CHANGELOG.md` e `docs/ESTADO-DO-PROJETO.md` (protocolo na seção
9 daquele arquivo). Este arquivo não deve ficar defasado da UI real do app.
