# Tríade Conecta · App

App mobile da comunidade **Tríade Conecta** — mulheres, negócios e conexões.
Encontros presenciais mensais em Goiânia/GO.

Vite + React 18 + TypeScript + Supabase + CSS puro. Sistema visual
"Liquid Glass": vidro translúcido, fundo em mesh gradient e navegação estilo
Instagram.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. **Funciona sem configurar nada** — sem
credenciais do Supabase, o app usa dados locais.

Para ligar o banco, copie `.env.example` para `.env.local` e preencha com as
chaves do seu projeto Supabase. Passo a passo em
[`docs/SUPABASE.md`](./docs/SUPABASE.md). Para testar como app de verdade, use o modo
dispositivo do DevTools (iPhone SE / iPhone 15 Pro) — o layout é mobile-first.

Rodando no celular na mesma rede: o `vite.config.ts` já usa `host: true`,
então o terminal mostra também um endereço `http://192.168.x.x:5173`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento com hot reload |
| `npm run build` | typecheck + build de produção em `dist/` |
| `npm run preview` | serve o `dist/` para conferir o build |
| `npm run typecheck` | só o TypeScript, sem gerar arquivos |

## Estrutura

```
src/
├── App.tsx           app shell + rotas
├── screens/          Início, Sobre, Eventos, Palestrantes, Planos
├── components/       UI reutilizável (PostCard, TabBar, Icon, ...)
├── hooks/            carregamento assíncrono, curtidas/salvos, duplo toque
├── lib/db/           camada de dados (Supabase ou local) e formatação
├── data/seed.ts      conteúdo de fallback (eventos, planos, palestrantes...)
├── types/            tipos do domínio e das tabelas
└── styles/           tokens + base + layout + componentes

supabase/             schema.sql + seed.sql
```

## Dados

| Dado | Onde vive |
|---|---|
| Eventos, palestrantes, planos | Supabase (Postgres + RLS) |
| Curtidas, salvos, RSVP, plano escolhido | localStorage — até existir login |

Nenhum componente fala com o banco direto: tudo passa pelo `db` de
`src/lib/db/`.

## Documentação

- [`CLAUDE.md`](./CLAUDE.md) — contexto e regras do projeto (leia primeiro)
- [`docs/ESTADO-DO-PROJETO.md`](./docs/ESTADO-DO-PROJETO.md) — onde o projeto está agora
- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) — histórico por sessão
- [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md) — decisões técnicas
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — cores, tipografia, componentes
- [`docs/SUPABASE.md`](./docs/SUPABASE.md) — configurar o banco, RLS, chaves
- [`docs/DEPLOY.md`](./docs/DEPLOY.md) — publicar na Vercel

## Histórico

O app começou como um único arquivo HTML colado num elemento do Bubble.io.
Esse arquivo está preservado em [`legacy/`](./legacy/) apenas como referência.
