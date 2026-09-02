# GUIA DO REPOSITÓRIO — Tríade Conecta

> Este arquivo é a metade **de consulta** do antigo `CLAUDE.md`: mapa de
> pastas, receitas de "como adicionar coisas", o que ainda não existe no
> app e o roadmap. Saiu de lá em 02/09/2026 por um motivo medido: o
> `CLAUDE.md` é reenviado ao modelo em **toda** chamada, e estas quatro
> seções somavam ~2.000 das 3.300 palavras dele — 60% do custo fixo, para
> um conteúdo que só é consultado quando alguém vai mexer na parte
> correspondente.
>
> **Nada foi resumido nem reescrito**: as seções abaixo são o texto
> original, palavra por palavra. O `CLAUDE.md` continua com as regras do
> projeto e aponta para cá.
>
> Leia este arquivo quando for: mexer em pasta que não conhece (seção 1),
> acrescentar tela / ícone / cor / campo de dado / pop-up (seção 2),
> confirmar se algo já existe antes de presumir (seção 3), ou entender
> onde o projeto está no plano (seção 4).

---

## 1. Mapa do repositório

```
src/
├── main.tsx              # entrada: React + Router + CSS
├── App.tsx               # app shell (header + conteúdo + tab bar) e rotas
├── screens/              # uma tela por aba — NÃO renomeie sem atualizar TabBar
├── components/           # peças reutilizáveis de UI
│   ├── ModalOverlay.tsx  #   portal + efeitos compartilhados de TODO pop-up
│   ├── EventModal.tsx    #   detalhes do evento + "Quero participar" (WhatsApp)
│   ├── EditSheet.tsx     #   formulário genérico (usado por Event/Speaker/PostEditSheet)
│   ├── SettingsSheet.tsx #   configurações do app (lista estilo iOS)
│   ├── AccountSheet.tsx  #   entrar/cadastrar/Google (ou perfil+sair, se logada)
│   ├── ProfileEditSheet.tsx  # editar nome/bio/Instagram/negócio
│   └── Kebab.tsx         #   menu "..." estilo Instagram
├── context/
│   ├── AuthContext.tsx         # sessão (Supabase Auth) + dono do AccountSheet
│   ├── ThemeContext.tsx        # tema visual (Pérola / Ônix) — data-theme no <html>
│   └── TabBarStyleContext.tsx  # estilo da tab bar (Padrão / Padrão 2), persistido
├── hooks/                # useAsyncData, useEngagement, useDoubleTap, useModalEffects
├── lib/
│   ├── db/               # camada de dados — ÚNICA fronteira de persistência
│   │   ├── index.ts      #   exporta `db` (escolhe o provider)
│   │   ├── types.ts      #   interface DataProvider
│   │   ├── localProvider.ts
│   │   ├── supabaseProvider.ts
│   │   ├── prefs.ts      #   preferências no localStorage
│   │   └── localContent.ts  # overlay local de edição de conteúdo (nunca vai pro Supabase)
│   ├── supabase.ts       # cliente (null se não houver credenciais)
│   ├── whatsapp.ts       # link + mensagem pronta do wa.me
│   └── format.ts         # datas, preços, classes de status (pt-BR)
├── data/seed.ts          # todo o conteúdo mock (textos, eventos, planos...)
├── types/index.ts        # tipos do domínio
├── types/
│   ├── index.ts          # tipos do domínio (camelCase, usados pela UI)
│   └── database.ts       # tipos das tabelas (snake_case, espelha o SQL)
└── styles/
    ├── tokens.css        # variáveis de cor/raio/tipografia — mude AQUI
    ├── base.css          # reset e elementos base
    ├── layout.css        # mesh, vidro, app shell, tab bar (2 estilos)
    └── components.css    # feed, eventos, planos, botões, toast, pop-ups

supabase/
├── schema.sql            # tabelas + RLS + triggers (idempotente) — já rodado no projeto real
└── seed.sql              # conteúdo inicial (idempotente)

landing/                  # página de captação do QR code do outdoor — NÃO é o app
├── convite.html          #   .html autocontido, fora do build (abrir direto no navegador)
└── README.md             #   status, decisões tomadas, ajustes pendentes e link de revisão
```

```
docs/
├── MANUAL-DE-MARCA.md    # a marca oficial transcrita — cores, fontes,
│                         #   logo, regras. FONTE DE VERDADE da camada 1
└── marca/                #   o PDF original do manual (não precisa abrir)
```

`docs/DESIGN-SYSTEM.md` é o manual de UI/UX (tokens, pop-ups, ícones,
animação, navegação) — leia antes de mexer em interface, via skill
`design-systems`. Ele diz **como** as cores viram interface;
`docs/MANUAL-DE-MARCA.md` diz **quais** são as cores, e ganha quando os
dois discordam.

---

### Auditoria de UI (`npm run auditoria`)

`scripts/auditoria.mjs` sobe o `vite preview` sozinho e varre **5 telas x 2
temas x 2 larguras** (360 e 375px) procurando quatro defeitos, todos que já
aconteceram de verdade neste projeto:

| Verificação | O que pega |
|---|---|
| `OVERFLOW` | elemento mais largo que o container (o par de botões estourava o card em 360px por 7px) |
| `TOQUE` | alvo menor que 38px. Campo dentro de `<label>` conta pela área do label — sem essa exceção o campo de busca de Eventos dá falso positivo |
| `CONTRASTE` | WCAG AA medido **no pixel renderizado**: apaga o texto, fotografa, lê o fundo. Calcular sobre os tokens ignora gradiente, `backdrop-filter` e a barra flutuante por cima |
| `CONSOLE` | erro de página ou de console (ignora recurso externo que não carrega) |

Sai com código 1 se achar algo → serve em CI.

**Playwright fica fora do `package.json` de propósito** (regra 7): baixa
~300 MB de navegador, e quem só quer rodar o app não deve pagar isso. O
script detecta a ausência e imprime o que instalar:
`npm i -D playwright pngjs && npx playwright install chromium`. Sem o
`pngjs` o script roda mesmo assim, pulando só o contraste — três
verificações valem mais que nenhuma.

`CHROMIUM_BIN=/caminho/do/chrome` cobre ambiente onde o navegador não está
onde o Playwright espera — é o caso do contêiner remoto do Claude Code.
`AUDIT_ROTAS=/planos AUDIT_TEMAS=onix` estreita a varredura ao investigar
um achado, e `AUDIT_DEBUG=1` imprime cor, pixel lido e razão de cada alvo.

**Armadilha que a própria auditoria caiu, e por isso ela espera antes de
medir:** a cascata de entrada do `.panel` desloca cada peça em
`translateY(10px)`. Medir durante a animação faz o
`getBoundingClientRect` devolver a posição animada enquanto a captura já
saiu do lugar final — 10px de defasagem, e a leitura de contraste cai
FORA do elemento. Isso produziu 9 reprovações inexistentes na primeira
rodada. O script espera o `<Skeleton>` sumir e as animações **finitas**
terminarem (`document.getAnimations()`, filtrando as de `iterations:
Infinity`, que no app nunca acabam: mesh, halo do calendário, selo da
aba). Esperar tempo fixo não resolve — o atraso depende de a página vir
da rede ou do service worker.

## 2. Como adicionar coisas

**Nova tela/aba:** crie `src/screens/NomeDaTela.tsx` exportando default →
adicione a `<Route>` em `App.tsx` → adicione o item em
`src/components/TabBar.tsx` (com um `IconName` válido), antes do "Perfil"
(que fica sempre por último — não é rota, ver `docs/DESIGN-SYSTEM.md`
seção 6.2). A tab bar hoje tem 5 itens; mais que isso aperta em telas de
360px — nem toda tela nova precisa virar aba: "Planos" hoje só é alcançada
pelo CTA "Quero ser membro!" do cabeçalho e por link direto.

**Novo ícone:** acrescente uma chave em `PATHS` no `components/Icon.tsx`,
`viewBox="0 0 24 24"`. Linha fina (padrão, herda `stroke-width` 1.9 do
componente) para a maioria; preenchido (`fill="currentColor" stroke="none"`
no `<path>`) só quando for um glifo de marca reconhecível (ex: WhatsApp).
Detalhes em `docs/DESIGN-SYSTEM.md`, seção 5.

**Novo texto na tela:** nunca escreva `font-size` em px — use um token
`--fs-*` de `tokens.css` (escala em `rem`). Um px ali apaga o ajuste de
fonte que a usuária fez no celular. Controle que vive em espaço fixo (tab
bar, cabeçalho) usa `--fs-chrome-*`. Detalhes: `docs/DESIGN-SYSTEM.md`,
seção 1.5.

**Nova cor / novo tema:** o app tem dois temas — **Ônix** (padrão, fundo
escuro com o dourado da marca, mora no `:root`) e **Pérola** (creme e
burgundy, em `[data-theme='perola']`), escolhidos em Configurações →
Aparência. Toda cor nova vira token **nos dois blocos** de
`src/styles/tokens.css` — nunca um seletor de tema dentro do CSS de um
componente, e nunca cor de marca gravada em conteúdo (gradiente em
`seed.ts` usa a escala `--ph-1..5`). **A camada 1 (`--brand-*`) não se
inventa**: os valores são os do manual (regra 16). Receita completa e como
adicionar um terceiro tema: `docs/DESIGN-SYSTEM.md`, seção 1.

**Novo pop-up:** sempre via `<ModalOverlay onClose={onClose}>` por dentro
— nunca escreva `<div className="modal-overlay">` à mão (quebra
`position: fixed` se o pop-up nascer dentro de um componente com
`backdrop-filter`, como o `TopBar`). Sheet interno é sempre
`glass-dark`, centralizado, cantos totalmente arredondados — não existe
mais variante clara nem bottom-sheet. Detalhes em `docs/DESIGN-SYSTEM.md`,
seção 4.

**Novo campo de dado:** coluna em `supabase/schema.sql` → tipo em
`src/types/database.ts` → tipo do domínio em `src/types/index.ts` → mapeamento
em `supabaseProvider.ts` → valor em `src/data/seed.ts` (para o modo local) →
leitura via `db`. Os cinco passos, sempre — pular um deixa os dois providers
fora de sincronia.

**Nova UI de edição de conteúdo:** esconda atrás de `usePodeEditar()`
(`src/hooks/usePodeEditar.ts`) — `false` = não renderize o controle. Não
escreva outra chamada a `db.podeEditarConteudo()`: o hook já existe e é o
mesmo em todas as telas.

**Nova ação que exige login:** chame `useAuth().requireAuth()` no início do
handler — `true` = pode seguir (já logada, ou app rodando sem Supabase, caso
em que não existe login possível e a ação sempre segue livre); `false` = já
abriu o `AccountSheet` sozinho, só dar `return`. É assim que curtir,
confirmar presença e escolher plano pedem conta hoje (Módulo 2, concluído
em 23/08/2026) — não escreva um gate novo, reuse esse.

**Novo dado de engajamento por usuária** (ex: "salvar evento"): adicione a
tabela em `schema.sql` com RLS por `auth.uid()`, o método em `DataProvider`
(`lib/db/types.ts`), a implementação real em `supabaseProvider.ts` (com
fallback pra `engagement` de `prefs.ts` quando não há sessão) e o wrapper
em `localProvider.ts`. **Atenção**: toda linha de tabela em
`src/types/database.ts` precisa ser `type`, nunca `interface` — uma
`interface` não satisfaz o formato que o `@supabase/supabase-js` espera
para inferir o schema, e a consulta vira `never` silenciosamente (sem erro
na declaração, só no uso). **Pela mesma razão, toda entrada em `Tables`
precisa de `Relationships: []`** — esquecer essa chave derruba o schema
INTEIRO para `never`, e o erro aparece em tabelas que você nem tocou. Detalhes em `docs/ARQUITETURA.md`.

---

## 3. O que ainda NÃO existe (não presuma)

- **Autenticação existe** (Supabase Auth, e-mail/senha com confirmação por
  e-mail, **+ Google já configurado e funcionando** via `signInWithGoogle`
  — `AuthContext`/`AccountSheet`) e um **perfil editável básico**
  (nome/bio/Instagram/negócio, `ProfileEditSheet`; foto só a do Google,
  automática). Sem onboarding, sem recuperação de senha, sem upload de
  foto própria, sem outro login social (Apple, Facebook...).
- **Engajamento (curtir, salvar, RSVP/cancelar, plano escolhido) vai para o
  Supabase só com usuária logada.** Deslogada (ou sem Supabase configurado)
  continua exatamente como antes: localStorage, por navegador, livre.
  **A contagem de curtidas é real** desde 01/09/2026 — vem da função
  `curtidas_do_post()` do `schema.sql`, não de um número no `seed.ts`.
  `post_engagements` é privada por usuária (ninguém lê quem curtiu o quê),
  então contar do cliente é impossível: a função `security definer` devolve
  só o total. Sem Supabase o total é o desta aba, e **zero não aparece** —
  a linha some, como em qualquer feed.
- **Edição de conteúdo tem dois destinos, e quem decide é a permissão.**
  Desde 31/08/2026 existe a tabela `admins` no Supabase (seção 6 do
  `schema.sql`): quem está nela grava **no banco**, e as fotos vão para o
  Storage. Quem não está — o caso normal, e também quem roda sem Supabase —
  continua exatamente como antes: overlay local via `localContent.ts`.
  O formulário **diz qual dos dois está valendo** antes de a pessoa digitar.
  A lista de admins só muda pelo SQL Editor do painel; não há tela para
  isso, e é de propósito (o front usa a chave `anon`, que é pública).
  **Desde 01/09/2026 a UI de edição só existe para admin** — sem permissão
  não há "..." → Editar, nem "Novo evento", nem "Nova palestrante". O gate é
  o hook `usePodeEditar()`; use ele, não uma checagem nova.
  **Módulo 5 fechado em 02/09/2026**: evento, post, palestrante e plano
  gravam de verdade (`db.saveEvent` / `savePost` / `saveSpeaker` /
  `savePlan`). O **plano é o único formulário sem caminho local** — preço
  só faz sentido se valer para todo mundo; corrigir um valor no próprio
  navegador e achar que arrumou é pior do que não poder corrigir. Ele
  também só edita, nunca cria: "novo plano" é decisão de negócio que não
  deveria caber num botão.
- **Fotos reais já existem** nas retrospectivas de edição (Módulo 11,
  26/08/2026): 11 fotos no bucket `media` do Supabase Storage. Desde
  01/09/2026 elas também ilustram os **posts do Início** (`Post.mediaUrl`)
  e as miniaturas da grade de edições. Onde não há foto, o gradiente
  (escala `--ph-1..5`, que responde ao tema) com a marca no meio é
  **template de "sem imagem"**, não desenho pretendido — não trate como
  estado final.
- **Dois temas existem** (Ônix, padrão, e Pérola), escolhidos em
  Configurações → Aparência. Não existe seguir o tema do sistema
  (`prefers-color-scheme`) nem agendar por horário — é escolha manual.
- **Não existe SVG oficial da logomarca no repositório** — e não faz falta
  hoje. A assinatura do cabeçalho está correta: "TRÍADE" em Cormorant SC
  (a fonte real, do Google Fonts) e "conecta" como **máscara alfa** em
  `public/marca/conecta.png`, recortada da logomarca do manual, colorida
  por `currentColor` para acompanhar o tema. Um SVG só seria melhor para
  uso em tamanho grande. **Não troque a máscara por uma fonte script
  "parecida"**: "não trocar tipografia" está na lista de usos incorretos do
  manual. Detalhes em `docs/MANUAL-DE-MARCA.md`, seção 4.
- Sem pagamento. Escolher plano só grava a escolha localmente.
- **Sem tela de administração central** — a edição vive espalhada, no "..."
  de cada item. Isso é decisão, não pendência: um painel separado obrigaria
  a manter duas representações de cada conteúdo. O que ainda não existe é
  gerenciar a lista de **admins** pelo app (só pelo SQL Editor, de
  propósito: o front usa a chave `anon`, que é pública).
- Sem teste unitário no repositório. Existe a **auditoria de UI**
  (`npm run auditoria`, seção 1 acima), que cobre layout, contraste e alvo
  de toque — não cobre lógica.
- **Instalar na tela de início já funciona** (02/09/2026): manifesto com
  ícones PNG (192/512 + maskable), `apple-touch-icon` e um service worker
  escrito à mão em `public/sw.js` — sem plugin, sem dependência nova. Rede
  primeiro na navegação (deploy novo aparece na hora), cache primeiro nos
  assets com hash. **Nada do Supabase passa pelo cache**, de propósito:
  curtida, RSVP e conteúdo precisam do estado real. Medido em rede de
  200ms de latência: 497ms → 292ms na visita repetida. **Notificação de
  evento continua não existindo** — é o que falta do Módulo 7.
  Mudou um arquivo SEM hash (ícone, manifesto, `marca/conecta.png`)? Suba
  o nome do cache em `sw.js` (`triade-v1` → `v2`), senão o cache primeiro
  segura o arquivo velho para sempre.

---

## 4. Roadmap

| Módulo | Escopo | Status |
|---|---|---|
| 1 | Landing / app shell — 5 telas | ✅ migrado para código |
| 1.5 | Supabase para o conteúdo | ✅ camada pronta |
| — | Pop-up de evento + WhatsApp, edição inline local, config/tab bar | ✅ pronto (sessões 6–9) |
| 2 | Autenticação (Supabase Auth) — entrar/cadastrar/sair, Google (configurado e funcionando), perfil editável, engajamento no banco quando logada | ✅ concluído 23/08/2026 |
| 3 | Área de membras logada (feed real, diretório) | ⏳ |
| 4 | Assinaturas e pagamento (já com banco real) | ⏳ |
| 5 | Painel administrativo — trocar o overlay local (`localContent.ts`) por gravação real no Supabase | ✅ concluído 02/09/2026: permissão (`admins` + RLS), upload de foto para o Storage e gravação real de evento, post, palestrante e plano |
| 6 | Migração de dados localStorage → banco | ⏳ |
| 7 | Atalho na tela de início (Android/iOS) + notificações de evento/ingressos | 🔸 instalação pronta 02/09/2026 (manifesto + ícones + service worker); falta a notificação (push com VAPID + tabela de inscrições) |
| 8 | Sobre — mídias e relatos reais (fotos, vídeos, depoimentos) | ⏳ planejado 23/08/2026 |
| 9 | Eventos — calendário de datas + artigo histórico por edição (mídia/vídeo) | ✅ concluído no código 23/08/2026 — pendente rodar `schema.sql`/`seed.sql` no Supabase real |
| 10 | Palestrantes — pop-up completo por palestrante (redes, presenças, cursos, contato) | ⏳ planejado 23/08/2026 |
| 11 | Infraestrutura de mídia real (Supabase Storage) — fotos/vídeos de verdade a partir do export oficial do Instagram | ✅ concluído 26/08/2026 — histórico de edições reconstruído com dados reais, 11 fotos no Storage |
| 12 | Dois temas visuais (Pérola / Ônix) em Configurações → Aparência | ✅ concluído 25/08/2026 |

Detalhamento completo dos módulos 8 a 11 (escopo, campos de dado novos,
componentes a criar, perguntas em aberto) está em
`docs/ESTADO-DO-PROJETO.md`, seção 6. O caminho pra pedir o export do
Instagram (não é scraping, decisão justificada lá) está na seção 7, item 1.
