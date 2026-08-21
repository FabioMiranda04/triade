# Design System — "Liquid Glass"

Visual inspirado no Liquid Glass da Apple e na linguagem do Instagram, com a
paleta da marca Tríade. Todos os valores vivem em `src/styles/tokens.css`.

## Cores

| Token | Valor | Uso |
|---|---|---|
| `--sand` | `#F4EEE3` | fundo do app |
| `--sand-deep` | `#EAE1D1` | miolo dos stories |
| `--ink` | `#231C1A` | texto principal |
| `--ink-70` / `--ink-45` | opacidades de `--ink` | texto secundário / terciário |
| `--wine` | `#7C2A3D` | destaque, CTA, eyebrow |
| `--wine-deep` | `#511B29` | fim do gradiente do CTA |
| `--gold` | `#C79A55` | acento, item salvo, ponto ativo da tab |
| `--gold-soft` | `#EFDCB8` | gradientes, pill "em breve" |
| `--plum` | `#4A2140` | mancha do fundo |
| `--blush` | `#E7B3A0` | mancha do fundo, gradientes |

## Vidro

| Token | Uso |
|---|---|
| `--glass` | painéis claros (`.glass`) |
| `--glass-strong` | header, botões de vidro, toast (`.glass-strong`) |
| `--glass-dark` | tab bar, plano em destaque, citação (`.glass-dark`) |

`.glass` = `backdrop-filter: blur(20px) saturate(160%)` + borda branca +
sombra baixa + brilho interno no topo. `.sheen` é a faixa diagonal de luz
sobre o vidro (opcional, decorativa).

## Tipografia

| Fonte | Papel |
|---|---|
| **Fraunces** (`--font-display`) | títulos, preços, números de estatística |
| **Instrument Serif** itálico (`--font-script`) | assinatura da marca, nomes das idealizadoras |
| **Inter** (`--font-ui`) | todo o resto |

Carregadas por `<link>` do Google Fonts no `index.html`.

## Marca

As **três setas** do logo são o elemento de assinatura, reaproveitadas como
badge circular de vidro em vários pontos. Componente: `<Mark size={30} />`
(`src/components/Brand.tsx`). O tamanho alimenta a variável CSS `--m`.

## Componentes de UI

| Classe / Componente | O que é |
|---|---|
| `.post` + `<PostCard>` | card de feed: avatar, imagem, ações, legenda |
| `.stories` + `<Stories>` | fileira circular no topo do Início |
| `.ev-card` + `<EventCard>` | card de edição do evento com RSVP |
| `.plan-card` + `<PlanCard>` | card de plano; `featured` usa vidro escuro |
| `.pal-grid` / `.pal-cell` | grade 3 colunas de palestrantes |
| `.segmented` | filtro de eventos (Todos / Em breve / Realizados) |
| `.sec-head` + `<SectionHead>` | eyebrow + título + descrição |
| `.btn` `.btn-primary` `.btn-glass` `.full` | botões |
| `.toast` + `useToast()` | mensagem curta no rodapé (~2,2s) |
| `.mesh` + `<MeshBackground>` | manchas de cor desfocadas do fundo |

## Gestos e microinterações

- **Duplo toque na imagem do post** → curte e dispara o coração (`heartpop`).
- **`:active` nos botões** → `scale(0.85)` nas ações do feed,
  `scale(0.97)` nos botões primários.
- **Troca de aba** → painel entra com `panelin` (fade + 6px para cima).
- **Manchas do fundo** flutuam em loops de 20–30s.
- Tudo respeita `prefers-reduced-motion: reduce`.

## Regras

1. Sem hex solto em componente — use as variáveis.
2. Alvo de toque mínimo confortável: ~38–44px.
3. Imagens hoje são gradientes da marca. Ao entrar foto real, troque o
   `background` de `.post-media` / `.ev-card .ph` / `.pal-cell` por `<img>`
   mantendo o mesmo `aspect-ratio`.
4. A tab bar suporta bem até 5 itens em telas de 360px.
