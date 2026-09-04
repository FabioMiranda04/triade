import type { Plan } from '@/types';

/**
 * A regra do convite de membro, inteira, num lugar só.
 *
 * Especificação: `docs/specs/SPEC-001-convite-de-membro.md`.
 *
 * Nada aqui busca dado, desenha tela ou toca em storage — entra estado,
 * sai decisão. É o que permite mudar quando o convite aparece sem abrir o
 * componente, e é onde o pagamento (SPEC-002) vai se ligar depois.
 */

export interface ContextoConvite {
  /** catálogo de planos, como vem de `db.getPlans()` */
  planos: Plan[];
  /** id do plano escolhido, como vem de `db.getChosenPlan()`; `null` = nenhum */
  planoEscolhidoId: string | null;
  /** o convite já foi decidido nesta abertura do app? */
  vistoNestaAbertura: boolean;
}

/**
 * D2/D3 — "já é membra" significa **já paga**, não "já clicou".
 *
 * Plano gratuito de propósito não conta: quem escolheu o grátis é
 * exatamente o perfil que o convite existe para converter.
 *
 * Quando a SPEC-002 entrar, esta é a função que muda — passa a perguntar
 * `temAcesso(assinatura)` em vez de olhar o preço. Só ela.
 */
export function ehMembroPagante(planos: Plan[], escolhidoId: string | null): boolean {
  const escolhido = planos.find((p) => p.id === escolhidoId);
  return !!escolhido && escolhido.price > 0;
}

/**
 * D4 — qual plano o convite promove: o marcado como destaque; sem
 * destaque, o primeiro pago; sem nenhum pago, o primeiro da lista.
 *
 * A versão anterior usava a posição (`planos[1]`), que quebra em silêncio
 * quando alguém reordena os planos no `seed.ts`.
 */
export function planoParaPromover(planos: Plan[]): Plan | null {
  return planos.find((p) => p.featured) ?? planos.find((p) => p.price > 0) ?? planos[0] ?? null;
}

/**
 * A decisão inteira: devolve o plano a promover, ou `null` para não abrir.
 */
export function decidirConvite(ctx: ContextoConvite): Plan | null {
  if (ctx.vistoNestaAbertura) return null;
  if (ehMembroPagante(ctx.planos, ctx.planoEscolhidoId)) return null;
  return planoParaPromover(ctx.planos);
}
