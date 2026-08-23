# Última sessão interrompida

> Este arquivo só existe pra cobrir um cenário: a conversa com o Claude Code
> acabar (limite de contexto/créditos) **no meio** de uma tarefa, antes de um
> ponto de parada natural. Regra 15 do `CLAUDE.md`. Diferente do
> `CHANGELOG.md`/`ESTADO-DO-PROJETO.md`, que registram trabalho **concluído**
> — este registra trabalho **em andamento**, e deve voltar para "nada
> pendente" assim que for retomado e terminado.

**Status:** pendente — Módulo 11 (mídia real), aguardando duas ações que só
o usuário consegue fazer (painel do Supabase + Instagram). Nada quebrado,
código todo commitado e com build validado; é continuação, não conserto.

## Pendente desde 23/08/2026

**O que estava sendo feito e por quê:**
Sessão 15 corrigiu o login com Google (bug real: faltava a URL do site em
Redirect URLs no Supabase — ver `docs/SUPABASE.md`) e, na sequência, o
usuário pediu pra planejar como trazer fotos/vídeos reais (mais de 7
edições + outros eventos) sem fazer scraping do Instagram. Decisão: usar a
ferramenta oficial de exportação de dados do Instagram + bucket no
Supabase Storage. Esse é o **Módulo 11**, documentado em
`docs/ESTADO-DO-PROJETO.md` seção 6. O código do lado do app já está
pronto (`EventRecapModal.tsx` detecta sozinho se uma foto é gradiente
placeholder ou URL real) — só falta o material em si e o bucket pra
guardá-lo.

**Decisões já tomadas na conversa** (já viraram código/doc, não precisa
perguntar de novo):
- Origem do material: export oficial do Instagram (Publicações + Stories,
  formato JSON) — nunca scraping, decisão justificada em
  `docs/ESTADO-DO-PROJETO.md` seção 7, item 1.
- Destaques não precisam de tratamento especial: vêm inclusos em "Stories"
  no export (são só stories arquivados fixados no perfil).
- Bucket `media` no Supabase Storage, marcado **Public bucket** (leitura
  pública automática); nenhuma política de escrita — a ausência de uma
  política de `insert` já impede a chave `anon` de gravar, sem precisar de
  SQL extra.
- Pasta de trabalho local: `content-raw/instagram-export/` (raiz do
  projeto, já criada, ignorada pelo Git — nunca commitar o conteúdo dela).

**Próximos passos exatos para retomar** (não é preciso re-perguntar nada,
só executar em ordem):
1. Usuário cria o bucket `media` no painel do Supabase — Storage → New
   bucket → nome `media` → marcar **Public bucket** → Create. Passo a
   passo completo em `docs/ESTADO-DO-PROJETO.md`, Módulo 11, "Passo 2".
2. Usuário pede o export oficial do Instagram (Configurações → Central de
   Privacidade → Baixar suas informações → Publicações + Stories → JSON) e
   extrai o(s) `.zip` dentro de `content-raw/instagram-export/` (mesma
   estrutura que o Instagram gerar, sem reorganizar).
3. Usuário avisa "o material chegou" numa conversa nova — a partir daí:
   localizar os JSON do export (`posts_1.json`/`stories.json`, nome pode
   variar), cruzar as datas das publicações com `TriadeEvent.date` em
   `src/data/seed.ts` pra saber de qual edição é cada foto, e propor a
   curadoria por edição (confirmar/excluir com o usuário, não decidir
   sozinho).
4. Depois da curadoria confirmada: redimensionar/otimizar as fotos
   escolhidas, subir pro bucket `media` (painel manualmente, ou script
   local pontual com a chave `service_role` — nunca no front-end), pegar
   as URLs públicas resultantes, e trocar os gradientes placeholder em
   `recapMedia` (`src/data/seed.ts` local + `supabase/seed.sql`, ou direto
   na tabela `events` pelo Table Editor) pelas URLs reais — o código já
   sabe renderizar as duas formas, não precisa mexer em `.tsx`/`.css` de
   novo.

**Comandos pendentes de rodar** (nenhum é bloqueante — o app funciona
normalmente sem eles, com os gradientes placeholder):
- Rodar `supabase/schema.sql` + `supabase/seed.sql` atualizados (colunas
  `recap_text`/`recap_media`) no SQL Editor do projeto real do Supabase —
  pendente desde o Módulo 9 (sessão anterior), ver `docs/SUPABASE.md`.
- Criar o bucket `media` (item 1 acima) — só pelo painel, não por código.
