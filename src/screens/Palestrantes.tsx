import { useState } from 'react';
import { SectionHead } from '@/components/SectionHead';
import { Skeleton } from '@/components/Skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { db } from '@/lib/db';
import { firstName } from '@/lib/format';
import type { Speaker } from '@/types';

/** Tela Palestrantes — grade 3 colunas; tocar num quadro abre a bio abaixo. */
export default function Palestrantes() {
  const { data: speakers, loading } = useAsyncData<Speaker[]>(() => db.getSpeakers(), []);
  const [selected, setSelected] = useState<Speaker | null>(null);

  return (
    <section className="panel">
      <SectionHead
        first
        eyebrow="Conteúdo com intencionalidade"
        title="Palestrantes"
        description="Toque num quadro para ver a bio."
      />

      {loading ? (
        <Skeleton rows={1} height={110} />
      ) : (
        <div className="pal-grid">
          {speakers.map((s) => (
            <button
              key={s.id}
              className="pal-cell"
              onClick={() => setSelected(s)}
              aria-label={`Ver bio de ${s.name}`}
            >
              <span className="nm">{firstName(s.name)}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="pal-detail glass">
          <div className="eyebrow">{selected.topic}</div>
          <h3>{selected.name}</h3>
          <p>{selected.bio}</p>
        </div>
      )}
    </section>
  );
}
