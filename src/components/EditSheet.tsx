import type { FormEvent, ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { ModalOverlay } from '@/components/ModalOverlay';

interface EditSheetProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  submitLabel?: string;
  /** trava o envio enquanto algo assíncrono está em andamento (upload, gravação) */
  submitDisabled?: boolean;
  /**
   * Linha fixa acima dos campos dizendo ONDE isto vai ser salvo. Um
   * formulário que parece publicar e só guarda no navegador é pior que um
   * que não existe — o destino tem que estar escrito antes de a pessoa
   * digitar, não depois de salvar.
   */
  aviso?: string;
  /** falha da gravação, mostrada junto ao botão em vez de num toast que some */
  erro?: string | null;
  children: ReactNode;
}

/** Pop-up reutilizável para formulários de edição/criação de conteúdo — mesmo padrão visual do `EventModal`. */
export function EditSheet({
  title,
  onClose,
  onSubmit,
  submitLabel = 'Salvar',
  submitDisabled = false,
  aviso,
  erro,
  children,
}: EditSheetProps) {
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
        {aviso && <p className="edit-aviso">{aviso}</p>}
        <div className="edit-fields">{children}</div>
        {erro && (
          <p className="edit-erro" role="alert">
            {erro}
          </p>
        )}
        <button type="submit" className="btn btn-primary full" disabled={submitDisabled}>
          {submitLabel}
        </button>
      </form>
    </ModalOverlay>
  );
}
