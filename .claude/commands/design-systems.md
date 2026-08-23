Aplique o manual de design/UI-UX do projeto (`docs/DESIGN-SYSTEM.md`) a
qualquer trabalho de interface. Invoque esta skill **sempre** que a tarefa
envolver: tela nova, componente visual novo, pop-up/modal, ícone, animação,
navegação (tab bar, header), formulário, ou qualquer redesign — antes de
escrever a primeira linha de CSS ou JSX.

## 1. Leia primeiro

Leia `docs/DESIGN-SYSTEM.md` inteiro. Ele é a fonte da verdade de tokens,
componentes, padrão de pop-up, ícones, navegação e animação — não reinvente
nada que já esteja documentado lá. Se o pedido conflitar com uma regra do
documento, avise o usuário explicitamente antes de quebrá-la (ex: "isso
recriaria um bottom sheet, que unificamos para sempre ser centralizado —
quer mesmo essa exceção?").

## 2. Checklist obrigatório antes de codar

- [ ] **Cor**: todo valor de cor vem de uma variável em `tokens.css`? Cor de
      marca de terceiro nova (ex: outro app externo) virou token novo lá,
      não hex solto no componente?
- [ ] **Vidro**: a superfície certa entre `.glass` / `.glass-strong` /
      `.glass-dark`? Pop-up = sempre `.glass-dark`, centralizado, via
      `ModalOverlay` — nunca uma `<div className="modal-overlay">` escrita
      à mão, nunca uma variante clara ou bottom-sheet.
- [ ] **Ícone**: reaproveitou um ícone existente em `Icon.tsx` antes de
      criar um novo? Se for glifo de marca de terceiro (ex: outro app),
      usa `fill="currentColor" stroke="none"` preenchido — não force o
      contorno fino padrão num logo reconhecível.
- [ ] **Animação**: usa a curva `cubic-bezier(0.16, 1, 0.3, 1)`? Se o
      elemento tem `backdrop-filter`, a animação evita `scale`/resize e usa
      só `translate`/opacidade (ver seção 9 do manual — isso já causou um
      bug real de performance)?
- [ ] **Pop-up com algo animado atrás**: usa `useModalEffects`
      (via `ModalOverlay`) para pausar o fundo, em vez de deixar o `.mesh`
      rodando atrás dele o tempo todo?
- [ ] **Toque**: todo alvo clicável tem ~38–44px? Tem `:active` com
      feedback visual (scale ou mudança de fundo), não só `:hover`?
- [ ] **Variação vs. substituição**: se o pedido é "quero que pareça com
      [referência]" sem dizer "troque", isso é candidato a virar opção em
      Configurações (como a tab bar Padrão/Padrão 2), não uma substituição
      silenciosa. Confirme com o usuário qual ele quer.
- [ ] **Mobile**: verificado em 375px de largura? `body` continua sem
      rolar, só `.app-main`? Elemento fixo no topo/rodapé soma
      `env(safe-area-inset-*)`?
- [ ] **Conteúdo**: texto de negócio foi para `src/data/seed.ts`, não
      hardcoded no JSX (exceto texto estrutural de uma tela só)?

## 3. Depois de codar

1. Rode `npm run build` (typecheck + build de produção).
2. Se possível, valide visualmente em viewport mobile (375px) — via
   Playwright/`chromium-cli` se disponível, ou descreva ao usuário
   exatamente o que testar manualmente.
3. **Atualize `docs/DESIGN-SYSTEM.md`** se você introduziu algo novo que
   outras telas vão reaproveitar: um token, um padrão de componente, uma
   regra de animação, um ícone, um padrão de navegação. A seção 11 daquele
   arquivo é o protocolo — não deixe o manual desatualizado em relação à
   UI real.
4. Se a mudança for visualmente significativa, mencione no
   `docs/CHANGELOG.md` na próxima atualização de documentação (via skill
   `atualizar-docs`), não precisa duplicar aqui.

## Contexto de por que isso existe

Este projeto já bateu em dois bugs reais por pular esse processo: um pop-up
que travava (raiz: `scale` + `backdrop-filter` + fundo animado atrás,
seção 9 do manual) e um pop-up que renderizava espremido (raiz: nascer
dentro de um componente com `backdrop-filter` sem passar por um portal,
seção 4.1). Os dois já estão documentados e resolvidos — esta skill existe
para que a próxima peça de UI comece já sabendo disso, em vez de
redescobrir do zero.
