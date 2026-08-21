import { useCallback, useRef } from 'react';

/**
 * Detecta duplo toque/clique (gesto de curtir do Instagram).
 *
 * `onDoubleClick` sozinho não é confiável em todos os navegadores mobile,
 * então medimos o intervalo entre dois `pointerup` no mesmo elemento.
 */
export function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const lastTap = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      lastTap.current = 0;
      onDoubleTap();
    } else {
      lastTap.current = now;
    }
  }, [onDoubleTap, delay]);
}
