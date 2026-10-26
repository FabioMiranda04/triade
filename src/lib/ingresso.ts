import type { Ingresso, TriadeEvent } from '@/types';

/**
 * A regra da venda de ingresso, inteira, num lugar só.
 *
 * Especificação: `docs/specs/SPEC-003-ingressos.md`.
 *
 * Mesmo padrão da `convite.ts`: nada aqui busca dado, desenha tela ou toca
 * em storage — entra estado, sai decisão. Quem garante preço e pagamento é
 * o servidor (D2/D3); esta função só decide o que o botão OFERECE.
 */

export type AcaoDoEvento =
  | 'comprar'
  | 'entrar-para-comprar'
  | 'ver-ingresso'
  | 'rsvp'
  | 'encerrado';

/** "2026-11-14" do dia de `agora`, no fuso do aparelho — o mesmo do `date` do evento. */
function diaLocal(agora: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}

/**
 * A edição está vendendo? Precisa de preço, estar "em breve" e não ter
 * passado do último dia.
 *
 * Vaga NÃO entra aqui de propósito: quantas já foram vendidas é metadado
 * que a RLS não deixa o cliente contar (S6). Quem recusa por esgotado é a
 * Edge Function `criar-pedido`, e a tela mostra o motivo que ela devolve.
 */
export function estaVendendo(evento: TriadeEvent, agora: Date): boolean {
  return (
    !!evento.ticketPriceCents &&
    evento.ticketPriceCents > 0 &&
    evento.status === 'em breve' &&
    diaLocal(agora) <= (evento.endDate ?? evento.date)
  );
}

/** O que o botão da edição deve oferecer, dado o estado da usuária. */
export function acaoDoEvento(
  evento: TriadeEvent,
  ingresso: Ingresso | null,
  logada: boolean,
  agora: Date,
): AcaoDoEvento {
  if (ingresso) return 'ver-ingresso';
  if (evento.status !== 'em breve') return 'encerrado';
  if (!estaVendendo(evento, agora)) return 'rsvp';
  return logada ? 'comprar' : 'entrar-para-comprar';
}

/** 9700 -> "R$ 97,00" */
export function formatCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Campo de edição: a sócia digita reais ("97", "97,50", "1.297,00"), o
 * banco guarda centavos. Vazio, zero ou lixo = `null` = edição sem venda
 * (não existe "preço zero" — D7 do contrato de edição).
 */
export function reaisParaCentavos(texto: string): number | null {
  let limpo = texto.replace(/[^\d,.]/g, '');
  // com vírgula, o ponto é milhar ("1.297,50"); sem ela, só é milhar no
  // formato "1.297" — "97.5" é decimal digitado à americana
  if (limpo.includes(',') || /^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  }
  const valor = Math.round(Number(limpo) * 100);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

/** 9700 -> "97,00" (o valor que volta para dentro do campo de edição) */
export function centavosParaCampo(centavos: number | null | undefined): string {
  return centavos ? (centavos / 100).toFixed(2).replace('.', ',') : '';
}
