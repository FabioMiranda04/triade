import { useEffect } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Icon } from '@/components/Icon';

interface EditSheetProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  submitLabel?: string;
  children: ReactNode;
}

/** Bottom sheet reutilizável para formulários de edição/criação de conteúdo. */
export function EditSheet({ title, onClose, onSubmit, submitLabel = 'Salvar', children }: EditSheetProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal-sheet edit-sheet glass-strong"
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
    </div>
  );
}
