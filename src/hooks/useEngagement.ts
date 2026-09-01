import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';

/**
 * Estado de curtida/salvo de um post, persistido pela camada de dados.
 * O estado inicial é lido na montagem, então recarregar a página mantém o
 * que a usuária marcou.
 *
 * Curtir/salvar exige login quando o Supabase está configurado (ver
 * `useAuth().requireAuth`) — sem Supabase, continua livre como sempre foi.
 */
export function useEngagement(postId: string) {
  const { showToast } = useToast();
  const { requireAuth } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [curtidas, setCurtidas] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([db.isLiked(postId), db.isSaved(postId), db.contarCurtidas(postId)]).then(
      ([l, s, n]) => {
        if (alive) {
          setLiked(l);
          setSaved(s);
          setCurtidas(n);
        }
      },
    );
    return () => {
      alive = false;
    };
  }, [postId]);

  // O número anda na hora, sem esperar a rede: o total já está na tela e a
  // mudança é de exatamente ±1, então dá para calcular em vez de reconsultar.
  function aplicar(antes: boolean, depois: boolean) {
    if (antes !== depois) setCurtidas((n) => Math.max(0, n + (depois ? 1 : -1)));
  }

  const toggleLike = useCallback(async () => {
    if (!requireAuth()) return;
    const next = await db.toggleLike(postId);
    aplicar(liked, next);
    setLiked(next);
  }, [postId, requireAuth, liked]);

  /** Curtir sem descurtir — usado pelo duplo toque na imagem. */
  const likeOnly = useCallback(async () => {
    if (!requireAuth()) return;
    if (await db.isLiked(postId)) return;
    const next = await db.toggleLike(postId);
    aplicar(false, next);
    setLiked(next);
  }, [postId, requireAuth]);

  const toggleSave = useCallback(async () => {
    if (!requireAuth()) return;
    const next = await db.toggleSave(postId);
    setSaved(next);
    showToast(next ? 'Salvo na sua coleção' : 'Removido dos salvos');
  }, [postId, requireAuth, showToast]);

  return { liked, saved, curtidas, toggleLike, likeOnly, toggleSave };
}
