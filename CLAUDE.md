# CLAUDE.md — Tríade Conecta

> Leia este arquivo antes de qualquer alteração. Ele é o contrato de trabalho
> deste repositório. Estado atual detalhado: `docs/ESTADO-DO-PROJETO.md`.
> Histórico: `docs/CHANGELOG.md`. Manual de UI/UX (tokens, pop-ups, ícones,
> animação, navegação): `docs/DESIGN-SYSTEM.md` — invoque a skill
> `design-systems` antes de qualquer trabalho de interface. Sessão
> interrompida no meio do trabalho? Confira `docs/LAST-SESSION.md` antes de
> perguntar o que estava pendente (regra 15).

## 1. O que é

App **mobile-first** da **Tríade Conecta** — comunidade de mulheres
empreendedoras (Goiânia/GO) com encontros presenciais mensais de 5h e uma
especialista convidada por edição. Posicionamento: *mulheres · negócios ·
conexões*. Idealizadoras: Lívia Duarte, Lia Chaves e Cris Miranda.

O app tem 5 telas: **Início** (feed), **Sobre**, **Eventos**,
**Palestrantes**, **Planos**.

## 2. Estado do stack

Nasceu como um único HTML colado dentro do Bubble.io. **Migrado** para um
projeto de código real:

- **Vite** + **React 18** + **TypeScript** (strict)
- **react-router-dom** — uma rota por aba (`/`, `/sobre`, `/eventos`,
  `/palestrantes`, `/planos`)
- **CSS puro** com variáveis (sem Tailwind, sem CSS-in-JS)
- **Supabase** (Postgres + RLS) para o conteúdo, atrás da camada `src/lib/db/`
- Deploy na **Vercel** (config em `vercel.json`)

O HTML original está preservado em `legacy/` só como referência visual.
**Não edite `legacy/`.**

## 3. Comandos

```bash
npm install       # instalar
npm run dev       # servidor local (http://localhost:5173)
npm run build     # typecheck + build de produção em dist/
npm run preview   # testar o build de produção
npm run typecheck # só o TypeScript
```

Sempre rode `npm run build` antes de considerar uma tarefa concluída — o
build inclui o typecheck e é exatamente o que a Vercel executa.

## 4. Mapa do repositório

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
```

`docs/DESIGN-SYSTEM.md` é o manual de UI/UX (tokens, pop-ups, ícones,
animação, navegação) — leia antes de mexer em interface, via skill
`design-systems`.

## 5. Regras do projeto (importantes)

1. **Mobile primeiro, sempre.** O alvo é iPhone/Android em pé. Layout de
   desktop é secundário (o conteúdo só ganha `max-width`). Toda mudança de
   UI precisa ser verificada em 375px de largura.
2. **O body não rola.** Só a `.app-main` rola. `body { overflow: hidden }` e
   `.app { position: fixed }` são intencionais — é o que faz parecer app
   nativo em vez de site. Não remova.
3. **`env(safe-area-inset-bottom)` na tab bar não é decoração** — sem ele a
   barra invade a área de gestos do iPhone.
4. **Cores e tipografia só via variáveis CSS** de `tokens.css`. Nada de
   hex solto em componente.
5. **Nenhum componente chama `localStorage` nem o cliente do Supabase
   diretamente.** Tudo passa pelo `db` de `src/lib/db/`. Essa fronteira é o
   que mantém a UI igual quando a origem do dado muda.
6. **Conteúdo de negócio mora em `src/data/seed.ts`**, não hardcoded em JSX,
   exceto textos estruturais de uma tela só.
7. **Sem novas dependências sem necessidade real.** O app hoje roda com
   React + Router e mais nada. Ícones são SVG inline em `components/Icon.tsx`.
8. **TypeScript strict.** Sem `any`, sem `@ts-ignore`.
9. **A leitura de conteúdo é assíncrona** (`db.getEvents()` etc. retornam
    Promise), mesmo no provider local — assim ligar/desligar o Supabase não
    exige mexer em componente. Use `useAsyncData` e mostre `<Skeleton>` no
    carregamento.
10. **O app precisa funcionar sem credenciais do Supabase.** Quem clona e roda
    `npm run dev` deve ver o app completo com dados locais. Não introduza
    código que quebre nesse cenário.
11. **Nunca use a chave `service_role` no front-end**, nem em variável
    `VITE_*` — o prefixo `VITE_` publica o valor no bundle. Só a chave `anon`.
12. **Português do Brasil** em textos de UI, nomes de commit e comentários.
13. **Ao terminar uma sessão de trabalho**, atualize `docs/CHANGELOG.md`
    (nova entrada no topo) e `docs/ESTADO-DO-PROJETO.md` (estado atual).
    Protocolo na seção 9 daquele arquivo.
14. **Qualquer trabalho de UI/UX** (tela, componente visual, pop-up, ícone,
    animação, navegação) invoca a skill `design-systems` antes de codar —
    checklist e regras completas em `docs/DESIGN-SYSTEM.md`. Duas regras de
    lá que já causaram bug real e valem repetir aqui: **todo pop-up passa
    por `ModalOverlay`** (nunca um `<div className="modal-overlay">` cru —
    quebra dentro de componentes com `backdrop-filter`), e **nunca anime
    `scale`/resize num elemento com `backdrop-filter`** (só
    `translate`/opacidade).
15. **Quando a sessão estiver perto do limite de contexto/créditos**
    (ex: acima de ~95%, ou qualquer sinal de que a conversa pode ser cortada
    ou compactada antes de chegar num ponto de parada natural), grave o
    estado do trabalho em andamento em `docs/LAST-SESSION.md` **antes** de
    continuar — não espere terminar a tarefa para registrar. Inclua: o que
    estava sendo feito e por quê, arquivos já alterados (salvos ou não),
    decisões tomadas na conversa que ainda não viraram código/doc, e os
    próximos passos exatos para retomar sem precisar perguntar de novo.
    Isso é diferente do protocolo de fim de sessão (regra 13): aquele é para
    quando a tarefa termina; este é para quando ela **não** termina.
    Assim que uma sessão futura retomar esse trabalho e ele for concluído,
    esvazie `docs/LAST-SESSION.md` de volta pro estado "nada pendente" — ele
    registra trabalho **interrompido**, não é mais um changelog.

## 6. Como adicionar coisas

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

**Nova cor / novo tema:** o app tem dois temas (Pérola, padrão, e Ônix —
preto/branco/dourado), escolhidos em Configurações → Aparência. Toda cor
nova vira token **nos dois blocos** de `src/styles/tokens.css` (`:root` e
`[data-theme='onyx']`) — nunca um seletor de tema dentro do CSS de um
componente, e nunca cor de marca gravada em conteúdo (gradiente em
`seed.ts` usa a escala `--ph-1..5`). Receita completa e como adicionar um
terceiro tema: `docs/DESIGN-SYSTEM.md`, seção 1.

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
na declaração, só no uso). Detalhes em `docs/ARQUITETURA.md`.

## 7. O que ainda NÃO existe (não presuma)

- **Autenticação existe** (Supabase Auth, e-mail/senha com confirmação por
  e-mail, **+ Google já configurado e funcionando** via `signInWithGoogle`
  — `AuthContext`/`AccountSheet`) e um **perfil editável básico**
  (nome/bio/Instagram/negócio, `ProfileEditSheet`; foto só a do Google,
  automática). Sem onboarding, sem recuperação de senha, sem upload de
  foto própria, sem outro login social (Apple, Facebook...).
- **Engajamento (curtir, salvar, RSVP/cancelar, plano escolhido) vai para o
  Supabase só com usuária logada.** Deslogada (ou sem Supabase configurado)
  continua exatamente como antes: localStorage, por navegador, livre.
- **Edição de conteúdo pelo app (menu "..." → Editar, criar evento/
  palestrante) também é só local** — um overlay em cima do conteúdo lido,
  não grava no Supabase de propósito (sem login, chave de escrita pública
  seria risco de segurança). Não confunda com um painel administrativo real.
- Sem fotos reais — todas as "imagens" são gradientes de cor da marca.
- Sem pagamento. Escolher plano só grava a escolha localmente.
- Sem painel administrativo de verdade (a UI de edição acima não conta —
  falta o backend com permissão real, ver Módulo 5).
- Sem testes automatizados no repositório.
- Sem atalho de instalação (Android/iOS) nem notificações de evento —
  planejado como Módulo 7 (agora que a autenticação existe, o pré-requisito
  que faltava para saber "quem" notificar está pronto).

## 8. Roadmap

| Módulo | Escopo | Status |
|---|---|---|
| 1 | Landing / app shell — 5 telas | ✅ migrado para código |
| 1.5 | Supabase para o conteúdo | ✅ camada pronta |
| — | Pop-up de evento + WhatsApp, edição inline local, config/tab bar | ✅ pronto (sessões 6–9) |
| 2 | Autenticação (Supabase Auth) — entrar/cadastrar/sair, Google (configurado e funcionando), perfil editável, engajamento no banco quando logada | ✅ concluído 23/08/2026 |
| 3 | Área de membras logada (feed real, diretório) | ⏭️ próximo |
| 4 | Assinaturas e pagamento (já com banco real) | ⏳ |
| 5 | Painel administrativo — trocar o overlay local (`localContent.ts`) por gravação real no Supabase | ⏳ |
| 6 | Migração de dados localStorage → banco | ⏳ |
| 7 | Atalho na tela de início (Android/iOS) + notificações de evento/ingressos | ⏳ depende do Módulo 2 |
| 8 | Sobre — mídias e relatos reais (fotos, vídeos, depoimentos) | ⏳ planejado 23/08/2026 |
| 9 | Eventos — calendário de datas + artigo histórico por edição (mídia/vídeo) | ✅ concluído no código 23/08/2026 — pendente rodar `schema.sql`/`seed.sql` no Supabase real |
| 10 | Palestrantes — pop-up completo por palestrante (redes, presenças, cursos, contato) | ⏳ planejado 23/08/2026 |
| 11 | Infraestrutura de mídia real (Supabase Storage) — fotos/vídeos de verdade a partir do export oficial do Instagram | ⏳ planejado 23/08/2026 |

Detalhamento completo dos módulos 8 a 11 (escopo, campos de dado novos,
componentes a criar, perguntas em aberto) está em
`docs/ESTADO-DO-PROJETO.md`, seção 6. O caminho pra pedir o export do
Instagram (não é scraping, decisão justificada lá) está na seção 7, item 1.

## 9. Deploy

`main` → Vercel (build `npm run build`, saída `dist`). O `vercel.json` já
faz o rewrite de SPA — sem ele, abrir `/eventos` direto dá 404.

As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` precisam estar
configuradas na Vercel; sem elas o app publica funcionando, mas com dados
locais. Variável nova só entra no bundle em **build novo** — redeploy.

**Domínio próprio**: planejado (pedido em 23/08/2026), pendente só de você
ter/comprar um. Vercel → Settings → Domains resolve; se o login com Google
já estiver ativo, adicione o domínio novo em "Authorized domains" no Google
Cloud também. Detalhes em `docs/DEPLOY.md` e `docs/SUPABASE.md`.
