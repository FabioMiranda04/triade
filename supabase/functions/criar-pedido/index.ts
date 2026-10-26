// SPEC-003 — cria o pedido de ingresso e devolve a URL do checkout.
// Chamada pelo app, COM o JWT da usuária (deploy padrão, verify_jwt ligado).
//
// O corpo traz só `eventId`. O preço sai do banco (D2/A1): se viesse do
// navegador, trocar `price` no DevTools compraria o ingresso por R$ 1.
import { CORS, INFINITEPAY, admin, json, segredo } from '../_shared/comum.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const db = admin();

  // A9 — sem login, 401 antes de qualquer leitura
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
  const { data: sessao } = await db.auth.getUser(jwt);
  const usuaria = sessao.user;
  if (!usuaria) return json({ erro: 'Entre na sua conta para comprar.' }, 401);

  const { eventId } = (await req.json().catch(() => ({}))) as { eventId?: unknown };
  if (typeof eventId !== 'string') return json({ erro: 'Pedido inválido.' }, 400);

  const { data: evento } = await db
    .from('events')
    .select('id, title, date, end_date, status, spots, ticket_price_cents, published')
    .eq('id', eventId)
    .maybeSingle();

  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  if (
    !evento ||
    !evento.published ||
    evento.status !== 'em breve' ||
    !evento.ticket_price_cents ||
    hoje > (evento.end_date ?? evento.date)
  ) {
    return json({ erro: 'Esta edição não está vendendo ingresso.' }, 409);
  }

  // já comprou? não cobra de novo
  const { count: jaTem } = await db
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('user_id', usuaria.id)
    .eq('status', 'pago');
  if (jaTem) return json({ erro: 'Você já tem ingresso para esta edição.' }, 409);

  // vagas: conta só pago. Duas compras no último segundo podem passar uma
  // vaga — aceitável para 65 lugares; trava de verdade quando houver fila.
  if (evento.spots) {
    const { count: vendidos } = await db
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'pago');
    if ((vendidos ?? 0) >= evento.spots) return json({ erro: 'Ingressos esgotados.' }, 409);
  }

  // D4/A7 — nosso id do pedido, uuid v4, gravado ANTES de ir à InfinitePay
  const orderNsu = crypto.randomUUID();
  const { error: falhaGravar } = await db.from('tickets').insert({
    user_id: usuaria.id,
    event_id: eventId,
    order_nsu: orderNsu,
    valor_centavos: evento.ticket_price_cents,
  });
  if (falhaGravar) {
    console.error(`criar-pedido ${orderNsu}: falha ao gravar`);
    return json({ erro: 'Não deu para abrir o pagamento. Tente de novo.' }, 500);
  }

  // volta para a tela de Eventos, onde o app confirma o pedido (D9)
  const origem = req.headers.get('origin') ?? Deno.env.get('APP_URL') ?? '';
  const resposta = await fetch(`${INFINITEPAY}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      handle: segredo('INFINITEPAY_HANDLE'),
      order_nsu: orderNsu,
      redirect_url: `${origem}/eventos`,
      webhook_url: `${segredo('SUPABASE_URL')}/functions/v1/webhook-ingresso`,
      // D8 — sem `customer`/`address`: nenhum dado pessoal sai daqui
      items: [
        { quantity: 1, price: evento.ticket_price_cents, description: `Ingresso · ${evento.title}` },
      ],
    }),
  });
  const link = (await resposta.json().catch(() => null)) as { url?: string } | null;
  if (!resposta.ok || !link?.url) {
    console.error(`criar-pedido ${orderNsu}: InfinitePay recusou (${resposta.status})`);
    await db.from('tickets').update({ status: 'cancelado' }).eq('order_nsu', orderNsu);
    return json({ erro: 'O pagamento está fora do ar agora. Tente de novo em instantes.' }, 502);
  }

  console.log(`criar-pedido ${orderNsu}: pendente`);
  return json({ url: link.url });
});
