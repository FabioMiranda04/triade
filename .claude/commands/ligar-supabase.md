Me guie para ligar o Supabase neste projeto, ou diagnostique por que o app
está caindo nos dados locais.

Contexto: o app usa Supabase para conteúdo (eventos, palestrantes, planos) e
localStorage para engajamento. A escolha do provider é automática, em
`src/lib/db/index.ts`, com base nas variáveis de ambiente.

Se for configuração inicial, siga `docs/SUPABASE.md`.

Se for diagnóstico, verifique nesta ordem:

1. `.env.local` existe e tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`?
2. O servidor foi reiniciado depois de criar/editar o `.env.local`?
   (variável de ambiente só é lida na inicialização do Vite)
3. O console do navegador mostra algum aviso `[supabase]`? O texto diz se foi
   falha de consulta ou tabela vazia.
4. `schema.sql` e `seed.sql` foram executados no SQL Editor?
5. As linhas têm `published = true`?
6. As políticas de RLS de select existem para `anon`?
7. Se o problema é só em produção: as variáveis estão na Vercel, nos três
   ambientes, e houve redeploy depois de adicioná-las?
