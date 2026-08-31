# Última sessão interrompida

> Este arquivo só existe pra cobrir um cenário: a conversa com o Claude Code
> acabar (limite de contexto/créditos) **no meio** de uma tarefa, antes de um
> ponto de parada natural. Regra 15 do `CLAUDE.md`. Diferente do
> `CHANGELOG.md`/`ESTADO-DO-PROJETO.md`, que registram trabalho **concluído**
> — este registra trabalho **em andamento**, e deve voltar para "nada
> pendente" assim que for retomado e terminado.

**Status: sessão 19 em andamento (31/08/2026).** A primeira metade fechou e
**já está em produção** (`main` em `4313c77`): alinhamento ao Manual de
Marca, assinatura com a logomarca de verdade, correções de contraste. A
segunda metade é uma fila de pedidos do usuário que chegaram em sequência,
e é o que está aberto.

## Já commitado e publicado (não mexer, só continuar)

- `efca227` — paleta e tipografia oficiais do manual nos dois temas + landing
- `d26638b` — `docs/MANUAL-DE-MARCA.md` (manual transcrito) + regra 16
- `4313c77` — o "conecta" virou máscara alfa (`public/marca/conecta.png`)

## Alterado e AINDA NÃO commitado

Tudo verificado, faltou só juntar com o resto da fila num commit:

- **`.panel` ganhou `padding: 15px 16px 28px`** (antes o topo era 0 e o
  primeiro card encostava no cabeçalho — foi o pedido do usuário).
- **A prop `first` do `SectionHead` foi removida** (era um `margin-top: 14`
  inline em cada tela, resolvendo por fora o que o `.panel` não dava). No
  lugar entrou `.panel > .sec-head:first-child { margin-top: 0 }`, senão o
  respiro do painel somava com os 22px da seção e dava 37px de topo.
  Medido depois: 15px em todas as telas, nos dois temas.
- **Idealizadoras empilhadas** (`.founder-row` virou coluna, com grade de 3
  colunas acima de 560px). Antes era faixa com rolagem lateral e a Cris
  ficava fora da tela em 375px. Medido: sem rolagem, as três visíveis.
- **Ordem alfabética** com `byName()` novo em `src/lib/format.ts`
  (`localeCompare` pt-BR — comparação binária colocaria "Lívia" antes de
  "Lia" por causa do acento). Aplicado em idealizadoras e palestrantes.

## A fila do usuário (o que falta)

Na ordem em que ele pediu. As tarefas 1–3 estão feitas; estas são as abertas:

1. **Aba Eventos com mais destaque** — fundo mais evidente ou uma estrela de
   4 pontas de "novo", com animação recorrente discreta.
   **Restrição:** a pílula tem `backdrop-filter`, então nada de animar
   `scale`/resize nela (regra 14 + `DESIGN-SYSTEM.md` §9) — só
   translate/opacidade, ou animar um filho sem `backdrop-filter`. O ícone
   `sparkle` já existe em `Icon.tsx`. `prefers-reduced-motion` já é global
   no `base.css`, não reimplementar.
2. **Evento em destaque animando na abertura do app** — só na abertura, não
   a cada troca de aba. A ideia combinada: entrada + um `sheen` passando uma
   vez (a classe `.sheen` e o token `--sheen-grad` já existem).
3. **Fotos reais como preview na grade "Edições anteriores"** — hoje as
   células são gradiente, mas cada edição já tem `recapMedia` com fotos no
   bucket `media` (Módulo 11). Usar a primeira foto como miniatura, manter
   as etiquetas de data/palestrante legíveis por cima, e cair no gradiente
   quando a edição não tiver foto.
4. **Rótulo "Palestras" → "Palestrantes" na tab bar.** **Atenção: isso não
   cabe hoje.** Medido: a célula da pílula tem 55px de conteúdo em 375px e
   "Palestrantes" pede ~80px em 12px. Mesmo alargando a pílula ao máximo e
   caindo para 11px, não entra — 5 abas × ~80px passa de 375px. As saídas
   reais são: aceitar duas linhas no rótulo, aceitar a barra fixa (borda a
   borda, que dá ~73px por coluna e ainda assim exige 11px), ou manter a
   abreviação. **Precisa de decisão do usuário** — não escolher sozinho.
   Seja qual for, o texto visível tem que continuar contido no `aria-label`
   (WCAG 2.5.3): hoje o `aria-label` é "Palestrantes" e o visível
   "Palestras", que já viola isso e deve ser corrigido junto.
5. **Completar as palestrantes com o histórico real** — a tabela tem
   Marcela Zaidem, Danielle Gouveia e Dani Morais Flor, mas o histórico
   reconstruído no Módulo 11 confirma **Geórgia Maia** (marketing, Edição
   Especial de 15/09/2025) e **Carla Martins** (20/10/2025), que não estão
   na lista. Completar com quem realmente passou pelas edições e ligar
   palestrante ↔ edição. **Só com o que está confirmado no seed/banco — não
   inventar bio.**
6. **Pop-up de edição com upload de imagem para o Supabase** — o maior da
   fila, e é o Módulo 5 começando. Hoje toda edição é overlay local
   (`localContent.ts`) **de propósito**: não existe permissão de escrita, e
   abrir escrita com a chave `anon` deixaria qualquer visitante alterar o
   conteúdo e subir arquivo no Storage. Para fazer direito falta, nesta
   ordem: (a) noção de admin (coluna em `profiles` ou tabela `admins`);
   (b) políticas RLS de UPDATE/INSERT para admin nas tabelas de conteúdo;
   (c) política de upload no bucket `media`; (d) `uploadMedia()` +
   updates reais na camada `db`; (e) a UI com preview, progresso e remover.
   **Continua valendo:** o app tem que funcionar sem Supabase configurado
   (regra 10) e a chave `service_role` nunca entra no front (regra 11).
   O usuário vai precisar rodar o SQL e marcar a própria conta como admin.

## Armadilhas de método desta sessão (economizam horas)

1. **O Google Fonts não é alcançável deste contêiner** (ERR_CONNECTION_RESET,
   com ou sem proxy). Toda captura sai em fonte de fallback e a conferência
   de tipografia vira ilusão. A solução está montada: os `.woff2` foram
   baixados via `curl` e o harness do Playwright serve do disco (ver
   `shots.mjs` no scratchpad). O Supabase também não é alcançável — as fotos
   da landing são servidas do disco do mesmo jeito.
2. **`document.fonts.check()` mente** — devolve `true` mesmo com fallback. O
   que vale é a lista de faces com `status === 'loaded'`.
3. **Contraste só vale medido no pixel renderizado.** Calcular em cima dos
   tokens erra feio: ignora gradiente (`background-image`), `backdrop-filter`
   e a barra flutuante por cima do conteúdo. O harness apaga o texto
   (`color: transparent`), fotografa, lê o pixel do fundo e ignora elemento
   coberto pela tab bar. Sem isso, "Quero participar" aparecia como 3,16:1
   sendo preto sobre dourado.

## Uma pendência que não é código

Na página 03 do manual, o item **"1. LOGOMARCA PRINCIPAL"** traz a palavra
escrita **"coneecta"**, com dois "e". As versões da página 06 estão certas e
foi de lá que a máscara saiu, então o código está correto — mas vale as
sócias corrigirem com quem produziu o manual.
