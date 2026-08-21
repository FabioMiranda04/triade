/** Placeholder de carregamento, no mesmo vidro do resto da UI. */
export function Skeleton({ rows = 3, height = 92 }: { rows?: number; height?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton glass" style={{ height }} />
      ))}
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
