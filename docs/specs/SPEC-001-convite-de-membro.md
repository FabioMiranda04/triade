# SPEC-001 — Quando o convite de membro aparece

**Status:** implementada — 04/09/2026
**Substitui:** a regra "uma vez por aparelho" registrada na v3.8.0 do
`CHANGELOG.md` e no comentário de `src/components/BoasVindas.tsx`.

## Problema

O convite para virar membra aparecia **uma única vez por aparelho, para
sempre**. Quem abriu o app no dia em que instalou nunca mais viu — e é o
único lugar do app que apresenta o plano premium a quem ainda não é membra.
Um convite que aparece uma vez e some não promove nada: ele compete com a
primeira abertura, que é justamente o momento em que a pessoa está olhando
tudo pela primeira vez e ainda não sabe o que a Tríade é.

O argumento antigo — "pop-up que reaparece ensina a fechar rápido" —
continua verdadeiro, mas ele vale para pop-up que reaparece **dentro da
mesma sessão**, a cada navegação. Uma vez por abertura do app é outra
coisa: é a mesma cadência de qualquer app que vende assinatura.

## Decisão

**D1 — uma vez por abertura do app.** Reabriu o app, o convite volta.
Navegar entre telas, recarregar a página ou voltar do segundo plano **não**
conta como abertura nova.

*Implementação da fronteira:* `sessionStorage`. Ele morre quando a
aba/janela do app fecha e sobrevive a recarregar e a navegar — que é
exatamente a definição de "abertura" que a D1 quer. `localStorage`
sobreviveria demais (é o que causava o problema) e uma variável em memória
sobreviveria de menos (voltaria a cada F5).

**D2 — nunca para quem já paga.** Se a pessoa escolheu um plano **pago**
(`price > 0`), o convite não aparece nunca. Vender de novo para quem já
comprou é o jeito mais rápido de parecer que o app não sabe quem ela é.

**D3 — plano grátis não silencia o convite.** Escolher o plano gratuito é
justamente o perfil que o convite existe para converter. Ele continua vendo.
Esta é a mudança de regra em relação ao comportamento anterior, onde
*qualquer* plano escolhido silenciava o convite.

**D4 — o plano promovido é o `featured`.** Sem `featured` definido, cai
para o primeiro plano **pago** da lista; sem nenhum plano pago, o primeiro
da lista. A regra antiga usava a posição (`planos[1]`), o que quebra em
silêncio quando alguém reordena os planos.

**D5 — 900ms depois da tela desenhar.** Inalterado. Cair por cima de uma
tela ainda montando lê como erro, não como convite.

**D6 — o convite marca "visto" ao ser decidido, não ao ser fechado.**
Se marcasse no fechar, uma pessoa que ignora o pop-up e recarrega a página
o veria de novo na mesma sessão — o que a D1 proíbe.

## Contrato

Toda a regra vive em **`src/lib/convite.ts`**, sem React, sem I/O, sem
`await`. Mudar a cadência do convite é mudar `decidirConvite`, e nada mais.

```ts
export interface ContextoConvite {
  /** catálogo de planos, como vem de `db.getPlans()` */
  planos: Plan[];
  /** id do plano escolhido, como vem de `db.getChosenPlan()`; `null` = nenhum */
  planoEscolhidoId: string | null;
  /** o convite já foi decidido nesta abertura do app? */
  vistoNestaAbertura: boolean;
}

/** A decisão inteira. Devolve o plano a promover, ou `null` para não abrir. */
export function decidirConvite(ctx: ContextoConvite): Plan | null;

/** D2/D3: paga = `price > 0`. Plano grátis não conta. */
export function ehMembroPagante(planos: Plan[], escolhidoId: string | null): boolean;

/** D4: `featured` → primeiro pago → primeiro da lista. */
export function planoParaPromover(planos: Plan[]): Plan | null;
```

A fronteira da sessão vive em **`src/lib/db/prefs.ts`** (regra 5 do
`CLAUDE.md`: componente nenhum fala com storage direto):

```ts
export function getFlagSessao(key: string): boolean;
export function setFlagSessao(key: string): void;
```

`src/components/BoasVindas.tsx` fica com o que sobrou, que é o trabalho
dele: buscar o estado, chamar `decidirConvite`, desenhar.

### O gancho para o pagamento

`ehMembroPagante` é o **único** ponto que responde "essa pessoa já é
membra?". Quando a SPEC-002 entrar, "já paga" deixa de ser "escolheu um
plano de preço maior que zero" e passa a ser "tem assinatura ativa". A
troca acontece dentro dessa função e do que a alimenta — o pop-up, a tela e
o resto do app não mudam uma linha. Foi por isso que a decisão foi separada
do componente antes de o pagamento existir, e não depois.

## Aceite

- [x] `npm run build` verde;
- [x] abrir o app sem plano escolhido → convite aparece;
- [x] fechar o convite e navegar entre as 5 telas → não reaparece;
- [x] recarregar a página na mesma aba → não reaparece;
- [x] fechar a aba/o app e abrir de novo → reaparece;
- [x] escolher um plano pago → não aparece mais, em nenhuma abertura;
- [x] `npm run auditoria` continua medindo a tela e não o pop-up (o script
      marca a flag de sessão, não a preferência antiga);
- [x] `localStorage` bloqueado (aba anônima restrita) não derruba o app —
      `getFlagSessao` devolve `false` e o convite simplesmente aparece.

## Fora de escopo

- **"Não mostrar de novo" com caixinha de marcar.** Seria a volta do
  comportamento antigo por outro nome. Se o convite incomodar de verdade, o
  sinal chega como reclamação e a D1 muda — na função, em uma linha.
- **Contar quantas vezes a pessoa fechou** para espaçar o convite (mostrar
  a cada 3 aberturas depois da 5ª recusa, esse tipo de coisa). É afinação
  de métrica, e não existe métrica ainda. `decidirConvite` já recebe um
  contexto: quando existir número, ele entra ali.
- **Convite diferente por origem** (quem chegou pelo QR code do outdoor vs.
  quem instalou). Depende de rastreamento que o app não tem.
