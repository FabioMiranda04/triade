import { useCallback, useState } from 'react';
import { db } from '@/lib/db';
import { useToast } from '@/components/Toast';

/**
 * Estado de curtida/salvo de um post, persistido pela camada de dados.
 * O estado inicial é lido na montagem, então recarregar a página mantém o
 * que a usuária marcou.
 *
 * Engajamento é síncrono (local) por enquanto — ver `src/lib/db/types.ts`.
 */
export function useEngagement(postId: string) {
  const { showToast } = useToast();
  const [liked, setLiked] = useState(() => db.isLiked(postId));
  const [saved, setSaved] = useState(() => db.isSaved(postId));

  const toggleLike = useCallback(() => {
    setLiked(db.toggleLike(postId));
  }, [postId]);

  /** Curtir sem descurtir — usado pelo duplo toque na imagem. */
  const likeOnly = useCallback(() => {
    if (!db.isLiked(postId)) setLiked(db.toggleLike(postId));
  }, [postId]);

  const toggleSave = useCallback(() => {
    const next = db.toggleSave(postId);
    setSaved(next);
    showToast(next ? 'Salvo na sua coleção' : 'Removido dos salvos');
  }, [postId, showToast]);

  return { liked, saved, toggleLike, likeOnly, toggleSave };
}
