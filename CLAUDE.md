# CLAUDE.md — Tríade Conecta

<!-- FORMATO: denso, para o modelo. Este arquivo é reenviado ao modelo em
     TODA chamada — é o único do repo com esse custo. Por isso escreve-se
     telegráfico: sem conectivo, sem repetição, uma linha por fato. Vale o
     mesmo para docs/GUIA-DO-REPO.md. Os DEMAIS docs (CHANGELOG,
     ESTADO-DO-PROJETO, DESIGN-SYSTEM, MANUAL-DE-MARCA, LAST-SESSION) são
     lidos por gente: português normal e completo. Decisão do usuário,
     02/09/2026. Regra: comprimir prosa, NUNCA obrigação, valor concreto
     (hex/px/nome de arquivo) ou "porquê" que registra bug já ocorrido. -->

## 1. O app

Tríade Conecta. Comunidade de mulheres empreendedoras, Goiânia/GO.
Encontros presenciais mensais de 5h + especialista convidada por edição.
Posicionamento: *mulheres · negócios · conexões*.
Idealizadoras: Lívia Duarte, Lia Chaves, Cris Miranda.
Mobile-first. 5 telas: Início (feed), Sobre, Eventos, Palestrantes, Planos.

## 2. Stack

Nasceu como HTML único dentro do Bubble.io → migrado para código real.

- Vite + React 18 + TypeScript strict
- react-router-dom — 1 rota por aba (`/`, `/sobre`, `/eventos`, `/palestrantes`, `/planos`)
- CSS puro com variáveis. Sem Tailwind, sem CSS-in-JS
- Supabase (Postgres + RLS) atrás de `src/lib/db/`
- Deploy Vercel (`vercel.json`)
- `legacy/` = HTML original, referência visual. **NÃO EDITE**

## 3. Comandos

```bash
npm install
npm run dev        # localhost:5173
npm run build      # typecheck + build em dist/ — é o que a Vercel roda
npm run preview
npm run typecheck
```

`npm run build` verde ANTES de considerar tarefa concluída. Sempre.

## 4. Onde está o resto

Fora daqui para não pesar em toda chamada. Leia sob demanda:

| Preciso de… | Arquivo |
|---|---|
| mapa de pastas, o que cada arquivo faz | `docs/GUIA-DO-REPO.md` §1 |
| receita: tela / ícone / cor / campo de dado / pop-up / UI de edição nova | `docs/GUIA-DO-REPO.md` §2 |
| **o que ainda NÃO existe** (não presuma) | `docs/GUIA-DO-REPO.md` §3 |
| roadmap e status dos módulos | `docs/GUIA-DO-REPO.md` §4 |
| estado atual, decisões, pendências | `docs/ESTADO-DO-PROJETO.md` |
| tokens, pop-up, ícone, animação, navegação, **direção de design** | `docs/DESIGN-SYSTEM.md` (skill `design-systems`) |
| cor de marca e fonte — manda em tudo (R16) | `docs/MANUAL-DE-MARCA.md` |
| trabalho interrompido no meio | `docs/LAST-SESSION.md` |
| histórico | `docs/CHANGELOG.md` |

1º nível: `src/` app · `supabase/` schema+seed · `landing/` página do QR
code (fora do build) · `legacy/` não editar · `docs/`.

## 5. Regras

**R1 — Mobile primeiro.** Alvo: iPhone/Android em pé. Desktop é
secundário (conteúdo só ganha `max-width`). Toda mudança de UI verificada
em **375px**.

**R2 — Body não rola.** Só `.app-main` rola. `body { overflow: hidden }` +
`.app { position: fixed }` são intencionais → é o que faz parecer app nativo.
Não remova.

**R3 — `env(safe-area-inset-bottom)` na tab bar não é decoração.** Sem
ele a barra invade a área de gestos do iPhone.

**R4 — Cor e tipografia só via variável de `tokens.css`.** Zero hex solto
em componente.

**R5 — Nenhum componente chama `localStorage` ou o cliente Supabase
direto.** Tudo pelo `db` de `src/lib/db/`. Essa fronteira é o que mantém
a UI igual quando a origem do dado muda.

**R6 — Conteúdo de negócio em `src/data/seed.ts`**, não hardcoded em JSX.
Exceção: texto estrutural de uma tela só.

**R7 — Sem dependência nova sem necessidade real.** Hoje: React + Router e
mais nada. Ícone = SVG inline em `components/Icon.tsx`.

**R8 — TypeScript strict.** Sem `any`, sem `@ts-ignore`.

**R9 — Leitura de conteúdo é assíncrona** (`db.getEvents()` etc. devolvem
Promise) mesmo no provider local → ligar/desligar Supabase não mexe em
componente. Use `useAsyncData` + `<Skeleton>` no carregamento.

**R10 — App funciona sem credencial do Supabase.** Quem clona e roda
`npm run dev` vê o app completo com dado local. Não quebre esse cenário.

**R11 — NUNCA `service_role` no front-end**, nem em variável `VITE_*` — o
prefixo `VITE_` publica o valor no bundle. Só a chave `anon`.

**R12 — Português do Brasil** em texto de UI, commit e comentário.
Exceção: `CLAUDE.md` e `docs/GUIA-DO-REPO.md` (só o modelo lê → formato
denso, ver topo deste arquivo).

**R13 — Fim de sessão:** atualize `docs/CHANGELOG.md` (entrada nova no
topo) + `docs/ESTADO-DO-PROJETO.md` (estado atual). Protocolo na §9
daquele arquivo.

**R14 — Trabalho de UI/UX** (tela, componente visual, pop-up, ícone,
animação, navegação) → invoque a skill `design-systems` ANTES de codar.
Peça visual nova → comece pela **§12 do `docs/DESIGN-SYSTEM.md`**
("Direção de design"): 5 princípios — geometria com direção · camada que
informa não se mexe · hierarquia entre linhas · inovar em forma e tempo,
não em cor · **ousar na animação** (exagero permitido, limite é temático)
— + teste de 4 perguntas antes de aprovar ideia nova.
Duas regras de lá que **já causaram bug real**, repetidas aqui:
- todo pop-up passa por `ModalOverlay`. Nunca `<div className="modal-overlay">` cru → quebra dentro de componente com `backdrop-filter`;
- nunca anime `scale`/resize em elemento com `backdrop-filter` → só `translate`/opacidade.

**R15 — Sessão perto do limite** de contexto/créditos (~95%+, ou qualquer
sinal de corte/compactação antes de um ponto de parada natural): grave o
trabalho EM ANDAMENTO em `docs/LAST-SESSION.md` **antes** de continuar —
não espere terminar. Inclua: o que estava sendo feito e por quê; arquivos
alterados (salvos ou não); decisões da conversa que ainda não viraram
código/doc; próximos passos exatos para retomar sem perguntar de novo.
≠ R13: R13 é tarefa terminada, R15 é tarefa **não** terminada. Retomou e
concluiu → esvazie o arquivo de volta para "nada pendente". Não é
changelog.

**R16 — Cor de marca e fonte têm dono externo: o Manual de Marca**
(`docs/MANUAL-DE-MARCA.md`, original em `docs/marca/`). Os `--brand-*` de
`tokens.css` e as famílias tipográficas **não são escolha de design** — se
um valor diverge do manual, o código está errado, por mais bonita que a
tela fique. Mudou o manual → atualize o doc primeiro, o código depois.
Precisa de um tom que o manual não tem (acessibilidade, p.ex.) → é
**derivado**: entra com comentário explicando a medição que o motivou e é
registrado como "decisão nossa" no doc do manual. Foi assim que nasceram
`--brand-gold-deep` e `--brand-reverse`.
**Fonte comercial não vira `font-family` sem licença web** — caso
concreto: a Slight (o "conecta" da assinatura), §4 daquele doc.

**R17 — Terminou plano de implementação → commit e push, sem perguntar.**
Sequência fixa: `npm run build` verde → docs da R13 → commit → push na
branch de trabalho → `git push origin HEAD:main` quando pronto para o
público. **`main` é produção**: a Vercel publica sozinha a cada push — por
isso o build passa ANTES, não depois. Só segure o push de `main` se: build
falhou, algo ficou pela metade de propósito, ou o usuário pediu para
segurar. Esperar "pode subir?" a cada entrega é ruído — a autorização é
permanente e está aqui.

**R18 — Skills `caveman` e `ponytail` ativas** (em `.claude/skills/`,
versionadas ∵ o contêiner é efêmero). Onde cada uma paga:
- **`ponytail` antes de escrever código** — a solução mais preguiçosa que
  resolve: sem dependência nova, sem abstração especulativa, sem campo
  "que talvez precise depois". Esta economiza de verdade, e não por
  comprimir texto: menos código = menos build, menos verificação, menos
  conversa. É a conversa que custa.
- **`caveman` para prosa longa**, não como modo permanente. Medido
  (sessão 20): texto visível do assistente = 23k tokens de 1,53M de
  saída; saída = 9% da conta. Comprimir tudo mexe em ~0,1% do custo.
- **O dinheiro está no contexto relido**: 74–91% da conta. ~370k tokens
  reenviados por chamada, 617M no total de uma sessão longa. Baixa isso:
  - **captura de tela** — ~1.100 tokens cada, cobrada em TODA chamada
    seguinte até o fim da sessão. 83 capturas ≈ US$ 93. Só as que mudam
    uma decisão, e recorte antes de olhar;
  - **saída de comando** — 125k tokens numa sessão ≈ US$ 100. Use `grep`
    alvo e `| tail -n`, não despeje arquivo;
  - **sessão curta** — encerre por tarefa. Os docs da R13/R15 existem para
    a sessão seguinte retomar lendo ~31k em vez de herdar 370k.

## 6. Deploy

`main` → Vercel (build `npm run build`, saída `dist`). O `vercel.json` faz
o rewrite de SPA — sem ele `/eventos` direto dá 404.

`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` precisam estar na Vercel.
Sem elas o app publica funcionando, mas com dado local. **Variável nova só
entra no bundle em build novo** → redeploy.

**Domínio próprio**: planejado (pedido 23/08/2026), pendente de você ter
um. Vercel → Settings → Domains. Login com Google ativo → adicione o
domínio novo em "Authorized domains" no Google Cloud também. Detalhes:
`docs/DEPLOY.md`, `docs/SUPABASE.md`.
