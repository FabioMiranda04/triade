import type { CSSProperties } from 'react';

/**
 * Elemento de assinatura da marca: as três setas do logo Tríade.
 * Usado como badge de vidro em vários pontos da UI.
 * `size` alimenta a variável CSS --m usada por `.markwrap`.
 */
export function Mark({ size = 30, className = 'on-glass' }: { size?: number; className?: string }) {
  return (
    <span className={`markwrap ${className}`.trim()} style={{ '--m': `${size}px` } as CSSProperties}>
      <svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="6,10 6,110 66,60" className="m-solid" />
        <polygon points="34,14 34,106 88,60" className="m-outline" />
        <polygon points="62,18 62,102 116,60" className="m-outline" />
      </svg>
    </span>
  );
}

/** Fundo com manchas de cor desfocadas (mesh gradient) da marca. */
export function MeshBackground() {
  return (
    <div className="mesh" aria-hidden="true">
      <span className="b1" />
      <span className="b2" />
      <span className="b3" />
      <span className="b4" />
    </div>
  );
}
