import type { FormEvent, ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { ModalOverlay } from '@/components/ModalOverlay';

interface EditSheetProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  submitLabel?: string;
  children: ReactNode;
}

/** Pop-up reutilizável para formulários de edição/criação de conteúdo — mesmo padrão visual do `EventModal`. */
export function EditSheet({ title, onClose, onSubmit, submitLabel = 'Salvar', children }: EditSheetProps) {
  return (
    <ModalOverlay onClose={onClose}>
      <form
        className="modal-sheet glass-dark"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <button type="button" className="modal-close" aria-label="Fechar" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <h2 className="modal-title">{title}</h2>
        <div className="edit-fields">{children}</div>
        <button type="submit" className="btn btn-primary full">
          {submitLabel}
        </button>
      </form>
    </ModalOverlay>
  );
}
