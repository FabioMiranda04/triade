// SPEC-003 — o finalizador do pedido. Dois chamadores, um código (D9):
//   1. a InfinitePay, pelo webhook (sem autenticação nenhuma);
//   2. o app, na volta do checkout, repassando os parâmetros da URL.
// Os dois são tratados igual: o corpo é AVISO de qual pedido olhar, nunca
// prova (D3/A2/A13). Só a resposta do `payment_check` escreve "pago".
//
// Deploy com `--no-verify-jwt`: a InfinitePay não manda JWT.
import { CORS, INFINITEPAY, admin, json, segredo } from '../_shared/comum.ts';

// A8 — resposta SEMPRE igual, achou ou não, pagou ou não: o endpoint não
// pode virar oráculo de "esse pedido existe?". É também o formato que a
// InfinitePay exige para não reenviar.
const OK = { success: true, message: null };

function texto(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 && v.length < 200 ? v : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const corpo = ((await req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const orderNsu = texto(corpo.order_nsu);
  const transactionNsu = texto(corpo.transaction_nsu);
  // webhook manda `invoice_slug`; a URL de retorno manda `slug`
  const slug = texto(corpo.invoice_slug) ?? texto(corpo.slug);
  if (!orderNsu || !transactionNsu || !slug) return json(OK);

  // A8/S4 — a pergunta à InfinitePay vem ANTES de olhar o nosso banco:
  // pedido inexistente e pedido real custam o mesmo tempo até aqui.
  const resposta = await fetch(`${INFINITEPAY}/payment_check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      handle: segredo('INFINITEPAY_HANDLE'),
      order_nsu: orderNsu,
      transaction_nsu: transactionNsu,
      slug,
    }),
  });
  const check = (await resposta.json().catch(() => null)) as
    | { success?: boolean; paid?: boolean; amount?: number }
    | null;

  if (!check?.paid) {
    console.log(`webhook-ingresso ${orderNsu}: recusado`);
    return json(OK);
  }

  const db = admin();
  const { data: ticket } = await db
    .from('tickets')
    .select('status, valor_centavos')
    .eq('order_nsu', orderNsu)
    .maybeSingle();
  if (!ticket || ticket.status !== 'pendente') return json(OK);

  // A3 — confere `amount` (o NOSSO valor ecoado), não `paid_amount`, que
  // inclui juros do parcelado e recusaria pagamento legítimo (S2b)
  if (check.amount !== ticket.valor_centavos) {
    console.log(`webhook-ingresso ${orderNsu}: valor-nao-bate`);
    return json(OK);
  }

  // comprovante: só aceita link da própria InfinitePay
  const recibo = texto(corpo.receipt_url);
  const receiptUrl = recibo && /^https:\/\/([\w-]+\.)*infinitepay\.io\//.test(recibo) ? recibo : null;

  // idempotente (D4/S3/S3b): só a transição pendente -> pago escreve.
  // Webhook e retorno chegando juntos: o segundo update não acha linha.
  await db
    .from('tickets')
    .update({
      status: 'pago',
      transaction_nsu: transactionNsu,
      pago_em: new Date().toISOString(),
      receipt_url: receiptUrl,
    })
    .eq('order_nsu', orderNsu)
    .eq('status', 'pendente');

  // A11 — só order_nsu e a decisão no log. Nunca o corpo.
  console.log(`webhook-ingresso ${orderNsu}: pago`);
  return json(OK);
});
