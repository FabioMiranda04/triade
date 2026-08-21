# Arquitetura

## Por que Vite + React + TypeScript

O app saiu de um HTML único dentro do Bubble.io para código versionado. As
escolhas foram feitas pensando no roadmap (login, feed real, pagamento,
painel admin), não só na tela de hoje:

- **Vite** — build instantâneo, hot reload, zero configuração, deploy nativo
  na Vercel.
- **React** — os próximos módulos são estado compartilhado (usuária logada,
  feed, carrinho de assinatura). Fazer isso em JS puro vira manutenção cara.
- **TypeScript strict** — o app vai ganhar backend; tipar o domínio agora
  evita bug silencioso quando o dado vier da rede.
- **CSS puro com variáveis** — o visual "Liquid Glass" já estava pronto e
  bom. Reescrever em Tailwind seria risco sem ganho. Os valores foram
  migrados **idênticos** do protótipo.

## Camadas

```
UI (screens/ + components/)
        │  só conhece `db`, tipado
        ▼
db  (lib/db/index.ts)          ← única fronteira de persistência
        │
        ├── supabaseProvider   → Postgres + RLS   (conteúdo)
        └── localProvider      → localStorage     (fallback)
                                 localStorage     (engajamento, sempre)
```

A regra que sustenta tudo: **nenhum componente conhece `localStorage` nem o
cliente do Supabase**. Ambos os providers implementam a mesma interface
`DataProvider` (`lib/db/types.ts`).

### Escolha do provider

Automática, em `lib/db/index.ts`: se `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` existem, usa Supabase; senão, local. Consequência
importante — **quem clona o repositório roda `npm run dev` e vê o app
completo, sem configurar nada**. Isso vale para o CI também, que faz build sem
credenciais de propósito.

### Leitura assíncrona, escrita síncrona

Conteúdo (`getEvents`, `getSpeakers`, `getPlans`) retorna `Promise`, **mesmo
no provider local**. Foi decisão deliberada: se o local fosse síncrono, ligar
o Supabase exigiria reescrever todas as telas. As telas usam `useAsyncData` e
mostram `<Skeleton>` enquanto carrega.

Engajamento (`toggleLike`, `hasRsvp`, `choosePlan`…) continua **síncrono**,
porque é sempre localStorage. Quando o Módulo 2 mover isso para o servidor,
essas assinaturas vão precisar virar assíncronas — é a próxima dívida técnica
conhecida, e está registrada aqui de propósito.

### Divisão de responsabilidade dos dados

| Dado | Origem | Por quê |
|---|---|---|
| Eventos, palestrantes, planos | Supabase | conteúdo público, editável sem deploy |
| Curtidas, salvos, RSVP, plano | localStorage | sem login não há usuária a quem atribuir |

Namespace no localStorage: `triade_*` — o mesmo do protótipo, então quem
testou o HTML antigo mantém curtidas e RSVP.

### Degradação em vez de tela branca

Se a consulta ao Supabase falhar (sem rede, RLS mal configurado, tabela
vazia), o provider cai no conteúdo de `data/seed.ts` e avisa no console com
prefixo `[supabase]`. A usuária vê o app funcionando com conteúdo levemente
desatualizado, em vez de um erro. O diagnóstico está em `SUPABASE.md`.

## App shell

`App.tsx` monta três faixas fixas, em coluna:

1. `TopBar` — header de vidro (logo, busca, sino)
2. `main.app-main` — **a única área que rola**
3. `TabBar` — barra inferior de vidro escuro, borda a borda

O `body` tem `overflow: hidden` e `.app` é `position: fixed; inset: 0`.
É isso que dá a sensação de app nativo em vez de página web. Ao trocar de
rota, o `useEffect` em `App.tsx` devolve o scroll ao topo.

## Rotas

Uma rota por aba: `/`, `/sobre`, `/eventos`, `/palestrantes`, `/planos`.
Qualquer outra rota redireciona para `/`.

Rotas reais (em vez de estado interno) dão deep link, botão voltar do
Android funcionando e URLs compartilháveis. Custo: a hospedagem precisa
reescrever tudo para `index.html` — feito no `vercel.json`.

## Estado

Estado local por tela, com `useState` + `useAsyncData`. Não há store global
porque ainda não há dado global de verdade. Quando entrar autenticação
(Módulo 2), a usuária logada deve virar um Context em `src/context/`
alimentado por `supabase.auth.onAuthStateChange` — não espalhe prop drilling.

## Estilos

Quatro arquivos, importados em ordem por `styles/index.css`:

| Arquivo | Contém |
|---|---|
| `tokens.css` | variáveis de cor, raio, safe area, fontes |
| `base.css` | reset, tipografia base, `.eyebrow`, `.icon` |
| `layout.css` | mesh, `.glass`, app shell, tab bar |
| `components.css` | feed, stories, eventos, planos, botões, toast |

Sem CSS Modules por enquanto: as classes são poucas, semânticas e vieram do
protótipo. Se um componente novo precisar de estilo isolado, use
`Componente.module.css` ao lado do `.tsx`.

## Ícones

SVG inline em `components/Icon.tsx`, `viewBox="0 0 24 24"`, traço 1.9,
`stroke="currentColor"`. Nenhuma biblioteca de ícones — o peso e a diferença
de estilo não compensam.

## Decisões deliberadamente adiadas

- **Testes**: sem framework de teste ainda. A camada `lib/db/` é o primeiro
  candidato — vale Vitest quando o engajamento for para o servidor.
- **Realtime**: o Supabase oferece subscriptions, mas o conteúdo muda raramente
  (uma edição por mês). Buscar na montagem da tela basta.
- **Cache de rede**: sem React Query. Com três consultas simples e conteúdo
  quase estático, não paga o peso. Reavaliar no Módulo 3, quando houver feed.
- **PWA offline**: existe `manifest.webmanifest` (instalável na tela de
  início), mas sem service worker.
- **i18n**: app é só pt-BR.

## Tamanho do bundle

O `@supabase/supabase-js` responde por boa parte do JS (~119 kB gzip no
total). É aceitável hoje, mas se virar problema de performance em 3G, o
caminho é carregar o `supabaseProvider` com `import()` dinâmico e deixar o
provider local no bundle inicial. Não foi feito agora para não complicar a
seleção de provider antes de haver evidência de que atrapalha.
