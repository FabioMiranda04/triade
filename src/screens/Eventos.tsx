import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { SectionHead } from '@/components/SectionHead';
import { EventCard } from '@/components/EventCard';
import { EventEditSheet } from '@/components/EventEditSheet';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { db } from '@/lib/db';
import { applyEventEdits } from '@/lib/db/localContent';
import type { EventFilter, TriadeEvent } from '@/types';

const FILTERS: { value: EventFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'em breve', label: 'Em breve' },
  { value: 'realizado', label: 'Realizados' },
];

/** Tela Eventos — agenda das edições com filtro e confirmação de presença. */
export default function Eventos() {
  const { showToast } = useToast();
  const { requireAuth } = useAuth();
  const [filter, setFilter] = useState<EventFilter>('todos');
  const [rsvps, setRsvps] = useState<string[]>([]);
  const [editing, setEditing] = useState<TriadeEvent | 'new' | null>(null);
  const [version, setVersion] = useState(0);

  const { data: events, loading } = useAsyncData<TriadeEvent[]>(
    () => db.getEvents().then(applyEventEdits),
    [],
    version,
  );
  const visible = events.filter((e) => (filter === 'todos' ? true : e.status === filter));

  useEffect(() => {
    let alive = true;
    Promise.all(events.map((e) => db.hasRsvp(e.id).then((going) => (going ? e.id : null)))).then(
      (ids) => {
        if (alive) setRsvps(ids.filter((id): id is string => id !== null));
      },
    );
    return () => {
      alive = false;
    };
  }, [events]);

  function handleSaved() {
    setEditing(null);
    setVersion((v) => v + 1);
    showToast('Evento salvo neste aparelho ✓');
  }

  function isGoing(id: string) {
    return rsvps.includes(id);
  }

  async function handleRsvp(id: string) {
    if (!requireAuth()) return;
    setRsvps(await db.rsvpEvent(id));
    showToast('Presença confirmada! Nos vemos lá 🤍');
  }

  async function handleCancelRsvp(id: string) {
    if (!requireAuth()) return;
    setRsvps(await db.cancelRsvp(id));
    showToast('Presença cancelada');
  }

  return (
    <section className="panel">
      <SectionHead
        first
        eyebrow="Agenda Tríade"
        title="Eventos"
        description="Encontros presenciais mensais de 5h, com especialista convidada."
      />

      <div className="segmented glass-strong" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            className={filter === f.value ? 'active' : undefined}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button className="add-tile" onClick={() => setEditing('new')}>
        <Icon name="plus" size={16} /> Novo evento
      </button>

      {loading ? (
        <Skeleton rows={3} height={92} />
      ) : visible.length === 0 ? (
        <p className="empty-state">Nenhum evento nesse filtro.</p>
      ) : (
        visible.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            going={isGoing(event.id)}
            onRsvp={handleRsvp}
            onCancelRsvp={handleCancelRsvp}
            onEdit={setEditing}
          />
        ))
      )}

      {editing && (
        <EventEditSheet
          event={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
