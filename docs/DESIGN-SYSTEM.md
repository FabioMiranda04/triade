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

### 1.1 As três camadas

`tokens.css` é organizado em três camadas, e a ordem importa:

1. **Paleta de marca** — os hex oficiais da Tríade (`--brand-gold`,
   `--brand-burgundy`, `--brand-olive`...). **Não mudam com o tema**, e
   **não são escolha nossa**: vêm do Manual de Marca Tríade Conecta
   (`docs/MANUAL-DE-MARCA.md`). Mexer num valor da camada 1 sem o manual
   ter mudado é errado, por mais que a tela fique bonita.
2. **Papéis semânticos** — o que a cor *faz* na tela (`--accent`,
   `--glass`, `--ph-grad`, `--btn-primary-grad`...). **É só esta camada
   que `layout.css`/`components.css` consomem.**
3. **Temas** — cada tema redefine a camada 2 dentro do seu próprio bloco.
   **O tema PADRÃO mora no `:root`** — desde 26/08/2026, o **Ônix**.
   `[data-theme='perola']` é o alternativo (o visual claro original).

   Isso não é arrumação: o tema padrão precisa pintar certo com CSS puro,
   antes de qualquer JavaScript. Se dependesse de um `data-theme` posto por
   script, toda abertura piscaria o tema errado por um quadro. Ao trocar
   qual tema é o padrão, **mova os valores** — não basta trocar o default
   no `ThemeContext`.

A consequência prática: **nenhum seletor de componente sabe qual tema está
ativo.** Não existe (e não deve passar a existir) regra do tipo
`[data-theme='onyx'] .algum-componente { ... }` fora de `tokens.css`. Se um
componente precisa de um valor diferente por tema, isso vira um token novo
— não um seletor de tema no CSS do componente.

### 1.2 Cores por papel

| Token | Papel | Ônix (padrão) | Pérola |
|---|---|---|---|
| `--sand` | fundo do app | `#0F0A06` | Cream Quartz `#F6F3EE` |
| `--sand-deep` | segunda superfície | `#1D150D` | Almond `#EADED0` |
| `--ink` | texto principal sobre o fundo | Cream Quartz `#F6F3EE` | Walnut `#402814` |
| `--ink-70` / `--ink-45` | texto secundário / terciário | níveis claros de `--ink` | níveis escuros de `--ink` |
| `--accent` / `--accent-deep` | marca em ação: eyebrow, preço, link, ícone ativo | Dourado `#C9A66B` | Burgundy `#65202D` |
| `--accent-fill` / `-strong` | véu do acento em `:active` | dourado translúcido | burgundy translúcido |
| `--accent-on-dark` / `-soft` | acento **sobre vidro escuro** (tab bar, citação) | Dourado / Sand `#D9B991` | Dourado / Sand |
| `--fill-weak/mid/strong` | véu neutro (botão redondo, item ativo, pílula) | branco translúcido | Walnut translúcido |
| `--on-dark` | texto sobre `.glass-dark` | Cream Quartz | Cream Quartz |
| `--glass` / `-strong` / `-border` | vidro sobre o fundo da tela | véu branco de baixa opacidade | branco translúcido |
| `--glass-dark` / `-border` | vidro escuro (todo pop-up) | `rgba(55,46,37,.86)` + hairline dourada | `rgba(55,46,37,.72)` |
| `--featured-border` / `-top` | borda do plano em destaque | dourada | igual ao vidro |
| `--ph-1..5`, `--ph-grad`, `--ph-fg`, `--ph-border` | placeholders de imagem (ver 1.4) | grafite morno + glifo dourado | gradiente da marca |
| `--btn-primary-*`, `--cta-*`, `--badge-*`, `--seg-active-*` | preenchimentos de ação | dourado, texto preto | burgundy, texto claro |

**A regra do dourado, que é a mais fácil de errar.** O manual chama o
dourado de "assinatura principal da marca", e a leitura ingênua disso é
"então use dourado no texto em todo lugar". Medido no pixel renderizado:

| Dourado sobre | Contraste | Serve para |
|---|---|---|
| fundo Ônix `#0F0A06` | **9,3:1** | qualquer coisa, inclusive texto pequeno |
| Cream Quartz `#F6F3EE` | **1,9:1** | nada que precise ser lido |

Ou seja: no tema claro o dourado oficial é **decoração** — fio, moldura,
área grande, ícone puramente ornamental. O que precisa ser lido usa
Burgundy (10,6:1) ou, quando o papel exige mesmo "ser dourado" (o ícone
de salvar), o `--brand-gold-deep` `#8A6B32` (4,5:1), que é derivado nosso
e existe só por causa dessa conta. É também por isso que a versão
principal da logo no manual é dourada **sobre claro em área grande**, e
não dourada em corpo de texto.
| `--like-fg` / `--save-fg` | curtir / salvar no feed | dourado / branco | vinho / dourado |
| `--tab-idle` / `--tab-active` / `--tab-center-grad` / `--tabbar-line` | tab bar | hairline dourada | hairline branca |
| `--field-*` | campo de formulário dentro do pop-up | fundo escuro, anel dourado | fundo claro |
| `--mesh-1..4`, `--mesh-op` | manchas do fundo | brasa dourada bem apagada | cores da marca |
| `--overlay-scrim` | escurecimento atrás do pop-up | `rgba(0,0,0,.78)` | `rgba(20,14,13,.55)` |
| `--whatsapp` | **só** no selo do botão de WhatsApp (`.wa-badge`) | igual | `#25D366` |
| `--danger` | erro em formulário (`.auth-error`) | igual | `#E5484D` |

`--whatsapp` é a única cor de marca de terceiros no sistema. Regra: se um
dia precisar de outra marca externa (ex: Instagram, um provedor de
pagamento), o hex dela vira token aqui também — nunca hardcoded dentro de
um componente. Cor de marca própria da Tríade nunca sai da paleta acima.

Três exceções deliberadas continuam com hex cru no CSS, porque são cores
de terceiro ou véu sobre imagem, não cor de tema: `#fff` do coração do
duplo toque, `#fff` do selo do WhatsApp e o par `#fff`/`#1f1f1f` do botão
do Google (especificação de marca do próprio Google).

Sobre vidro escuro (`.glass-dark`, todo pop-up), o texto usa `--on-dark` e
`rgba(244, 238, 227, N)` para as variações de opacidade — `--ink-70`/`-45`
são pensados para o fundo da tela e não servem aí. Esses véus em
`rgba(255,255,255,α)` aplicados **sobre** `.glass-dark` são invariantes de
tema de propósito: o vidro escuro é escuro nos dois temas.

### 1.3 Temas (Configurações → Aparência)

Dois temas, trocáveis no app e salvos no aparelho (`ThemeContext`,
`src/context/ThemeContext.tsx`):

- **Ônix** (padrão desde 26/08/2026) — preto, branco e detalhes dourados.
  Princípios: preto **quente** (`#0B0A0A`, não azulado, para casar com o
  dourado); **dourado é detalhe, nunca superfície grande** — hairline,
  ícone ativo, preço, CTA; e vidro escuro vira uma superfície *mais clara*
  que o fundo (elevação), porque num tema escuro o contraste claro/escuro
  do Pérola deixaria de separar card de fundo.
- **Pérola** — o visual claro original: fundo areia, vinho e dourado. Os
  níveis de texto foram escurecidos em 26/08/2026 depois de medição no
  pixel: `--ink-45` dava 2,7:1, abaixo do mínimo de 4,5:1 da WCAG. Os nomes
  `-70`/`-45` são o **papel** na hierarquia, não a opacidade literal.

Como funciona: o `ThemeProvider` grava `data-theme` no `<html>` e atualiza
a `<meta name="theme-color">` (a faixa da barra de status no Android/no
atalho do iOS — sem isso o tema escuro fica com uma tira clara no topo).
Um `<script>` curto no `index.html` aplica o tema salvo **antes** do React
montar; sem ele, abrir o app no tema alternativo pisca o padrão por um
quadro. O tema padrão não precisa dele: mora no `:root` e pinta sem JS.
Esse script é o único ponto do projeto que lê `localStorage` fora de
`src/lib/db/prefs.ts` — exceção documentada lá mesmo, com a chave e o
formato espelhados.

**Para adicionar um terceiro tema:** copie o bloco `[data-theme='perola']`
em `tokens.css` (o `:root` é o tema padrão, não um modelo), troque os valores, e acrescente a entrada em `THEMES`
(`ThemeContext.tsx`) com `label`, `hint` e `hint`; a lista em
Configurações e a amostra saem sozinhas dali. Declare **todos**
os tokens nos dois blocos — um token declarado só num tema quebra o outro
em silêncio. Amostra do seletor: adicione `--preview-<nome>` em `:root`
(essas ficam fora dos blocos de tema porque descrevem o tema, então
precisam ser iguais independente de qual está ativo).

### 1.4 Placeholder de imagem — dois caminhos, os dois pelo tema

Enquanto não há foto real (regra 5 da seção 10), "imagem" é gradiente. Ele
vem de dois lugares e **os dois precisam responder ao tema**:

- do **CSS**: `--ph-grad` / `--ph-grad-media` (card, tile, avatar);
- do **conteúdo**: `post.mediaGradient` e `event.recapMedia[].url` em
  `src/data/seed.ts` (e o espelho em `supabase/seed.sql`), que são strings
  de gradiente gravadas no dado.

Por isso existe a escala `--ph-1` … `--ph-5`: **o conteúdo referencia essa
escala, nunca uma cor de marca.** Um `linear-gradient(..., var(--gold-soft),
var(--blush))` gravado no dado ignora o tema e acende um retângulo claro no
meio de uma tela preta — foi exatamente o bug encontrado ao construir o
Ônix. Ao criar conteúdo novo com gradiente, use `var(--ph-N)`.

`--ph-border` é o contorno do tile quando ele fica direto sobre o fundo da
tela (grades de Eventos/Palestrantes): transparente no Pérola, hairline
clara no Ônix — sem ele o tile escuro some no fundo escuro. Desenhado com
`outline` + `outline-offset: -1px`, não `border`, para não mexer na caixa
do elemento no tema em que é transparente.

### 1.5 Tipografia: conteúdo escala, cromo não

**Nenhum `font-size` em px, em lugar nenhum.** Toda a escala vive em
`tokens.css` como `--fs-*`, em `rem`, e `rem` acompanha o tamanho de fonte
que a usuária escolheu no navegador/sistema. Com `px`, esse ajuste é
ignorado: quem aumentou a letra no celular via o mesmo texto miúdo
(medido em 26/08/2026: navegador em 24px, app renderizando 13,5px — 0% do
aumento aplicado).

| Token | Tamanho | Papel |
|---|---|---|
| `--fs-3xs` | 12px | micro-etiqueta: pílula de status, chip sobre imagem |
| `--fs-2xs` | 13px | rótulo auxiliar, eyebrow, meta de evento |
| `--fs-xs` | 14px | texto secundário, item de lista de plano |
| `--fs-sm` | 15px | texto corrido secundário (bio, descrição) |
| `--fs-md` | 16px | **texto corrido principal** (legenda do post) |
| `--fs-lg` | 18px | nome em card, citação |
| `--fs-xl` | 20px | título de card |
| `--fs-2xl` | 22px | h3 de destaque, valor de patrocínio |
| `--fs-3xl` | 24–28px | h2 de seção (`clamp`) |
| `--fs-price` | 32px | preço do plano |

**Piso de 12px.** Antes o app tinha texto de 9,5px. A calibragem é público
de 35+ empreendedoras acostumadas ao Instagram: a régua é ficar **um
degrau acima** do Instagram (cuja legenda tem ~14px), não replicar a
densidade dele.

**A exceção: `--fs-chrome-*`.** Controles que vivem em espaço *fixo* — o
rótulo da tab bar (5 colunas em 375px) e os botões do cabeçalho (uma linha
só) — não podem escalar livremente: em fonte grande o texto cortaria ou
empurraria o vizinho para fora da tela (medido). Esses usam
`--fs-chrome-sm/md/lg`, que são `clamp` e param de crescer antes de
quebrar. **Conteúdo nunca usa token de cromo, e cromo nunca usa token de
conteúdo.**

Caixa que contém texto (ex: `min-height` de `textarea`) usa `em`, não px —
senão ela mostra menos linhas conforme a fonte cresce.

### 1.6 Raios e espaçamento

| Token | Valor | Uso |
|---|---|---|
| `--r-xl` | `28px` | pop-ups (`.modal-sheet`), profile card |
| `--r-lg` | `22px` | `.glass` genérico, cabeçalho |
| `--r-md` | `14px` | cards de conteúdo, botões de formulário, badges |

### 1.7 Safe area

`--safe-t` / `--safe-b` = `env(safe-area-inset-top/bottom, 0px)`. Todo
elemento fixo/flutuante que toca a borda de cima ou de baixo da tela
(header, tab bar, pop-ups) precisa somar isso ao padding — sem isso a UI
invade a ilha dinâmica ou a barra de gestos do iPhone.

### 1.8 Famílias tipográficas

As quatro fontes são as do Manual de Marca, seção 04. Duas viram token de
uso livre, uma é exclusiva da assinatura e uma não está no código:

| Fonte | Token | Papel (definido pelo manual) |
|---|---|---|
| **Cormorant SC** | `--font-brand` | **só** o "TRÍADE" da assinatura, caixa alta e espaçamento amplo. Não é fonte de título — usar em `h2` descaracteriza a marca. |
| **Playfair Display** | `--font-display` / `--font-script` | títulos, destaques, frases de impacto, citações. O manual lista "usar sempre Playfair Display" entre as regras fixas. O itálico cobre o papel expressivo (nomes das idealizadoras). |
| **Inter** | `--font-ui` | textos informativos, datas, horários, locais — e o padrão do `body`. |
| **Slight** | *(nenhum)* | o "conecta" da assinatura. **Não está no CSS de propósito** — ver abaixo. |

Cormorant SC, Playfair Display e Inter são carregadas por `<link>` do
Google Fonts no `index.html`. A Fraunces e a Instrument Serif saíram: eram
escolha nossa, de antes do manual existir.

**Por que a Slight não entra como `font-family`.** Ela é comercial (Up Up
Creative). As licenças são separadas por uso: a Desktop (~US$32) cobre
"logo design" e "creation of images for websites" — ou seja, cobre a logo
como **desenho**; incorporar a fonte num site exige a licença Webfont
(~US$27), que é outra compra. Os sites que a distribuem "de graça" liberam
só uso pessoal, o que não cobre a Tríade. Some-se a isso que o manual lista
"não trocar tipografia" como uso incorreto da logo: a saída certa não é
achar uma parecida, é a assinatura ser o arquivo oficial da marca.

**Como o "conecta" é feito, então.** Ele é **desenho**: o traço original,
recortado da logomarca do manual a 400 dpi e guardado como máscara alfa em
`public/marca/conecta.png`. O CSS aplica `mask-image` com
`background-color: currentColor`, então ele **acompanha o tema** — dourado
no Ônix, burgundy no Pérola — sem existirem duas imagens. Na landing a
mesma máscara vai embutida em `data:` URI, porque aquele arquivo é
autocontido.

O texto "conecta" continua no DOM, dentro de um `@supports (mask-image)`:
onde `mask` não existe, sobra o texto em Playfair itálico. **Não troque a
máscara por uma fonte script "parecida"** — "não trocar tipografia" está na
lista de usos incorretos da logo.

O par `.brand .name` + `.brand .tag` vive dentro de `.brand-lockup`, que
empilha as duas palavras como o lockup do manual. O empilhamento é
explícito (flex column), não quebra de linha: já aconteceu de funcionar por
acidente, e acidente não sobrevive ao próximo ajuste de largura.

---

## 2. Vidro ("Liquid Glass")

| Classe | `backdrop-filter`? | Uso |
|---|---|---|
| `.glass` | sim, `blur(20px) saturate(160%)` | cards claros no feed/listas (`.post`, `.ev-card`) |
| `.glass-strong` | **não** | superfícies claras opacas (segmented control, toast, kebab menu) |
| `.glass-dark` | sim, `blur(24px) saturate(160%)` | **todo pop-up**, tab bar, plano em destaque, citação |

`.sheen` é a faixa diagonal de luz sobre o vidro (opcional, decorativa,
`position:absolute; inset:0;` dentro de um `.glass`).

As três superfícies existem nos dois temas e trocam de valor junto com
eles (seção 1.2). `.glass-dark` é escuro em **qualquer** tema — no Pérola
por contraste com o fundo claro, no Ônix como superfície elevada (mais
clara que o preto do fundo, com hairline dourada). É por isso que texto
sobre ela usa `--on-dark`, e não `--ink`.

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
| `EventRecapModal.tsx` | Retrospectiva de uma edição já realizada | texto + galeria de fotos (`.recap-photo`, fundo gradiente/URL) e vídeos (`.recap-video`, iframe) — sem passo, é uma tela só |
| `EditSheet.tsx` | Formulário genérico de criar/editar | usado por `EventEditSheet`, `SpeakerEditSheet`, `PostEditSheet` |
| `SettingsSheet.tsx` | Configurações do app | lista agrupada estilo iOS |
| `AccountSheet.tsx` | Conta da usuária | deslogada: entrar/cadastrar (alterna, com botão "Continuar com o Google") → cadastro pode levar a "confira seu e-mail"; logada: avatar/nome/e-mail + "Editar perfil" + sair |
| `ProfileEditSheet.tsx` | Editar nome/bio/Instagram/negócio | usa `EditSheet` por dentro |

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

**Variante com amostra e subtítulo** (usada por Aparência → tema): a linha
vira `.ios-row-main` (amostra + `.ios-row-text` com `.t` título e `.s`
subtítulo) e o checkmark segue à direita. A amostra é
`.theme-swatch[data-theme-preview="<tema>"]`: uma **mini-tela do app**
(fundo + card + pílula de ação), não um disco de cores — quem escolhe quer
reconhecer o app, não decodificar uma paleta. Alimentada por
`--preview-<tema>-bg/-card/-ink/-accent` (ver 1.3); o desenho em si é
único e serve para qualquer tema novo. Toda `.ios-row` que representa escolha leva
`aria-pressed` — o checkmark sozinho não conta para leitor de tela.

Configurações hoje tem duas seções: **Aparência** (tema) e **Navegação**
(estilo da tab bar).

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
`chevronLeft`, `close`, `users`, `whatsapp`, `edit`, `plus`, `settings`,
`user`, `google`. `google` é um caso à parte: 4 `<path>` com cor própria
fixa (as 4 cores oficiais da marca), porque o logo do Google **precisa**
ser colorido para ser reconhecível — segue o mesmo princípio do `whatsapp`,
só que com 4 cores fixas em vez de uma variável em `tokens.css` (usadas só
ali dentro, não fazia sentido virar token reaproveitável).

---

## 6. Navegação

### 6.1 Header (`TopBar.tsx`) — logo + CTA de venda sempre visível + config

O cabeçalho é **borda a borda, sem cantos arredondados** (`.app-top` zera
o `border-radius` que herda de `.glass`). Com o arredondamento, os quatro
cantos vazavam o fundo da tela — pouco perceptível no tema claro, óbvio no
escuro, e nenhum app nativo faz isso com a barra superior.

Logo (volta pro Início) + `.top-actions` com dois elementos:

1. **`.btn-cta-member`** — pílula "Quero ser membro!" (gradiente
   `--gold`→`--wine`, a única cor "chamativa de propósito" no cabeçalho),
   sempre visível em toda tela do app, leva direto para `/planos`. Decisão
   de 23/08/2026: **"Planos" saiu da tab bar e virou este CTA** — a lógica é
   que uma aba você só vê se lembrar de visitar; um CTA permanente no
   cabeçalho aparece pra usuária o tempo todo, o que vale mais numa
   estratégia de vendas do que ser "só mais uma opção" entre 5 abas iguais.
   **Responsivo por necessidade real, não estética.** O cabeçalho carrega
   marca + CTA de venda + configurações na mesma linha, e isso não cabe em
   celular sem uma ordem de sacrifício explícita, medida em 360/375/390/430px:
   1. **≤430px**: o CTA troca `"Quero ser membro!"` por `"Seja membro!"`.
   2. **≤389px**: a marca solta a assinatura `"conecta"` (o símbolo e o
      nome seguem identificando; "conecta" continua por extenso na tela
      Sobre).
   3. **Nunca**: o espaço entre o CTA e a engrenagem. São 12px, e é o que
      evita abrir Configurações querendo ver os Planos.

   Se mudar o texto do CTA ou o tamanho de qualquer controle do cabeçalho,
   **meça de novo nas quatro larguras** — não assuma que cabe. A engrenagem
   é um caso à parte: o círculo tem 38px para não pesar, e a área de toque
   chega a 44px por um `::after` invisível.
2. **`.icon-btn`** de configurações (engrenagem), único ícone que sobrou
   aqui. Busca e notificações saíram do cabeçalho (eram só placeholders
   "em breve", sem função) e a conta virou o último item da tab bar (6.2)
   — o cabeçalho de 4 ícones + CTA não caberia em 360px.

Um pop-up aberto a partir daqui **precisa** de `ModalOverlay` (ver 4.1) por
causa do `backdrop-filter` do próprio header.

### 6.2 Tab bar (`TabBar.tsx`) — dois estilos, escolha do usuário; último item é sempre Perfil

A tab bar tem duas aparências, trocáveis em **Configurações → Navegação**
(`TabBarStyleContext`, persistida no aparelho):

- **"Padrão"** — fixa, borda a borda, com o item central (Eventos) em
  badge circular destacado. O estilo original do app.
- **"Padrão 2"** — pílula flutuante e compacta, estilo Uber
  (`.tab-pill`, todos os itens uniformes, o item ativo ganha um fundo
  translúcido em vez do badge circular).

**"Padrão 2" é o padrão desde 26/08/2026.**

**Todo item tem rótulo de texto embaixo do ícone** (desde 26/08/2026).
Antes eram cinco ícones mudos: "coração = Sobre" e "microfone =
Palestrantes" não são deduzíveis e contradizem o que o público já aprendeu
no Instagram, onde coração significa curtidas. O rótulo carrega o
significado; o ícone só ajuda a reencontrar depois. O antigo ponto
indicador saiu — com o nome escrito ele virava um terceiro elemento
empilhado sem informar nada; o estado ativo é cor + peso.

A aba de palestrantes se chama **"Palestras"**, não "Palestrantes": a
pílula dá ~64px por item em 375px e o nome completo virava reticências
(medido). Rótulo de navegação mais curto que o título da tela é normal em
app — a tela continua "Palestrantes". O texto visível e o `aria-label` têm
que ser **o mesmo**: um nome acessível diferente do texto na tela quebra
comando de voz e a regra 2.5.3 da WCAG.

Em ambos os estilos, os 5 itens são **Início, Sobre, Eventos, Palestras,
Perfil** — nessa ordem, sempre 5 (o limite de espaço em telas de 360px
continua valendo). **"Perfil" não é uma rota** — é um `<button>` (não
`NavLink`) que chama `useAuth().openAccount()`, mesmo padrão
Instagram/TikTok de avatar como último item da tab bar. Mostra a foto da
usuária (`profile.avatar_url`, `.tab-avatar`, circular) quando logada, ou o
ícone `user` genérico quando não. Não recebe `.active` (não é uma tela
persistente, é um pop-up transitório).

**Como cada estilo ocupa espaço** (regra revista em 25/08/2026 — antes o
`<nav>` reservava sempre a mesma altura em fluxo, nos dois estilos):

- **"Padrão"**: o `<nav>` é item de flex normal e reserva sua altura. O
  conteúdo termina acima dele; nada passa por baixo.
- **"Padrão 2"**: a pílula **flutua sobre o conteúdo**. `.app` ganha o
  modificador `.app-tabs-floating` (posto pelo `AppShell` a partir do
  `TabBarStyleContext`), o `<nav>` sai do fluxo (`position: absolute`) e a
  `.app-main` recebe de volta, em `padding-bottom`, a altura que ele
  ocupava — a régua dos dois lados é o token `--tabbar-float-h`.
  A invariante antiga (nav sempre em fluxo) foi trocada de propósito: uma
  barra "flutuante" que desenha uma faixa opaca embaixo do conteúdo não
  está flutuando, e o vidro não tem o que desfocar. O `<nav>` fica com
  `pointer-events: none` e só a `.tab-pill` volta a receber toque, senão a
  faixa transparente engoliria o toque no conteúdo atrás dela.
  A pílula usa `--tabbar-float-bg`, mais translúcido que o `--glass-dark`
  dos pop-ups: aqui o objetivo é deixar ver o que passa por baixo; lá, ler.

**Ao adicionar um 3º estilo**, decida explicitamente em qual dos dois
regimes ele entra e, se for flutuante, reaproveite `.app-tabs-floating` e
`--tabbar-float-h` em vez de criar outro cálculo de espaço.

Um efeito colateral aceito do estilo flutuante: o conteúdo rolando atrás
de um `backdrop-filter` obriga o navegador a recalcular o desfoque durante
a rolagem (seção 9). É inerente ao efeito pedido — o que a seção 9 proíbe
é animar `scale` nesses elementos e deixar animação de fundo rodando sob
pop-up aberto, e nenhum dos dois acontece aqui.

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
| `panelfade` | `.panel` | troca de aba: fade curto (0,2s) da tela inteira |
| `panelin` | `.panel > *` | **cascata** dos filhos do painel: `translateY(10px)` + opacidade, `backwards`, atraso de 0,03s a 0,22s por `:nth-child` |
| `heartpop` | `.heart-burst` | coração do duplo toque no feed |
| `float1/2/3` | `.mesh span` | manchas de fundo, loops de 20–30s — **pausam** enquanto um pop-up está aberto (seção 9) |

### Feedback de toque

Todo elemento interativo (botão, item de kebab, linha de `.ios-row`, campo
de formulário, **aba da tab bar**) tem uma transição curta (`0.12–0.18s`) e
um estado `:active` (`scale(0.86–0.98)` ou mudança sutil de fundo) — nunca
depender só do estado `:hover`/`:focus` padrão do navegador, que não existe
em touch.

**O realce de toque do navegador está desligado** (`base.css`:
`-webkit-tap-highlight-color: transparent` no `html`). Ele pintava um
retângulo azul translúcido atrás de qualquer coisa tocada — quadrado, fora
da paleta, e visível por cima de cantos arredondados e vidro. Consequência
direta: **um elemento interativo sem `:active` próprio fica sem nenhum
retorno ao toque.** Ao criar qualquer coisa clicável, o `:active` deixou de
ser refinamento e passou a ser obrigatório.

Em troca, `:focus-visible` ganhou um anel de 2px na cor `--accent`, também
global — e `:focus` é zerado antes dele. Isso não é redundância:
`:focus-visible` sozinho deveria bastar (o navegador não o dispara em
toque), mas Samsung Internet e várias WebViews do Android deixam o foco no
botão depois do toque e pintam **o anel azul padrão** em volta. Zerar o
`:focus` e devolver só no `:focus-visible` garante um anel só, na cor do
tema, e só para teclado. Pelo mesmo motivo o
`-webkit-tap-highlight-color: transparent` é repetido em `*`: no `html`
ele deveria herdar, e nesses navegadores não herda. Ele só aparece para quem navega por teclado (o navegador não o
dispara em toque), então desligar o realce não custou acessibilidade. Não
declare `border-radius` junto do anel: ele já acompanha o raio do próprio
elemento, e um valor fixo deforma botões redondos.

### Revelação de imagem

Toda foto vinda da rede entra com `.foto-fade`, e o `onLoad` acrescenta
`.carregou`. Sem isso a imagem estala na tela e o olho lê "carregou agora"
em vez de "estava ali" — é o momento mais barato de qualquer feed. O
gradiente de placeholder fica atrás durante a revelação, então nunca há um
buraco branco. Hoje em `.post-foto` e na capa da grade de edições.

### Cabeçalho que reage à rolagem

Parado no topo, `.app-top` não tem linha nem sombra — a tela lê como
inteira. Quando `.app-main` passa de 4px de rolagem, o `App.tsx` põe
`.rolando` no `.app`, e o cabeçalho ganha `--hairline` e uma sombra curta.
Só **cor e sombra** mudam: altura ou padding causariam reflow a cada
rolagem. A zona morta de 4px existe porque o quique do scroll do iOS
ligaria e desligaria a sombra com o dedo já fora da tela.

### Acessibilidade de movimento

`base.css` já zera **toda** duração de animação/transição — **e o
`animation-delay`** — sob `prefers-reduced-motion: reduce`, globalmente.
O atraso não estava na guarda até 02/09/2026, e isso importa: um item de
cascata com `animation-fill-mode: backwards` fica **invisível** durante o
delay, então zerar só a duração deixaria a tela com buracos para quem pede
menos movimento. Uma animação nova não
precisa (e não deve) reimplementar essa guarda — só não entre em conflito
com ela (ex: não faça a lógica do componente depender de "quando a
animação termina" via JS sem checar `matchMedia`, já que ela pode terminar
instantaneamente).

---

### Faixa de ano (`.ano-bloco` / `.ano-cabeca`)

Lista longa de itens datados se agrupa por ano, com uma faixa: o ano em
`--font-display`, uma régua fina ocupando o vão, e a contagem à direita
("3 edições"). É o que transforma uma parede de quadradinhos em linha do
tempo. Usada na retrospectiva de Eventos; vale para qualquer grade que
passe de ~6 itens datados.

### Dia com evento no calendário

Um ponto de 4px sob o número não compete com nada numa grade de 7 colunas
— quem abre o calendário para achar "quando é o próximo" tem que caçar. O
dia com encontro é um **quadro de ~45px**, nesta ordem de preferência:

1. **com foto da edição** — a capa preenche a célula (`object-position:
   50% 25%`, que é onde ficam os rostos num retrato), com véu escuro e
   `text-shadow` no número. O véu não é decoração: o acervo tem edição em
   parede clara e edição em salão escuro, e sem ele um único valor de cor
   reprova numa das duas;
2. **por vir, sem foto** — dourado cheio (`--accent`), texto em
   `--btn-primary-fg`;
3. **realizada, sem foto** — `--fill-weak`, que ainda lê como "tem coisa
   aqui" sem roubar atenção.

Evento de vários dias marca **todos** os dias do intervalo (`date` até
`endDate`) e os dias viram **um bloco só**: `margin` negativa fecha o vão
da grade e os cantos internos são zerados (`.junta-esq` / `.junta-dir`).
Dois quadrados separados leem como dois eventos. A emenda só vale dentro
da mesma semana — colar um sábado no domingo da linha de baixo desenharia
uma ponte atravessando a grade.

**Cuidado de especificidade**: `button.cal-cell.has-event` define o raio;
uma regra `.cal-cell.junta-*` perde para ela e os cantos não somem. As
regras de emenda precisam do `button` na frente.

**Forma e moldura.** O raio é assimétrico — `18px 5px 18px 5px`, dois
cantos abertos e dois fechados. Isso dá direção ao quadro, conversa com a
seta tripla da marca e o separa de qualquer quadradinho de calendário
padrão. O par emendado herda o mesmo desenho (o da esquerda fica com os
cantos da esquerda, o da direita com os da direita), então **a silhueta de
um dia e a de dois dias é a mesma** — só muda a largura.

São duas camadas, e a divisão de trabalho é o ponto:

- `::after` — a moldura, 2px, **fixa**. Uma borda que pisca some metade do
  tempo, e no vale da animação o dia deixaria de estar marcado;
- `::before` — o halo, 1,5px, 5px para fora, pulsando em opacidade (2,8s).
  Mais fino que a moldura de propósito: duas linhas do mesmo peso leriam
  como borda dupla.

Só opacidade porque a célula vive dentro do `.cal`, que tem
`backdrop-filter` — animar tamanho ali é o bug de performance da seção 9.
No par emendado o halo precisa **parar na emenda** (`right: 0` /
`left: 0`): com o `inset` negativo de cada lado, os dois halos se
sobrepõem e o dourado soma, dando um claro no meio do topo e da base.

## 8. Componentes de UI (mapa rápido)

| Classe / Componente | O que é |
|---|---|
| `.post` + `<PostCard>` | card de feed: avatar, imagem, ações, legenda, kebab opcional |
| ~~`.stories` + `<Stories>`~~ | **fora de uso desde 26/08/2026.** Parecia stories do Instagram mas entregava navegação duplicada (4 dos 5 atalhos repetiam destinos da tab bar, com nomes diferentes; o 5º não levava a lugar nenhum). Volta no Módulo 11, com foto real |
| `.ev-card` + `<EventCard>` | card de edição do evento, RSVP (alterna confirmar/cancelar) e kebab; `variant="featured"` (tela Eventos, próximo evento) é bem maior — imagem cheia no topo, tema e mais itens de meta |
| `.plan-card` + `<PlanCard>` | card de plano; `featured` usa vidro escuro |
| `.pal-grid` / `.pal-cell` / `.pal-add` | grade 3 colunas de palestrantes + célula de adicionar |
| `.event-grid` / `.event-cell` | mesma ideia da grade de palestrantes, para as edições anteriores (tela Eventos) — célula quadrada com data curta + palestrante, abre `EventRecapModal` |
| `<EventCalendar>` (`.cal` / `.cal-grid` / `.cal-cell`) | mês corrente com marcador (`.dot`) nos dias com evento; só dias com evento são `<button>`, o resto é `<span>` — não interativo. Superfície `.glass-strong` (sem blur) de propósito, pra poder usar `scale` no `:active` dos dias sem entrar na regra de `backdrop-filter` (seção 9) |
| `.ev-search` | busca com ícone inline, escopada a uma tela (ex: buscar edição anterior) — não é a busca global, que saiu do cabeçalho (seção 6.1) |
| `.segmented` | alternância dentro de uma tela — hoje é o controle Lista/Calendário da tela Eventos (era o filtro Todos/Em breve/Realizados até o redesenho de 23/08/2026) |
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
| `.tab-label` | rótulo de texto do item da tab bar (seção 6.2) |
| `.ios-row-main` / `.ios-row-text` / `.theme-swatch` | linha de configuração com amostra visual + subtítulo (seção 4.4) |
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
9. **Nunca escreva `font-size` em px.** Use um token `--fs-*` (seção 1.5).
   Um px aqui apaga o ajuste de fonte que a usuária fez no celular.
10. Alvo de toque abaixo de ~38px se corrige com **padding + margem
   negativa** (é o que `.act-btn` faz), não empurrando o layout: a área
   cresce e o desenho fica onde estava.
11. **Toda cor nova tem que existir nos dois temas.** Na prática: declare o
   token em `:root` **e** em `[data-theme='onyx']`. Nunca escreva um
   seletor de tema no CSS de um componente (seção 1.1), e nunca grave cor
   de marca dentro de conteúdo — gradiente em `seed.ts` usa a escala
   `--ph-N` (seção 1.4).
12. Ao mexer em qualquer coisa visual, confira nos **dois temas**. A
   armadilha típica é um valor que só funciona sobre fundo claro
   (`--ink-70` sobre vidro escuro) ou o inverso.

---

## 11. Manter este documento vivo

Sempre que uma sessão de trabalho mudar algo coberto aqui — um token novo,
um componente de pop-up novo, uma regra de animação, um ícone, um padrão
de navegação — atualize a seção correspondente **na mesma sessão**, junto
com `docs/CHANGELOG.md` e `docs/ESTADO-DO-PROJETO.md` (protocolo na seção
9 daquele arquivo). Este arquivo não deve ficar defasado da UI real do app.
