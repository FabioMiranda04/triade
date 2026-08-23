import { useEffect, useRef, useState } from 'react';

/**
 * Revela mais itens de uma lista já carregada conforme a usuária rola até o
 * fim (sem paginação real — o dataset de hoje é pequeno). Quando o histórico
 * de eventos crescer bastante, trocar por paginação de verdade no
 * `supabaseProvider.ts` (`range()`/`limit` por data).
 */
export function useInfiniteReveal(total: number, step = 9) {
  const [visibleCount, setVisibleCount] = useState(Math.min(step, total));
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(Math.min(step, total));
  }, [total, step]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= total) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + step, total));
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, total, step]);

  return { visibleCount, sentinelRef };
}
