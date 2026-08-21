import { useState } from 'react';
import { SectionHead } from '@/components/SectionHead';
import { EventCard } from '@/components/EventCard';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useAsyncData } from '@/hooks/useAsyncData';
import { db } from '@/lib/db';
import type { EventFilter, TriadeEvent } from '@/types';

const FILTERS: { value: EventFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'em breve', label: 'Em breve' },
  { value: 'realizado', label: 'Realizados' },
];

/** Tela Eventos — agenda das edições com filtro e confirmação de presença. */
export default function Eventos() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<EventFilter>('todos');
  const [rsvps, setRsvps] = useState<string[]>([]);

  const { data: events, loading } = useAsyncData<TriadeEvent[]>(() => db.getEvents(), []);
  const visible = events.filter((e) => (filter === 'todos' ? true : e.status === filter));

  function isGoing(id: string) {
    return rsvps.includes(id) || db.hasRsvp(id);
  }

  function handleRsvp(id: string) {
    setRsvps(db.rsvpEvent(id));
    showToast('Presença confirmada! Nos vemos lá 🤍');
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

      {loading ? (
        <Skeleton rows={3} height={92} />
      ) : visible.length === 0 ? (
        <p className="empty-state">Nenhum evento nesse filtro.</p>
      ) : (
        visible.map((event) => (
          <EventCard key={event.id} event={event} going={isGoing(event.id)} onRsvp={handleRsvp} />
        ))
      )}
    </section>
  );
}
