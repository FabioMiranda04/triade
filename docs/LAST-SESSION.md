# Última sessão interrompida

> Este arquivo só existe pra cobrir um cenário: a conversa com o Claude Code
> acabar (limite de contexto/créditos) **no meio** de uma tarefa, antes de um
> ponto de parada natural. Regra 15 do `CLAUDE.md`. Diferente do
> `CHANGELOG.md`/`ESTADO-DO-PROJETO.md`, que registram trabalho **concluído**
> — este registra trabalho **em andamento**, e deve voltar para "nada
> pendente" assim que for retomado e terminado.

**Status:** Módulo 11 fechado na sessão 18 (26/08/2026) — o histórico de
edições foi reconstruído a partir do export real do Instagram, está em
produção (código + Storage + banco), e a migração do banco (que exigia SQL
Editor) já foi rodada. **Nada pendente.**

## O que já foi feito e já está em produção

- **Histórico de edições inteiro reescrito** com dados reais do Instagram
  (não mais mock): `src/data/seed.ts`, `supabase/seed.sql` e a tabela
  `events` do Supabase real já têm as edições confirmadas —
  Edição Especial (15/09/2025, Casa Benedita, Geórgia Maia), Edição com
  Carla Martins (20/10/2025), 6ª Edição (17/11/2025), 9ª Edição
  (31/03/2026), Edição de Maio (12/05/2026), 11ª Edição (11/08/2026) e o
  próximo evento real, "Jantar da Tríade para Casais" (30/09/2026, em
  breve). As antigas "1ª/2ª/3ª Edição" (mock, sem respaldo no Instagram)
  foram removidas do banco e do código, a pedido do usuário.
- **11 fotos reais** já sobem no bucket `media` do Supabase Storage
  (confirmado público, testado com 200 OK), em
  `media/<slug-da-edição>/foto-N.jpg` — 2 por edição (1 só na 9ª, que tinha
  pouco material de Stories). Curadoria feita visualmente foto por foto.
- **Timeline da tela Sobre** (`timeline` em `seed.ts`) e o **card de
  estatísticas** (`STATS` em `src/screens/Sobre.tsx`) atualizados pros
  números reais ("11+ edições", "set/26" como próxima) — não mais "3
  edições"/"85+" do mock antigo.
- **Feed da tela Início**: o post de CTA agora aponta pro Jantar da Tríade
  para Casais (real), não mais pra uma "3ª edição" inventada.
- **Campo `spots` virou opcional** (`TriadeEvent.spots?: number`,
  `EventRow.spots: number | null`) porque nem toda edição real tem vagas
  conhecidas — `EventCard`/`EventModal` só mostram a linha "X vagas" quando
  o valor é truthy (`!!event.spots`), tanto faz se vier `null` (schema novo)
  quanto `0`/ausente (schema antigo, ainda em produção — ver pendência
  abaixo). Build (`npm run build`) e verificação visual via Playwright em
  375px confirmados sem erro.

## Migração do banco — já aplicada

As colunas `recap_text`/`recap_media` não existiam na tabela `events` do
Supabase real (pendência de antes desta sessão, Módulo 9) e a coluna
`spots` ainda tinha `not null default 0`. Não dava pra resolver via REST
(só DDL via SQL direto) — o usuário passou a senha do Postgres e a sessão
conectou direto no banco (via connection pooler Supavisor, região
`us-west-2`; a conexão direta em `db.<ref>.supabase.co:5432` só tem AAAA/
IPv6 e não é alcançável desta rede) e rodou `schema.sql` + `seed.sql`
inteiros. Confirmado por query: as 6 edições realizadas têm
`recap_text`/`recap_media` populados, verificado também visualmente via
Playwright (fotos reais carregando, `naturalWidth` > 0, não é placeholder
quebrado). **Senha usada só em memória nesta sessão, nunca gravada em
arquivo nem commitada.**

## O que ficou de fora desta reconstrução (decisão consciente)

- **Marcela Zaidem** e **Danielle Gouveia** continuam na tabela/tela de
  Palestrantes (`speakers`) — não foram removidas, porque essa reconstrução
  foi só do histórico de **edições**, não da lista de palestrantes
  (Módulo 10, ainda não começou). Elas só deixaram de estar ligadas a uma
  edição específica no mock antigo.
- **Não foi feita reconstrução completa da numeração** (edições 1–5, 7–8,
  10 e 12+ não têm data/palestrante/tema confirmados no Instagram) — só
  entraram no app as edições com âncora real clara. O usuário pediu pra
  "resgatar o que der" e organizar; o restante fica pra uma sessão futura,
  se o usuário quiser preencher os buracos com conhecimento próprio.
- **content-raw/instagram-export/ continua vazio** — o export ficou no
  Downloads do usuário (`instagram-triade.conecta-2026-08-26-azIUlA2Q` e
  `-CrCb0s1A`), não foi copiado pro repo por causa do tamanho (~4 GB). Ver
  detalhes de estrutura/localização no histórico do chat da sessão 18, ou
  em `content-raw/curadoria-edicoes.md` (tabela com todos os 91 dias de
  pico de Stories encontrados, não só os 7 usados nesta rodada).

## Também pendente, sem bloquear nada

- Confirmar se o bucket `media` no Supabase está marcado **Public**
  — ✅ **já confirmado nesta sessão** (Storage → bucket → Configuration
  retornou `"public": true` via API). Pendência antiga, resolvida.
- Da auditoria de 26/08/2026, sobrou só o que é **decisão de produto**:
  tela de boas-vindas na primeira abertura (hoje a usuária cai direto no
  feed, sem nada explicando o que é a Tríade).
