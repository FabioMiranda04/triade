# SPEC-002 — Assinatura e pagamento (Módulo 4)

**Status:** aprovada, não implementada.
**Depende de:** decisão comercial do usuário (provedor, CNPJ, preço final).
**É consumida por:** [SPEC-001](./SPEC-001-convite-de-membro.md) — quem paga
para de ver o convite.

## Problema

Hoje "escolher um plano" não cobra nada de ninguém. `db.choosePlan(id)`
grava a escolha (preferência local, ou linha em `plan_selections` quando há
usuária logada) e a conversa termina no WhatsApp, na mão. O app apresenta
preço, apresenta vantagens, e para exatamente onde o dinheiro começaria.

Consequência prática: **não existe fonte de verdade sobre quem é membra.**
Toda regra que dependa disso — o convite da SPEC-001, conteúdo exclusivo,
lista de presença de encontro — hoje pergunta "escolheu um plano?", que é
uma pergunta sobre intenção, não sobre pagamento.

## Decisão

### D1 — Três fases, e a primeira já cobra

A tentação é construir o fluxo completo (checkout + webhook + portal da
assinante) antes de a primeira mulher pagar. Não vamos: cada fase cobra
dinheiro de verdade e só existe porque a anterior apertou.

| Fase | O que é | O que exige | Quando promover |
|---|---|---|---|
| **0 — link de pagamento** | cada plano ganha uma URL de cobrança recorrente criada **no painel do provedor**, à mão. O app abre a URL. Confirmação continua no WhatsApp | conta no provedor. **Zero back-end** | é o começo |
| **1 — status real** | tabela `subscriptions` + webhook do provedor numa Edge Function. O app passa a *saber* quem pagou | Edge Function + segredo do webhook | quando conferir pagamento na mão virar trabalho (~15 assinantes) |
| **2 — checkout no app** | o app cria a cobrança pela API, com o e-mail da usuária já preenchido, e acompanha o estado | tudo da fase 1 | quando a fase 1 estiver estável e o volume justificar |

A fase 0 não é gambiarra: é o produto inteiro para quem tem dezenas de
assinantes, e é reversível — a URL sai do `seed.ts`, e a fase 1 substitui a
origem dela sem mexer na tela.

### D2 — O provedor precisa fazer recorrência com Pix

Requisito não-negociável do mercado daqui: **Pix**. Cartão sozinho perde
venda. Boleto é bônus.

| Provedor | A favor | Contra |
|---|---|---|
| **Asaas** (recomendado) | assinatura recorrente nativa com Pix, boleto e cartão; link de cobrança pronto para mandar no WhatsApp — que já é o canal da Tríade; cadastro simples para CNPJ pequeno | menos conhecido fora do Brasil; documentação mais enxuta |
| **Mercado Pago** | maior reconhecimento de marca na hora de pagar; `preapproval` para recorrência; Pix nativo | painel pesado; a API de assinatura tem casos de borda chatos |
| **Stripe** | melhor documentação e melhor webhook do mercado | **não faz Pix recorrente**; recorrência fica só no cartão |
| **Pagar.me** | recorrência sólida, é da Stone | onboarding mais burocrático para volume pequeno |

**Recomendação: Asaas**, por causa da fase 0 — link de cobrança recorrente
que dá para mandar por WhatsApp é literalmente o fluxo que a Tríade já usa,
só que cobrando. Se a preferência for marca conhecida na hora de pagar,
Mercado Pago é a troca certa e nada nesta spec muda além do nome do
provedor.

⚠️ **Taxas e prazos de repasse mudam e precisam ser conferidos na
contratação** — a tabela acima compara capacidade, não preço.

### D3 — Nenhuma chave secreta chega ao front-end

Regra 11 do `CLAUDE.md`, aplicada ao pagamento: a chave de API do provedor
e o segredo do webhook **nunca** entram numa variável `VITE_*` (o prefixo
publica o valor no bundle) nem em qualquer arquivo de `src/`.

Elas vivem como *secrets* da Edge Function do Supabase. O front-end só
conhece: a URL pública de cobrança (fase 0) ou o endpoint da própria Edge
Function (fase 2).

### D4 — Quem decide se está pago é o webhook, nunca a tela

A tela nunca escreve "assinatura ativa". Ela lê. O único que escreve é o
webhook, que chega do provedor com assinatura criptográfica conferida.

Sem isso, "sou membra" vira um `POST` que qualquer pessoa com o DevTools
aberto consegue mandar.

### D5 — `subscriptions` é uma tabela nova, e `plan_selections` continua

São coisas diferentes e as duas têm valor:

- `plan_selections` = **intenção**. "Ela clicou em Membra Tríade." Serve
  para saber o que as pessoas querem;
- `subscriptions` = **fato**. "O provedor confirmou o pagamento em 04/09,
  vence em 04/10."

Fundir as duas perderia a intenção de quem clicou e não pagou, que é
justamente a lista mais útil para a Tríade ligar de volta.

### D6 — A RLS de `subscriptions` é a mesma do resto

Cada usuária lê **só a própria linha** (`auth.uid() = user_id`). Ninguém
escreve pelo cliente — `INSERT`/`UPDATE` só pela Edge Function, que usa
`service_role` do lado do servidor. Admin lê tudo, pelo mesmo padrão de
`admins` que o Módulo 5 já usa.

Ninguém consegue listar quem são as assinantes: é o mesmo princípio que
tirou o diretório de membras do ar (v3.8.0) — a RLS permitir a leitura
nunca foi permissão para exibir.

## Contrato

### Banco (`supabase/schema.sql`, fase 1)

```sql
create table public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  plan_id       text not null,
  status        text not null check (status in ('ativa','atrasada','cancelada','pendente')),
  provedor      text not null,             -- 'asaas' | 'mercadopago' | ...
  provedor_ref  text not null,             -- id da assinatura no provedor
  valida_ate    timestamptz,               -- até quando o acesso vale
  criada_em     timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  unique (provedor, provedor_ref)
);
```

`unique (provedor, provedor_ref)` é o que torna o webhook **idempotente**:
provedor reenvia evento, e reenvia mesmo — sem essa restrição a segunda
entrega cria uma assinatura duplicada.

`valida_ate` existe para o acesso não cair no segundo em que um pagamento
atrasa. Cartão recusado às vezes é só o banco da pessoa; derrubar o acesso
na hora é hostil, e o provedor tenta de novo sozinho.

### Contrato do app (`src/lib/db/types.ts`, fase 1)

```ts
/** Assinatura da usuária logada. `null` = não tem. */
getAssinatura(): Promise<Assinatura | null>;

/** Fase 0: a URL de cobrança do plano. Fase 2: cria a cobrança e devolve a URL. */
getLinkDePagamento(planId: string): Promise<string | null>;
```

```ts
// src/types/index.ts
export interface Assinatura {
  planId: string;
  status: 'ativa' | 'atrasada' | 'cancelada' | 'pendente';
  validaAte: string | null;
}
```

### A regra, em função (`src/lib/assinatura.ts`, fase 1)

O mesmo padrão da SPEC-001: pura, sem `await`, sem React.

```ts
/** Acesso de membra vale? Atrasada com prazo ainda de pé continua valendo (D5). */
export function temAcesso(a: Assinatura | null, agora: Date): boolean;
```

E é **aqui** que a SPEC-001 se liga: `ehMembroPagante` passa a perguntar
`temAcesso(...)` em vez de olhar o preço do plano escolhido. Uma função
muda; o convite, a tela de Planos e o resto do app não sabem que algo
aconteceu.

### Edge Function (fase 1)

`supabase/functions/webhook-pagamento/index.ts`

1. confere a assinatura do evento com o segredo (rejeita o que não bater —
   **antes** de ler o corpo);
2. traduz o evento do provedor para um dos quatro `status`;
3. faz `upsert` em `subscriptions` por `(provedor, provedor_ref)`;
4. devolve `200` sempre que tiver processado — provedor que recebe erro
   reenvia, e reenviar um evento já aplicado só gera ruído.

## Aceite

**Fase 0**
- [ ] cada plano pago do `seed.ts` tem uma URL de cobrança recorrente;
- [ ] "Quero ser membro" abre a URL do plano em aba nova;
- [ ] plano gratuito continua sem link e sem cobrança;
- [ ] nenhuma chave de API no bundle: `grep -ri "api.key\|secret" dist/` limpo.

**Fase 1**
- [ ] pagamento de teste no sandbox do provedor cria linha em `subscriptions`;
- [ ] reenviar o mesmo evento **não** cria segunda linha;
- [ ] evento com assinatura inválida é rejeitado com `401` e não escreve nada;
- [ ] usuária A não consegue ler a linha da usuária B (testar com a chave `anon`);
- [ ] com assinatura ativa, o convite da SPEC-001 para de aparecer;
- [ ] cancelar no provedor derruba o acesso quando `valida_ate` passa, não antes.

## Fora de escopo

- **Cobrar dentro do app, sem sair** (Payment Request API / Apple Pay).
  Exige PCI e uma conversa com o provedor que não se paga neste volume.
- **Nota fiscal automática.** É integração de contabilidade, não de
  pagamento. Entra depois, se entrar.
- **Cupom e desconto.** Todo provedor da tabela faz isso pelo painel. O app
  não precisa saber que existe.
- **Assinatura anual com desconto.** Decisão comercial, não técnica — o
  `period` do `Plan` já aguenta.

## O que só o usuário pode decidir

1. **qual provedor** (D2) — muda o nome, não a spec;
2. **CNPJ para a conta** — todos exigem;
3. **preço final de cada plano**, que hoje no `seed.ts` é o valor de
   demonstração;
4. **o que acontece com quem para de pagar**: perde o acesso ao app inteiro,
   ou só ao que for exclusivo? Hoje o app não tem conteúdo exclusivo — então
   esta pergunta pode esperar a fase 1.
