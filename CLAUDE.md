# CLAUDE.md — Tríade Conecta

> Leia este arquivo antes de qualquer alteração. Ele é o contrato de trabalho
> deste repositório. Estado atual detalhado: `docs/ESTADO-DO-PROJETO.md`.
> Histórico: `docs/CHANGELOG.md`.

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
├── hooks/                # useAsyncData, useEngagement, useDoubleTap
├── lib/
│   ├── db/               # camada de dados — ÚNICA fronteira de persistência
│   │   ├── index.ts      #   exporta `db` (escolhe o provider)
│   │   ├── types.ts      #   interface DataProvider
│   │   ├── localProvider.ts
│   │   ├── supabaseProvider.ts
│   │   └── prefs.ts      #   preferências no localStorage
│   ├── supabase.ts       # cliente (null se não houver credenciais)
│   └── format.ts         # datas, preços, classes de status (pt-BR)
├── data/seed.ts          # todo o conteúdo mock (textos, eventos, planos...)
├── types/index.ts        # tipos do domínio
├── types/
│   ├── index.ts          # tipos do domínio (camelCase, usados pela UI)
│   └── database.ts       # tipos das tabelas (snake_case, espelha o SQL)
└── styles/
    ├── tokens.css        # variáveis de cor/raio/tipografia — mude AQUI
    ├── base.css          # reset e elementos base
    ├── layout.css        # mesh, vidro, app shell, tab bar
    └── components.css    # feed, eventos, planos, botões, toast

supabase/
├── schema.sql            # tabelas + RLS + triggers (idempotente)
└── seed.sql              # conteúdo inicial (idempotente)
```

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

## 6. Como adicionar coisas

**Nova tela/aba:** crie `src/screens/NomeDaTela.tsx` exportando default →
adicione a `<Route>` em `App.tsx` → adicione o item em
`src/components/TabBar.tsx` (com um `IconName` válido). A tab bar hoje tem 5
itens; mais que isso aperta em telas de 360px.

**Novo ícone:** acrescente uma chave em `PATHS` no `components/Icon.tsx`,
`viewBox="0 0 24 24"`, `stroke-width` 1.9, estilo linha fina.

**Novo campo de dado:** coluna em `supabase/schema.sql` → tipo em
`src/types/database.ts` → tipo do domínio em `src/types/index.ts` → mapeamento
em `supabaseProvider.ts` → valor em `src/data/seed.ts` (para o modo local) →
leitura via `db`. Os cinco passos, sempre — pular um deixa os dois providers
fora de sincronia.

**Mover engajamento para o servidor (Módulo 2):** as tabelas já existem em
`schema.sql` com RLS. Requer autenticação primeiro; as assinaturas de
`isLiked`/`toggleLike`/etc. em `DataProvider` vão precisar virar assíncronas.

## 7. O que ainda NÃO existe (não presuma)

- Sem autenticação/login. Sem conta de usuária.
- **Engajamento (curtir, salvar, RSVP, plano escolhido) NÃO vai para o
  Supabase** — é localStorage, por navegador. Sem login não há a quem
  atribuir. Só o conteúdo (eventos, palestrantes, planos) vem do banco.
- Sem fotos reais — todas as "imagens" são gradientes de cor da marca.
- Sem pagamento. Escolher plano só grava a escolha localmente.
- Sem painel administrativo.
- Sem testes automatizados no repositório.

## 8. Roadmap

| Módulo | Escopo | Status |
|---|---|---|
| 1 | Landing / app shell — 5 telas | ✅ migrado para código |
| 1.5 | Supabase para o conteúdo | ✅ camada pronta |
| 2 | Autenticação (Supabase Auth) e perfil | ⏭️ próximo |
| 3 | Área de membras logada (feed real, diretório) | ⏳ |
| 4 | Assinaturas e pagamento (já com banco real) | ⏳ |
| 5 | Painel administrativo (CRUD) | ⏳ |
| 6 | Migração de dados localStorage → banco | ⏳ |

## 9. Deploy

`main` → Vercel (build `npm run build`, saída `dist`). O `vercel.json` já
faz o rewrite de SPA — sem ele, abrir `/eventos` direto dá 404.

As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` precisam estar
configuradas na Vercel; sem elas o app publica funcionando, mas com dados
locais. Variável nova só entra no bundle em **build novo** — redeploy.

Detalhes em `docs/DEPLOY.md` e `docs/SUPABASE.md`.
