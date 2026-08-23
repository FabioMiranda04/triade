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

  useEffect(() => {
    let alive = true;
    Promise.all([db.isLiked(postId), db.isSaved(postId)]).then(([l, s]) => {
      if (alive) {
        setLiked(l);
        setSaved(s);
      }
    });
    return () => {
      alive = false;
    };
  }, [postId]);

  const toggleLike = useCallback(async () => {
    if (!requireAuth()) return;
    setLiked(await db.toggleLike(postId));
  }, [postId, requireAuth]);

  /** Curtir sem descurtir — usado pelo duplo toque na imagem. */
  const likeOnly = useCallback(async () => {
    if (!requireAuth()) return;
    if (!(await db.isLiked(postId))) setLiked(await db.toggleLike(postId));
  }, [postId, requireAuth]);

  const toggleSave = useCallback(async () => {
    if (!requireAuth()) return;
    const next = await db.toggleSave(postId);
    setSaved(next);
    showToast(next ? 'Salvo na sua coleção' : 'Removido dos salvos');
  }, [postId, requireAuth, showToast]);

  return { liked, saved, toggleLike, likeOnly, toggleSave };
}
