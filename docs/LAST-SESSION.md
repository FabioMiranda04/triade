# Última sessão interrompida

> Este arquivo só existe pra cobrir um cenário: a conversa com o Claude Code
> acabar (limite de contexto/créditos) **no meio** de uma tarefa, antes de um
> ponto de parada natural. Regra 15 do `CLAUDE.md`. Diferente do
> `CHANGELOG.md`/`ESTADO-DO-PROJETO.md`, que registram trabalho **concluído**
> — este registra trabalho **em andamento**, e deve voltar para "nada
> pendente" assim que for retomado e terminado.

**Status:** o trabalho de código da sessão 17 fechou inteiro (auditoria de
UI/UX e as duas ondas de correção, tudo em produção). O que está **em
andamento de verdade** é o Módulo 11: o material do Instagram chegou, mas
ainda não foi processado.

## Módulo 11 — onde exatamente paramos (26/08/2026)

**Já resolvido:**
- ✅ **Bucket `media` criado** no Supabase Storage pelo usuário. Falta só
  confirmar se a opção **Public bucket** ficou marcada (Storage → clicar no
  bucket → Configuration). Sem ela, as fotos sobem mas o app leva 403 na
  hora de exibir — e o sintoma engana, parece URL errada.
- ✅ **Export do Instagram baixado**: dois `.zip` de
  `bigzipfiles.instagram.com`, um de **2,96 GB** e outro de **1,01 GB**.
  Provavelmente a mesma exportação partida em duas partes.

**O detalhe que muda o plano:** o export saiu em **HTML**, não em JSON (o
usuário pediu o formato errado por engano e depois solicitou de novo em
JSON). **Isso não é problema**: os dois formatos trazem o mesmo conteúdo —
mesmas fotos, mesmas datas, mesmas legendas — muda só o embrulho dos
metadados, e a pasta de mídia é idêntica. Não é preciso esperar o JSON, e o
export em HTML não deve ser apagado mesmo que o JSON chegue depois (as
fotos já baixadas são as mesmas, e re-baixar custa 4 GB).

**Por que não terminou:** os arquivos de metadados são grandes demais para
anexar na conversa. Foram tentados dois caminhos que não valem a pena e
ficam registrados para ninguém repetir:
1. Mandar as 3 GB para o Claude — **desnecessário**. As fotos vão da
   máquina do usuário direto para o Supabase Storage; só os metadados
   precisariam chegar aqui, e nem eles são indispensáveis (ver abaixo).
2. Passar o export do celular para o computador — **desnecessário também**:
   o link de download do Instagram funciona em qualquer aparelho enquanto
   está válido, então basta baixar de novo já no computador.

**Decisão do usuário ao encerrar:** ele vai **abrir o export no VS Code** e
combinar comigo a extração numa próxima conversa. Não quer separar foto por
foto manualmente.

## Como retomar

O usuário abre o export no VS Code e diz o que está vendo (estrutura de
pastas, nomes de arquivo). A partir daí eu escrevo o script de extração,
que roda **na máquina dele**, não aqui.

Duas coisas que já estão decididas e não precisam ser rediscutidas:

- **A curadoria é dele, não minha.** Eu não consigo ver se a foto ficou boa
  ou se representa bem o encontro. O que eu posso fazer é reduzir o
  universo — filtrar por período e gerar índice/miniaturas para ele
  escolher rápido.
- **O cruzamento por data é quase de graça**, porque o export organiza a
  mídia em pastas por mês (`media/posts/YYYYMM/`). As edições em
  `src/data/seed.ts`:

  | Edição | Data | Pasta esperada |
  |---|---|---|
  | 1ª — O início do movimento | 12/04/2025 | `202504` |
  | 2ª — Cultura e Gestão de Pessoas | 23/08/2025 | `202508` |
  | 3ª — Gestão Financeira na prática | 19/09/2026 | `202609` |

**Convenção de upload combinada** (o app monta a URL sozinho a partir
dela, então não é preciso copiar link nenhum):

```
media/edicao-1/foto-1.jpg …
media/edicao-2/foto-1.jpg …
media/edicao-3/foto-1.jpg …
```

→ `https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-2/foto-1.jpg`

**Antes de subir, reduzir para ~1600px de largura.** Foto de celular vem
com 2–4 MB e deixaria a retrospectiva lenta no 4G. Sem instalar nada dá
para usar um redimensionador em lote no navegador; com o VS Code aberto,
um script local resolve melhor.

**Do lado do app não falta nada:** `EventRecapModal` já detecta sozinho se
a URL é gradiente placeholder ou foto real e renderiza a imagem. Quando as
URLs entrarem em `recapMedia` (`src/data/seed.ts` + `supabase/seed.sql`),
as fotos aparecem sem tocar em `.tsx` nem `.css`.

## Também pendente, sem bloquear nada

- Rodar `supabase/schema.sql` + `seed.sql` atualizados (colunas
  `recap_text`/`recap_media`, do Módulo 9) no SQL Editor do Supabase real —
  ver `docs/SUPABASE.md`.
- Da auditoria de 26/08/2026, sobrou só o que é **decisão de produto**:
  tela de boas-vindas na primeira abertura (hoje a usuária cai direto no
  feed, sem nada explicando o que é a Tríade).
- O usuário mencionou "diversos arquivos do Drive". A busca no Drive dele
  só encontrou `.ts` de outro projeto — nada da Tríade. Ficou sem
  esclarecer o que são e onde estão.
