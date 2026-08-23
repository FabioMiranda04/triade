import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { Kebab } from '@/components/Kebab';
import { SectionHead } from '@/components/SectionHead';
import { SpeakerEditSheet } from '@/components/SpeakerEditSheet';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useAsyncData } from '@/hooks/useAsyncData';
import { db } from '@/lib/db';
import { applySpeakerEdits } from '@/lib/db/localContent';
import { firstName } from '@/lib/format';
import type { Speaker } from '@/types';

/** Tela Palestrantes — grade 3 colunas; tocar num quadro abre a bio. */
export default function Palestrantes() {
  const { showToast } = useToast();
  const [version, setVersion] = useState(0);
  const { data: speakers, loading } = useAsyncData<Speaker[]>(
    () => db.getSpeakers().then(applySpeakerEdits),
    [],
    version,
  );
  const [selected, setSelected] = useState<Speaker | null>(null);
  const [editing, setEditing] = useState<Speaker | 'new' | null>(null);

  function handleSaved() {
    setEditing(null);
    setSelected(null);
    setVersion((v) => v + 1);
    showToast('Palestrante salva neste aparelho ✓');
  }

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
          <button className="pal-add" onClick={() => setEditing('new')} aria-label="Nova palestrante">
            <Icon name="plus" size={18} />
            Nova
          </button>
        </div>
      )}

      {selected && (
        <div className="pal-detail glass">
          <div className="eyebrow">{selected.topic}</div>
          <h3>{selected.name}</h3>
          <p>{selected.bio}</p>
          <Kebab
            label="Opções da palestrante"
            actions={[{ label: 'Editar', icon: 'edit', onClick: () => setEditing(selected) }]}
          />
        </div>
      )}

      {editing && (
        <SpeakerEditSheet
          speaker={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
