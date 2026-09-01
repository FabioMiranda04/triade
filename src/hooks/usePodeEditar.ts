import { useEffect, useState } from 'react';
import { db } from '@/lib/db';

/**
 * `true` só para quem está na tabela `admins` do Supabase.
 *
 * Editar conteúdo é privilégio, não função de usuária logada — e a UI de
 * edição só deve aparecer para quem pode de fato editar. Um "..." → Editar
 * que existe para todo mundo e salva no navegador de cada uma parece um
 * app quebrado quando a sócia abre no celular dela e não vê nada.
 */
export function usePodeEditar(): boolean {
  const [pode, setPode] = useState(false);
  useEffect(() => {
    let vivo = true;
    void db.podeEditarConteudo().then((p) => {
      if (vivo) setPode(p);
    });
    return () => {
      vivo = false;
    };
  }, []);
  return pode;
}
