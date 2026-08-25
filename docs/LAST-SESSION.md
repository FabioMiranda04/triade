# Última sessão interrompida

> Este arquivo só existe pra cobrir um cenário: a conversa com o Claude Code
> acabar (limite de contexto/créditos) **no meio** de uma tarefa, antes de um
> ponto de parada natural. Regra 15 do `CLAUDE.md`. Diferente do
> `CHANGELOG.md`/`ESTADO-DO-PROJETO.md`, que registram trabalho **concluído**
> — este registra trabalho **em andamento**, e deve voltar para "nada
> pendente" assim que for retomado e terminado.

**Status:** nada interrompido.

A sessão 16 (25/08/2026) fechou por completo: tema Ônix + Pérola,
revisão de UI/UX e acabamento, tudo commitado, publicado em produção
(`main` = `09bce4e`) e documentado. Nenhuma tarefa ficou pela metade.

## O que vem a seguir (não é pendência de trabalho interrompido)

O próximo passo combinado é o **Módulo 11 — mídia real**, e ele está
parado esperando **duas ações que só você consegue fazer**. Não é conserto
nem continuação de código: o app funciona normalmente sem elas, com os
gradientes de placeholder.

1. **Criar o bucket `media`** no painel do Supabase: Storage → New bucket →
   nome `media` → marcar **Public bucket** → Create. Passo a passo em
   `docs/ESTADO-DO-PROJETO.md`, Módulo 11, "Passo 2".
2. **Pedir o export oficial do Instagram** (Configurações → Central de
   Privacidade → Baixar suas informações → Publicações + Stories → formato
   **JSON**) e extrair o `.zip` dentro de `content-raw/instagram-export/`,
   na raiz do projeto. Pode jogar a estrutura exata que o Instagram gerar,
   sem reorganizar nada. A pasta é ignorada pelo Git de propósito.

   **Isso não é a "API do Instagram"** — é a ferramenta de exportação do
   próprio app, sem nenhum preparo técnico. A comparação entre as duas e o
   porquê da escolha estão em `docs/ESTADO-DO-PROJETO.md`, seção 6, item 10.

Também continua pendente, de sessões anteriores e **sem bloquear nada**:
rodar o `supabase/schema.sql` + `seed.sql` atualizados (colunas
`recap_text`/`recap_media`, do Módulo 9) no SQL Editor do projeto real do
Supabase — ver `docs/SUPABASE.md`.

## Quando o material chegar

Abra uma conversa nova e diga "o material do Instagram chegou". A partir
daí o caminho já está definido, sem precisar decidir nada de novo:
localizar os JSON do export, cruzar as datas das publicações com
`TriadeEvent.date` em `src/data/seed.ts` para saber de qual edição é cada
foto, e propor a curadoria por edição para você confirmar — a escolha das
fotos é sua, não automática. Depois: otimizar, subir para o bucket `media`
e trocar os gradientes de `recapMedia` pelas URLs reais. O código já sabe
renderizar as duas formas (`EventRecapModal` detecta sozinho se a URL é
gradiente ou foto), então não será preciso mexer em `.tsx` nem em `.css`.
