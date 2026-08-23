import { useEffect } from 'react';

/**
 * Efeitos compartilhados por todo pop-up (`EventModal`, `EditSheet`):
 * fecha no Esc e pausa a animação do fundo (`.mesh`) enquanto estiver aberto
 * — o blur de fundo do pop-up (`backdrop-filter`) precisa recalcular a cada
 * quadro se o que está atrás dele continuar se mexendo, o que pesa bastante
 * em telas maiores. Ver `docs/CHANGELOG.md` para o diagnóstico.
 */
export function useModalEffects(onClose: () => void): void {
  useEffect(() => {
    document.body.classList.add('modal-open');
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);
}
