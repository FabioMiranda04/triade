import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { acaoDoEvento } from '@/lib/ingresso';
import type { Ingresso, TriadeEvent } from '@/types';

/**
 * SPEC-003 — liga a regra pura (`lib/ingresso.ts`) ao estado da usuária.
 * Busca o ingresso, decide a ação, e compra: o componente só desenha.
 */
export function useIngresso(evento: TriadeEvent) {
  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();
  const [ingresso, setIngresso] = useState<Ingresso | null>(null);
  const [comprando, setComprando] = useState(false);

  useEffect(() => {
    setIngresso(null);
    if (!user || !evento.ticketPriceCents) return;
    let vivo = true;
    db.getIngresso(evento.id)
      .then((i) => vivo && setIngresso(i))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [user, evento.id, evento.ticketPriceCents]);

  // Voltar do checkout pelo "voltar" do navegador restaura a página do
  // cache (bfcache) com o botão ainda em "Abrindo…". Destrava.
  useEffect(() => {
    const destravar = () => setComprando(false);
    window.addEventListener('pageshow', destravar);
    return () => window.removeEventListener('pageshow', destravar);
  }, []);

  async function comprar() {
    if (!requireAuth('Entre para comprar — seu ingresso fica salvo aqui no app.')) return;
    setComprando(true);
    try {
      // mesma aba: sem bloqueador de pop-up, e a volta do checkout cai
      // direto em /eventos, onde o pedido é confirmado (D9)
      window.location.assign(await db.comprarIngresso(evento.id));
    } catch (falha) {
      showToast(falha instanceof Error ? falha.message : 'Não deu para abrir o pagamento.');
      setComprando(false);
    }
  }

  return { ingresso, acao: acaoDoEvento(evento, ingresso, !!user, new Date()), comprar, comprando };
}
