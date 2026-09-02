import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Kebab } from '@/components/Kebab';
import { SectionHead } from '@/components/SectionHead';
import { SpeakerEditSheet } from '@/components/SpeakerEditSheet';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useAsyncData } from '@/hooks/useAsyncData';
import { usePodeEditar } from '@/hooks/usePodeEditar';
import { db } from '@/lib/db';
import { applyEventEdits, applySpeakerEdits } from '@/lib/db/localContent';
import { byName, firstName, formatEventDate } from '@/lib/format';
import type { Speaker, TriadeEvent } from '@/types';

/** Tela Palestrantes — grade 3 colunas; tocar num quadro abre a bio. */
export default function Palestrantes() {
  const { showToast } = useToast();
  const [version, setVersion] = useState(0);
  const { data: speakers, loading } = useAsyncData<Speaker[]>(
    () => db.getSpeakers().then(applySpeakerEdits),
    [],
    version,
  );
  // As edições que cada palestrante conduziu saem da ligação que já existe
  // no dado — `event.speaker` guarda o nome —, e não de uma coluna nova.
  // Uma coluna precisaria ser mantida em dois lugares e sairia de sincronia
  // na primeira vez que alguém corrigisse um nome.
  const { data: events } = useAsyncData<TriadeEvent[]>(
    () => db.getEvents().then(applyEventEdits),
    [],
  );
  const podeEditar = usePodeEditar();
  const [selected, setSelected] = useState<Speaker | null>(null);

  // A tela abria com a metade de baixo vazia: uma fileira de nomes e nada
  // para ler até tocar em algum. Agora ela já vem aberta na palestrante do
  // PRÓXIMO encontro — que é a que interessa a quem chegou aqui — e cai na
  // primeira da lista quando o próximo evento não tem convidada.
  useEffect(() => {
    if (selected || speakers.length === 0) return;
    const proximo = events
      .filter((e) => e.status === 'em breve')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    setSelected(speakers.find((s) => s.name === proximo?.speaker) ?? speakers[0]);
  }, [speakers, events, selected]);
  const [editing, setEditing] = useState<Speaker | 'new' | null>(null);

  /** Edições conduzidas por esta palestrante, da mais recente para a mais antiga. */
  function edicoesDe(speaker: Speaker): TriadeEvent[] {
    return events
      .filter((e) => e.speaker === speaker.name)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function handleSaved(noBanco: boolean) {
    setEditing(null);
    setSelected(null);
    setVersion((v) => v + 1);
    showToast(
      noBanco ? 'Palestrante publicada para todo mundo ✓' : 'Palestrante salva neste aparelho ✓',
    );
  }

  return (
    <section className="panel">
      <SectionHead eyebrow="Conteúdo com intencionalidade"
        title="Palestrantes"
        description="Toque num quadro para ver a bio."
      />

      {loading ? (
        <Skeleton rows={1} height={110} />
      ) : (
        <div className="pal-grid">
          {[...speakers].sort(byName).map((s) => (
            <button
              key={s.id}
              className="pal-cell"
              onClick={() => setSelected(s)}
              aria-label={`Ver bio de ${s.name}`}
            >
              <span className="nm">{firstName(s.name)}</span>
            </button>
          ))}
          {podeEditar && (
            <button className="pal-add" onClick={() => setEditing('new')} aria-label="Nova palestrante">
              <Icon name="plus" size={18} />
              Nova
            </button>
          )}
        </div>
      )}

      {selected && (
        <div className="pal-detail glass">
          <div className="eyebrow">{selected.topic}</div>
          <h3>{selected.name}</h3>
          <p>{selected.bio}</p>
          {edicoesDe(selected).length > 0 && (
            <ul className="pal-edicoes">
              {edicoesDe(selected).map((ev) => (
                <li key={ev.id}>
                  <span className="tema">{ev.theme}</span>
                  <span className="quando">
                    {ev.title} · {formatEventDate(ev.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {podeEditar && (
            <Kebab
              label="Opções da palestrante"
              actions={[{ label: 'Editar', icon: 'edit', onClick: () => setEditing(selected) }]}
            />
          )}
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
