interface SectionHeadProps {
  /** linha pequena em caixa alta acima do título */
  eyebrow: string;
  title: string;
  description?: string;
  /** true no primeiro bloco de uma tela (margem menor no topo) */
}

/** Bloco padrão de título de seção (eyebrow + h2 + descrição). */
export function SectionHead({ eyebrow, title, description }: SectionHeadProps) {
  return (
    <div className="sec-head">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
