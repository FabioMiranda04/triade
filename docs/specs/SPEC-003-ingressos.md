# SPEC-003 — Venda de ingresso por edição

**Status:** rascunho — contrato da API conferido na documentação da
InfinitePay em 05/10/2026, implementação não começou.
**Revisão de segurança:** 05/10/2026 — modelo de ameaça (A1–A12) e bateria
de autossabotagem (S1–S14) na seção *Segurança*. Falhar em qualquer S
bloqueia o lançamento da venda.
**Decidido pelo usuário (05/10/2026):** provedor **InfinitePay Checkout**;
compra **só para usuária logada**; **preço definido pelas sócias**, por
quem tem login de admin (D7).
**Precede:** [SPEC-002](./SPEC-002-pagamento.md). A assinatura continua
desenhada e parada na fase 0 — **ingresso vem primeiro**, porque é o que a
Tríade precisa vender agora.
**Reaproveita da SPEC-002:** a D3 (nenhum segredo no front-end) e a D4
(quem decide se está pago é o servidor, nunca a tela) valem aqui inteiras.

## Problema

O app anuncia as edições e tem RSVP (`rsvpEvent`), que é **confirmação de
interesse, não compra**. Quem quer ir paga por WhatsApp, na mão, com uma
sócia conferindo comprovante. Isso tem três custos:

1. **não escala na véspera.** O pico de vendas de um encontro é nos dias
   finais, exatamente quando as três sócias estão produzindo o evento;
2. **não existe lista confiável de quem pagou.** `hasRsvp` responde "ela
   clicou", que não é "ela pagou" — o mesmo buraco que a SPEC-002 descreve
   para assinatura;
3. **o QR do outdoor não tem para onde levar.** A landing manda para o
   WhatsApp porque não há compra. Com ingresso no app, o funil fecha.

## Decisão

### D1 — Ingresso é do evento, não um produto à parte

Sem catálogo, sem carrinho, sem tipos de ingresso. `TriadeEvent` ganha
preço, e cada edição vende a si mesma. Lote, meia-entrada e combo são
exatamente o tipo de flexibilidade especulativa que a R7 e a `ponytail`
mandam não construir antes de alguém pedir.

### D2 — Quem cria a cobrança é o servidor, nunca a tela

O endpoint de criação de link da InfinitePay é público: aceita `handle` e
os `items` com preço, **sem chave de API**. Isso significa que criar o
checkout no front-end deixaria o **preço na mão de quem compra** — abrir o
DevTools e trocar `price` por `100` compraria o ingresso por R$ 1,00.

Então a Edge Function não existe só para guardar segredo: ela existe porque
**o preço tem de sair do nosso banco**, não do navegador. O front manda
`eventId`; o servidor busca o preço, monta o pedido e devolve a URL.

### D7 — O preço é conteúdo, e quem edita são as sócias

Não é constante no `seed.ts` nem variável de ambiente: é **campo do evento**,
editado no app, no mesmo `EventEditSheet` onde já se edita local, tema e
número de vagas. Entra ao lado de `spots`, que já é um campo numérico — e
quem vê o lápis é quem `podeEditarConteudo()` deixa, ou seja, quem está na
tabela `admins`. Nenhuma tela nova, nenhuma permissão nova.

Isso tem três consequências que **não** são detalhe:

1. **a proteção do preço é a RLS, não a interface.** Esconder o campo de
   quem não é admin é conveniência; o que de fato impede uma usuária comum
   de mudar o preço é a política da tabela `events` no Supabase. A regra já
   existe e é a mesma do Módulo 5 — esta spec não inventa permissão, usa a
   que está lá;

2. **a edição local não pode contaminar a venda.** O app tem um overlay de
   edição no navegador (`localContent.ts`) para quem não é admin ou está
   sem Supabase. Alguém pode "editar" o preço ali e ver R$ 1,00 na própria
   tela. Isso é inofensivo **porque a Edge Function lê o preço do Supabase,
   nunca do cliente** (D2) — a tela mente só para quem mentiu para si mesma,
   e a cobrança sai certa. Vale testar isso explicitamente;

3. **mudar o preço não pode mexer em quem já comprou.** Por isso `tickets`
   guarda `valor_centavos` no momento da compra: o `payment_check` confere
   o pagamento contra **o que foi cobrado naquele pedido**, não contra o
   preço atual do evento. Sócia que corrige o preço às 22h não invalida o
   ingresso vendido às 20h.

Quem entra na tabela `admins` continua sendo decidido pelo SQL Editor do
painel, como no Módulo 5. Esta spec não afrouxa isso.

### D3 — O webhook da InfinitePay **não é assinado** — e isso muda tudo

A SPEC-002 D4 presumia "webhook com assinatura criptográfica conferida".
**A InfinitePay não assina.** O corpo que chega é um POST sem autenticação:
qualquer pessoa que descubra a URL da função pode mandar "pago".

Portanto o webhook é tratado como **aviso, não como prova**:

1. chega o webhook → serve só para dizer *qual pedido olhar*;
2. a função chama `payment_check` na InfinitePay com `order_nsu` e
   `transaction_nsu`;
3. **só a resposta do `payment_check` escreve "pago"** no nosso banco;
4. confere também o **valor**: `paid_amount` tem de bater com o preço do
   evento no nosso banco. Pagou menos, não vale.

Sem o passo 2, "ingresso pago" vira um `curl` que qualquer um manda.

### D4 — `order_nsu` é nosso, e é a chave da idempotência

`order_nsu` é o identificador do pedido no **nosso** sistema. Geramos um
uuid por tentativa de compra e guardamos antes de mandar para a InfinitePay.
É ele que amarra webhook → pedido, e `unique` nele é o que impede o
reenvio do webhook (que a doc deles promete: erro 400 → reenviam) de criar
dois ingressos.

### D5 — Compra exige login (decisão do usuário)

Diferente do que eu recomendaria para conversão, e é uma decisão legítima:
amarra o ingresso à pessoa e prepara o controle de presença dentro do app.

Consequência a assumir: quem vem do QR do outdoor bate num cadastro antes
de pagar. Para não perder essa pessoa, o login da compra deve ser o mais
curto que o app já tem (Google), e a tela precisa dizer **por que** pede
conta — "seu ingresso fica salvo no app" — não só pedir.

### D6 — RSVP continua existindo e não vira compra

Mesma lógica da SPEC-002 D5: `event_rsvps` é **intenção**, `tickets` é
**fato**. Quem clicou "vou" e não pagou é a lista mais útil que a Tríade
tem para ligar de volta na véspera. Fundir perde isso.

Na tela, com ingresso à venda, o botão principal passa a ser comprar; o
RSVP vira ação secundária para quem ainda não decidiu.

### D8 — Não mandamos dado pessoal para a InfinitePay

O `customer` (nome, e-mail, telefone) e o `address` são **opcionais** na API
deles. Ficam de fora.

Não precisamos: `order_nsu` já amarra o pedido à usuária **no nosso banco**.
Mandar nome e e-mail só acrescentaria uma cópia do dado pessoal num terceiro
que não precisa dele — e cada cópia é mais uma superfície para vazar e mais
um titular a notificar se vazar.

O custo é pequeno e conhecido: a compradora digita os próprios dados no
checkout, se ele pedir. Uma tela a mais, em troca de não espalhar o
cadastro das mulheres da comunidade.

## Segurança

Esta seção existe porque o que esta spec move não é só dinheiro. A lista de
quem comprou ingresso é **uma lista de mulheres com nome, e-mail, e um
lugar e uma hora onde elas vão estar**. Isso é mais sensível que dado
comercial, e o app já tem um precedente: em 03/09/2026 a política de
`profiles` era `using (true)` para logadas — bastava criar uma conta para
ler a tabela inteira. Foi corrigido, está comentado no `schema.sql`, e é o
erro que esta seção existe para não repetir.

**O que nos protege de graça:** cartão **nunca toca o app**. O dado de
cartão vive e morre na InfinitePay — não passa pelo nosso front, não passa
pela Edge Function, não entra no nosso banco. Isso tira do escopo a classe
inteira de risco de PCI. Nenhuma decisão desta spec pode desfazer isso.

### Modelo de ameaça

| # | Ataque | Onde | Defesa | Decisão |
|---|---|---|---|---|
| A1 | trocar o preço no DevTools e comprar por R$ 1 | criação do pedido | preço lido do Supabase pelo servidor; o corpo do cliente só traz `eventId` | D2 |
| A2 | `POST` no webhook dizendo "pago", sem pagar | webhook (público por natureza) | o corpo é **aviso**; só `payment_check` escreve `pago` | D3 |
| A3 | pagar R$ 1 e reivindicar ingresso de R$ 97 | webhook | `paid_amount` conferido contra `valor_centavos` **do pedido** | D3 |
| A4 | reenviar o webhook para gerar ingressos | webhook | `unique (order_nsu)` | D4 |
| A5 | ler o ingresso de outra mulher | tabela `tickets` | RLS `auth.uid() = user_id`; cliente **nunca** escreve | contrato |
| A6 | **listar quem comprou** | tabela `tickets` | mesma RLS: não existe leitura que devolva linha de terceiro. Lista de presença é tela de admin, nunca endpoint aberto | contrato |
| A7 | adivinhar `order_nsu` de outra pessoa | URL / webhook | `order_nsu` é **uuid v4**, não sequencial. Sequencial permitiria varrer pedidos | D4 |
| A8 | usar o webhook como oráculo ("esse pedido existe?") | webhook | resposta **sempre** `200 {"success": true, "message": null}`, não importa o que foi achado. Nunca "pedido não encontrado" | abaixo |
| A9 | chamar `criar-pedido` sem login | Edge Function | exige JWT; sem ele `401` antes de qualquer leitura | D5 |
| A10 | ler segredo no bundle | front-end | nada de pagamento em `VITE_*`; `handle` só na Edge Function | R11 / D3 da SPEC-002 |
| A11 | vazar dado pessoal pelo log | Edge Function | **nunca** logar corpo de webhook nem e-mail. Só `order_nsu` e status | abaixo |
| A12 | usuária comum muda o preço | tabela `events` | RLS por `e_admin()`. Esconder o campo é conveniência, não proteção | D7 |

Dois itens acima não são óbvios e merecem o porquê:

**A8 — o webhook não pode responder a verdade.** A tentação é devolver
`404` quando o `order_nsu` não existe. Isso transforma o endpoint num
oráculo: quem quiser descobrir se um pedido existe é só perguntar. Como a
doc da InfinitePay exige `200 {"success": true, "message": null}` para
sucesso e trata `400` como "reenvie", a resposta uniforme é ao mesmo tempo
o comportamento correto para eles e o seguro para nós.

**A11 — log é vazamento com outro nome.** Log de Edge Function é lido por
quem tem acesso ao painel do Supabase, fica retido, e vai parar em captura
de tela. O corpo do webhook traz `items` com a descrição do pedido; o
`payment_check` traz dados da transação. Nada disso vai para o log. Regra:
loga-se `order_nsu` e a decisão (`pago` / `recusado` / `valor-nao-bate`), e
nada mais.

### Autossabotagem — a bateria que tenta quebrar o próprio sistema

Nenhum destes é hipótese: cada um é um comando que alguém roda **antes** de
a venda abrir. Falhar em qualquer um bloqueia o lançamento.

**Contra o webhook (os mais importantes)**

```bash
# S1 — webhook forjado. DEVE devolver 200 e NÃO marcar nada no banco.
curl -X POST "$URL_WEBHOOK" -H 'Content-Type: application/json'   -d '{"order_nsu":"<pedido real e pendente>","transaction_nsu":"999","paid_amount":9700}'
# aceite: a linha continua `pendente`. Se virou `pago`, a D3 não foi implementada.

# S2 — pagamento menor. Pague R$ 1 num pedido de R$ 97 no sandbox.
# aceite: continua `pendente`; log registra `valor-nao-bate`.

# S3 — reenvio. Mande o MESMO webhook válido duas vezes.
# aceite: um ingresso, não dois.

# S4 — oráculo. Mande order_nsu que não existe.
# aceite: resposta idêntica à do S1. Qualquer diferença de corpo, status ou
#         tempo de resposta que distinga "existe" de "não existe" reprova.
```

**Contra o banco, com a chave `anon` (a que está no bundle)**

```bash
# S5 — ler ingresso dos outros, logada como A:
#   supabase.from('tickets').select('*')
# aceite: devolve SÓ as linhas de A. Qualquer linha de terceiro reprova.

# S6 — contar compradoras sem ver os nomes:
#   supabase.from('tickets').select('*', { count: 'exact', head: true })
# aceite: a contagem também respeita a RLS. Contagem global vazaria
#         quantas mulheres compraram — é metadado, e metadado vaza.

# S7 — escrever direto, pulando a Edge Function:
#   supabase.from('tickets').insert({ status: 'pago', ... })
# aceite: recusado. Não existe política de INSERT para o cliente.

# S8 — marcar o próprio ingresso como pago:
#   supabase.from('tickets').update({ status: 'pago' }).eq('user_id', <eu>)
# aceite: recusado. "É minha linha" não dá direito de escrever nela.

# S9 — virar admin:
#   supabase.from('admins').insert({ user_id: <eu> })
# aceite: recusado.

# S10 — descobrir quem são as admins:
#   supabase.from('admins').select('*')
# aceite: devolve no máximo a própria linha.

# S11 — mudar o preço sem ser admin:
#   supabase.from('events').update({ ticket_price_cents: 100 }).eq('id', ...)
# aceite: recusado pelo BANCO, não pela interface.
```

**Contra o front**

```bash
# S12 — segredo no bundle:
npm run build && grep -riE "service_role|infinitepay|handle.*=|api[_-]?key" dist/assets/*.js
# aceite: nenhuma ocorrência que não seja código de biblioteca. Conferir
#         o contexto de cada casamento — `apiKey` do cliente Supabase é
#         falso positivo conhecido.

# S13 — preço mentido no overlay local:
# edite o preço pelo overlay (sem ser admin), compre, e confira o valor
# cobrado no checkout.
# aceite: cobra o preço REAL, do Supabase. A tela mentiu, a cobrança não.
```

**Teste humano, que nenhum `curl` cobre**

- **S14 — a lista de presença.** Peça a uma sócia que mostre a lista de
  compradoras pelo app. Depois peça a mesma coisa a uma usuária comum. Se
  a segunda conseguir ver qualquer nome que não o próprio, está vazando —
  e é exatamente o vazamento que mais importa aqui.

### LGPD, em três linhas que importam

Vender ingresso cria relação de consumo e trata dado pessoal. Três coisas
que já são decisão desta spec, e não burocracia:

1. **minimização** — não mandamos PII para a InfinitePay (D8), e o app não
   coleta nada novo para vender ingresso: usa a conta que já existe;
2. **finalidade** — o dado da compra serve para emitir e conferir o
   ingresso. Usar a lista de compradoras para marketing é outra finalidade,
   e precisa de consentimento próprio. Não está nesta spec;
3. **retenção** — ingresso de evento passado não precisa ficar para sempre.
   Definir prazo é pendência do usuário, não minha.

## Contrato

### Banco (`supabase/schema.sql`)

```sql
create table public.tickets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  event_id        text not null,
  order_nsu       text not null unique,      -- nosso id; idempotência (D4)
  transaction_nsu text,                      -- id da InfinitePay, chega no webhook
  status          text not null check (status in ('pendente','pago','cancelado')),
  valor_centavos  integer not null,          -- o que COBRAMOS, para conferir (D3)
  receipt_url     text,
  criado_em       timestamptz not null default now(),
  pago_em         timestamptz
);
```

RLS igual ao resto do app: cada usuária lê só a própria linha
(`auth.uid() = user_id`); **ninguém escreve pelo cliente** — só a Edge
Function, com `service_role`. Admin lê tudo pelo padrão da tabela `admins`.

### Tipo (`src/types/index.ts`)

```ts
export interface TriadeEvent {
  // …
  /** preço do ingresso em centavos. `null`/ausente = edição sem venda. */
  ticketPriceCents?: number | null;
}
```

Centavos, não reais: a API da InfinitePay cobra em centavos, e dinheiro em
ponto flutuante é um erro esperando a conta fechar errado. A tela mostra em
reais (`formatPrice`); o campo de edição recebe em reais e converte na
gravação — ninguém deve digitar "9700" para dizer R$ 97,00.

### Edição (`src/components/EventEditSheet.tsx`, D7)

Um campo a mais, ao lado de "Vagas", visível só para quem
`podeEditarConteudo()`:

```
Ingresso (R$)   [ 97,00 ]   — vazio = edição sem venda
```

Vazio grava `null`, e `null` é o que faz a edição não vender nada. Não
existe "preço zero": grátis e sem venda são a mesma coisa aqui, e um
caminho só é menos coisa para errar.

#### D8 — Não mandamos dado pessoal para a InfinitePay

O `customer` (nome, e-mail, telefone) e o `address` são **opcionais** na API
deles. Ficam de fora.

Não precisamos: `order_nsu` já amarra o pedido à usuária **no nosso banco**.
Mandar nome e e-mail só acrescentaria uma cópia do dado pessoal num terceiro
que não precisa dele — e cada cópia é mais uma superfície para vazar e mais
um titular a notificar se vazar.

O custo é pequeno e conhecido: a compradora digita os próprios dados no
checkout, se ele pedir. Uma tela a mais, em troca de não espalhar o
cadastro das mulheres da comunidade.

## Segurança

Esta seção existe porque o que esta spec move não é só dinheiro. A lista de
quem comprou ingresso é **uma lista de mulheres com nome, e-mail, e um
lugar e uma hora onde elas vão estar**. Isso é mais sensível que dado
comercial, e o app já tem um precedente: em 03/09/2026 a política de
`profiles` era `using (true)` para logadas — bastava criar uma conta para
ler a tabela inteira. Foi corrigido, está comentado no `schema.sql`, e é o
erro que esta seção existe para não repetir.

**O que nos protege de graça:** cartão **nunca toca o app**. O dado de
cartão vive e morre na InfinitePay — não passa pelo nosso front, não passa
pela Edge Function, não entra no nosso banco. Isso tira do escopo a classe
inteira de risco de PCI. Nenhuma decisão desta spec pode desfazer isso.

### Modelo de ameaça

| # | Ataque | Onde | Defesa | Decisão |
|---|---|---|---|---|
| A1 | trocar o preço no DevTools e comprar por R$ 1 | criação do pedido | preço lido do Supabase pelo servidor; o corpo do cliente só traz `eventId` | D2 |
| A2 | `POST` no webhook dizendo "pago", sem pagar | webhook (público por natureza) | o corpo é **aviso**; só `payment_check` escreve `pago` | D3 |
| A3 | pagar R$ 1 e reivindicar ingresso de R$ 97 | webhook | `paid_amount` conferido contra `valor_centavos` **do pedido** | D3 |
| A4 | reenviar o webhook para gerar ingressos | webhook | `unique (order_nsu)` | D4 |
| A5 | ler o ingresso de outra mulher | tabela `tickets` | RLS `auth.uid() = user_id`; cliente **nunca** escreve | contrato |
| A6 | **listar quem comprou** | tabela `tickets` | mesma RLS: não existe leitura que devolva linha de terceiro. Lista de presença é tela de admin, nunca endpoint aberto | contrato |
| A7 | adivinhar `order_nsu` de outra pessoa | URL / webhook | `order_nsu` é **uuid v4**, não sequencial. Sequencial permitiria varrer pedidos | D4 |
| A8 | usar o webhook como oráculo ("esse pedido existe?") | webhook | resposta **sempre** `200 {"success": true, "message": null}`, não importa o que foi achado. Nunca "pedido não encontrado" | abaixo |
| A9 | chamar `criar-pedido` sem login | Edge Function | exige JWT; sem ele `401` antes de qualquer leitura | D5 |
| A10 | ler segredo no bundle | front-end | nada de pagamento em `VITE_*`; `handle` só na Edge Function | R11 / D3 da SPEC-002 |
| A11 | vazar dado pessoal pelo log | Edge Function | **nunca** logar corpo de webhook nem e-mail. Só `order_nsu` e status | abaixo |
| A12 | usuária comum muda o preço | tabela `events` | RLS por `e_admin()`. Esconder o campo é conveniência, não proteção | D7 |

Dois itens acima não são óbvios e merecem o porquê:

**A8 — o webhook não pode responder a verdade.** A tentação é devolver
`404` quando o `order_nsu` não existe. Isso transforma o endpoint num
oráculo: quem quiser descobrir se um pedido existe é só perguntar. Como a
doc da InfinitePay exige `200 {"success": true, "message": null}` para
sucesso e trata `400` como "reenvie", a resposta uniforme é ao mesmo tempo
o comportamento correto para eles e o seguro para nós.

**A11 — log é vazamento com outro nome.** Log de Edge Function é lido por
quem tem acesso ao painel do Supabase, fica retido, e vai parar em captura
de tela. O corpo do webhook traz `items` com a descrição do pedido; o
`payment_check` traz dados da transação. Nada disso vai para o log. Regra:
loga-se `order_nsu` e a decisão (`pago` / `recusado` / `valor-nao-bate`), e
nada mais.

### Autossabotagem — a bateria que tenta quebrar o próprio sistema

Nenhum destes é hipótese: cada um é um comando que alguém roda **antes** de
a venda abrir. Falhar em qualquer um bloqueia o lançamento.

**Contra o webhook (os mais importantes)**

```bash
# S1 — webhook forjado. DEVE devolver 200 e NÃO marcar nada no banco.
curl -X POST "$URL_WEBHOOK" -H 'Content-Type: application/json'   -d '{"order_nsu":"<pedido real e pendente>","transaction_nsu":"999","paid_amount":9700}'
# aceite: a linha continua `pendente`. Se virou `pago`, a D3 não foi implementada.

# S2 — pagamento menor. Pague R$ 1 num pedido de R$ 97 no sandbox.
# aceite: continua `pendente`; log registra `valor-nao-bate`.

# S3 — reenvio. Mande o MESMO webhook válido duas vezes.
# aceite: um ingresso, não dois.

# S4 — oráculo. Mande order_nsu que não existe.
# aceite: resposta idêntica à do S1. Qualquer diferença de corpo, status ou
#         tempo de resposta que distinga "existe" de "não existe" reprova.
```

**Contra o banco, com a chave `anon` (a que está no bundle)**

```bash
# S5 — ler ingresso dos outros, logada como A:
#   supabase.from('tickets').select('*')
# aceite: devolve SÓ as linhas de A. Qualquer linha de terceiro reprova.

# S6 — contar compradoras sem ver os nomes:
#   supabase.from('tickets').select('*', { count: 'exact', head: true })
# aceite: a contagem também respeita a RLS. Contagem global vazaria
#         quantas mulheres compraram — é metadado, e metadado vaza.

# S7 — escrever direto, pulando a Edge Function:
#   supabase.from('tickets').insert({ status: 'pago', ... })
# aceite: recusado. Não existe política de INSERT para o cliente.

# S8 — marcar o próprio ingresso como pago:
#   supabase.from('tickets').update({ status: 'pago' }).eq('user_id', <eu>)
# aceite: recusado. "É minha linha" não dá direito de escrever nela.

# S9 — virar admin:
#   supabase.from('admins').insert({ user_id: <eu> })
# aceite: recusado.

# S10 — descobrir quem são as admins:
#   supabase.from('admins').select('*')
# aceite: devolve no máximo a própria linha.

# S11 — mudar o preço sem ser admin:
#   supabase.from('events').update({ ticket_price_cents: 100 }).eq('id', ...)
# aceite: recusado pelo BANCO, não pela interface.
```

**Contra o front**

```bash
# S12 — segredo no bundle:
npm run build && grep -riE "service_role|infinitepay|handle.*=|api[_-]?key" dist/assets/*.js
# aceite: nenhuma ocorrência que não seja código de biblioteca. Conferir
#         o contexto de cada casamento — `apiKey` do cliente Supabase é
#         falso positivo conhecido.

# S13 — preço mentido no overlay local:
# edite o preço pelo overlay (sem ser admin), compre, e confira o valor
# cobrado no checkout.
# aceite: cobra o preço REAL, do Supabase. A tela mentiu, a cobrança não.
```

**Teste humano, que nenhum `curl` cobre**

- **S14 — a lista de presença.** Peça a uma sócia que mostre a lista de
  compradoras pelo app. Depois peça a mesma coisa a uma usuária comum. Se
  a segunda conseguir ver qualquer nome que não o próprio, está vazando —
  e é exatamente o vazamento que mais importa aqui.

### LGPD, em três linhas que importam

Vender ingresso cria relação de consumo e trata dado pessoal. Três coisas
que já são decisão desta spec, e não burocracia:

1. **minimização** — não mandamos PII para a InfinitePay (D8), e o app não
   coleta nada novo para vender ingresso: usa a conta que já existe;
2. **finalidade** — o dado da compra serve para emitir e conferir o
   ingresso. Usar a lista de compradoras para marketing é outra finalidade,
   e precisa de consentimento próprio. Não está nesta spec;
3. **retenção** — ingresso de evento passado não precisa ficar para sempre.
   Definir prazo é pendência do usuário, não minha.

## Contrato do app (`src/lib/db/types.ts`)

```ts
/** Cria o pedido e devolve a URL de checkout. Exige login (D5). */
comprarIngresso(eventId: string): Promise<string>;

/** Ingresso da usuária logada para a edição. `null` = não tem. */
getIngresso(eventId: string): Promise<Ingresso | null>;
```

### A regra, em função (`src/lib/ingresso.ts`)

Mesmo padrão da SPEC-001: pura, sem `await`, sem React.

```ts
/** A edição está vendendo? Precisa de preço, de vaga e de não ter passado. */
export function estaVendendo(evento: TriadeEvent, agora: Date): boolean;

/** O que o botão da edição deve oferecer, dado o estado da usuária. */
export function acaoDoEvento(
  evento: TriadeEvent, ingresso: Ingresso | null, logada: boolean, agora: Date,
): 'comprar' | 'entrar-para-comprar' | 'ver-ingresso' | 'rsvp' | 'esgotado' | 'encerrado';
```

### Edge Functions (`supabase/functions/`)

**`criar-pedido`** — chamada pelo app, exige JWT da usuária:
1. confere o login; sem ele, `401`;
2. lê o **preço do nosso banco** pelo `eventId` (nunca do corpo — D2);
3. gera `order_nsu` e grava `tickets` com status `pendente`;
4. `POST https://api.checkout.infinitepay.io/links` com `handle`,
   `order_nsu`, `redirect_url`, `webhook_url` e `items`
   (`{quantity, price, description}`, preço **em centavos**);
5. devolve a `url` do checkout.

**`webhook-ingresso`** — chamada pela InfinitePay, **sem autenticação**:
1. lê `order_nsu` e `transaction_nsu` do corpo — e **não confia neles**;
2. `POST https://api.checkout.infinitepay.io/payment_check` com `handle`,
   `order_nsu`, `transaction_nsu`, `slug`;
3. só se o `payment_check` disser pago **e** o valor bater com
   `valor_centavos` do nosso banco: marca `pago`, grava `pago_em` e
   `receipt_url`;
4. responde `200` com `{"success": true, "message": null}` — é o formato que
   a doc deles exige. Erro `400` faz a InfinitePay reenviar, o que é o
   comportamento certo para falha temporária e ruído para evento já aplicado.

Segredos (`INFINITEPAY_HANDLE` e o que mais a conta exigir) são *secrets*
da Edge Function. Nada em `VITE_*` — R11 e SPEC-002 D3.

## Aceite

- [ ] sócia com login de admin edita o preço no `EventEditSheet` e a
      mudança aparece para todo mundo (D7);
- [ ] usuária **não** admin não vê o campo — e, se forçar a gravação, a RLS
      recusa: a interface não é a proteção;
- [ ] preço alterado no overlay local **não** muda o valor cobrado: a Edge
      Function lê do Supabase (D2/D7);
- [ ] mudar o preço do evento **não** altera `valor_centavos` de ingresso
      já comprado;
- [ ] edição com `ticketPriceCents` mostra botão de compra; sem ele, a tela
      é a de hoje;
- [ ] deslogada, o botão leva ao login explicando por quê (D5), não ao
      checkout;
- [ ] compra de teste no sandbox cria linha `pendente` e devolve URL;
- [ ] pagar no checkout vira `pago` **via `payment_check`**, não pelo corpo
      do webhook;
- [ ] `curl` direto na URL do webhook dizendo "pago", sem pagamento real,
      **não** marca nada — é o teste que prova a D3;
- [ ] webhook com valor menor que `valor_centavos` não marca pago;
- [ ] reenviar o mesmo webhook não cria segundo ingresso (D4);
- [ ] usuária A não lê o ingresso da usuária B com a chave `anon`;
- [ ] RSVP continua funcionando e independente da compra (D6);
- [ ] `grep -ri "handle\|secret\|api.key" dist/` limpo;
- [ ] **a bateria de autossabotagem (S1–S14) passa inteira.** Não é
      checklist de qualidade: é porta de lançamento. Um `curl` que marca
      ingresso como pago, ou uma consulta que devolve a linha de outra
      mulher, bloqueia a venda até ser corrigido.

## Fora de escopo

- **Check-in na portaria / QR do ingresso.** É outra tela e outro fluxo;
  entra quando a venda estiver de pé e houver fila para conferir.
- **Reembolso e cancelamento pelo app.** Painel da InfinitePay resolve, e
  o volume não justifica tela.
- **Lote, meia-entrada, cupom, combo** (D1).
- **Nota fiscal.** Igual à SPEC-002: é contabilidade, não pagamento.
- **Transferir ingresso para outra pessoa.** Real, mas depois.
- **Desconto para membra.** Fora por decisão do usuário (05/10/2026), e o
  motivo é jurídico, não técnico: o plano Convidada promete hoje "desconto
  no 1º encontro presencial" e **nada no app implementa isso**. Promessa
  publicada que o produto não cumpre é exposição desnecessária — oferta
  anunciada e não honrada é reclamável pelo CDC. Enquanto o desconto não
  for regra escrita e implementada, a saída segura é não vinculá-lo à venda
  de ingresso. **Pendência fora desta spec:** revisar o texto do plano
  Convidada no `seed.ts`, que continua prometendo.

## O que só o usuário pode decidir

1. **o `handle`** (InfiniteTag) da conta InfinitePay;
2. ~~**preço do ingresso** de cada edição~~ — **resolvido em 05/10/2026**:
   as sócias definem no app, pelo `EventEditSheet` (D7). Não precisa passar
   por mim nem por deploy;
4. **o que acontece com quem paga e não vai** — política de reembolso
   precisa existir em texto antes de a primeira venda acontecer.
