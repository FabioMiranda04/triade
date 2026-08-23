import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { useModalEffects } from '@/hooks/useModalEffects';

interface ModalOverlayProps {
  onClose: () => void;
  children: ReactNode;
}

/**
 * Fundo + portal compartilhado por todo pop-up do app.
 *
 * Sempre renderiza em `document.body` via portal — nunca deixe um pop-up
 * ser filho direto de um componente com `backdrop-filter` (ex: o header,
 * que usa a classe `.glass`): no Chrome, um ancestral com `backdrop-filter`
 * vira o "containing block" de `position: fixed`, prendendo o overlay
 * dentro da caixinha do ancestral em vez de cobrir a tela inteira. O portal
 * elimina essa dependência da árvore de componentes por completo.
 */
export function ModalOverlay({ onClose, children }: ModalOverlayProps) {
  useModalEffects(onClose);
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      {children}
    </div>,
    document.body,
  );
}
