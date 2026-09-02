import { useEffect, useMemo, useState } from 'react';
import { EventCalendar } from '@/components/EventCalendar';
import { EventCard } from '@/components/EventCard';
import { EventEditSheet } from '@/components/EventEditSheet';
import { EventRecapModal } from '@/components/EventRecapModal';
import { Icon } from '@/components/Icon';
import { SectionHead } from '@/components/SectionHead';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { usePodeEditar } from '@/hooks/usePodeEditar';
import { useInfiniteReveal } from '@/hooks/useInfiniteReveal';
import { ANFITRIA_TRIADE } from '@/data/seed';
import { db } from '@/lib/db';
import { applyEventEdits } from '@/lib/db/localContent';
import { firstName, formatEventDateRange, formatEventShortDate } from '@/lib/format';
import type { TriadeEvent } from '@/types';

type Mode = 'lista' | 'calendario';

const MODES: { value: Mode; label: string }[] = [
  { value: 'lista', label: 'Lista' },
  { value: 'calendario', label: 'Calendário' },
];

/** Normaliza texto pra busca sem sensibilidade a acento/caixa (ex: "café" e "cafe" combinam). */
function normalize(value: string): string {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Tela Eventos — próximo evento em destaque, retrospectiva das edições anteriores e calendário. */
export default function Eventos() {
  const { showToast } = useToast();
  const { requireAuth } = useAuth();
  const [mode, setMode] = useState<Mode>('lista');
  const [rsvps, setRsvps] = useState<string[]>([]);
  const podeEditar = usePodeEditar();
  const [editing, setEditing] = useState<TriadeEvent | 'new' | null>(null);
  const [recapEvent, setRecapEvent] = useState<TriadeEvent | null>(null);
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState(0);

  const { data: events, loading } = useAsyncData<TriadeEvent[]>(
    () => db.getEvents().then(applyEventEdits),
    [],
    version,
  );

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

  const nextEvent = useMemo(
    () =>
      [...events]
        .filter((e) => e.status === 'em breve')
        .sort((a, b) => a.date.localeCompare(b.date))[0],
    [events],
  );

  const pastEvents = useMemo(
    () =>
      [...events]
        .filter((e) => e.status === 'realizado')
        .sort((a, b) => b.date.localeCompare(a.date)),
    [events],
  );

  const filteredPast = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return pastEvents;
    return pastEvents.filter((e) =>
      normalize(`${e.title} ${e.theme} ${e.speaker} ${formatEventDateRange(e.date, e.endDate)}`).includes(q),
    );
  }, [pastEvents, query]);

  const { visibleCount, sentinelRef } = useInfiniteReveal(filteredPast.length, 9);
  const visiblePast = filteredPast.slice(0, visibleCount);

  // A retrospectiva era uma parede única de quadradinhos: doze edições
  // seguidas, sem nada dizendo onde um ano termina e o outro começa. Agrupar
  // por ano dá o eixo que faltava — a lista vira linha do tempo em vez de
  // grade. O agrupamento é feito sobre o que JÁ está visível, então a
  // revelação progressiva continua valendo.
  const porAno = useMemo(() => {
    const mapa = new Map<string, TriadeEvent[]>();
    for (const evento of visiblePast) {
      const ano = evento.date.slice(0, 4);
      const lista = mapa.get(ano);
      if (lista) lista.push(evento);
      else mapa.set(ano, [evento]);
    }
    return [...mapa.entries()];
  }, [visiblePast]);

  function handleSaved(noBanco: boolean) {
    setEditing(null);
    setVersion((v) => v + 1);
    // A mensagem diz onde o dado foi parar. "Salvo ✓" para uma edição que
    // ficou só no navegador é mentira útil por um segundo e cara depois,
    // quando a sócia abre no celular dela e não vê nada.
    showToast(noBanco ? 'Evento publicado para todo mundo ✓' : 'Evento salvo neste aparelho ✓');
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

  function handleCalendarSelect(event: TriadeEvent) {
    setMode('lista');
    if (event.status === 'realizado') setRecapEvent(event);
  }

  return (
    <section className="panel">
      <SectionHead eyebrow="Agenda Tríade"
        title="Eventos"
        description="Encontros presenciais mensais de 5h, com especialista convidada."
      />

      <div className="segmented glass-strong" role="tablist">
        {MODES.map((m) => (
          <button
            key={m.value}
            role="tab"
            aria-selected={mode === m.value}
            className={mode === m.value ? 'active' : undefined}
            onClick={() => setMode(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'calendario' ? (
        loading ? (
          <Skeleton rows={1} height={280} />
        ) : (
          <EventCalendar events={events} onSelectEvent={handleCalendarSelect} />
        )
      ) : (
        <>
          {podeEditar && (
            <button className="add-tile" onClick={() => setEditing('new')}>
              <Icon name="plus" size={16} /> Novo evento
            </button>
          )}

          {loading ? (
            <Skeleton rows={3} height={92} />
          ) : (
            <>
              {nextEvent ? (
                <EventCard
                  event={nextEvent}
                  variant="featured"
                  going={isGoing(nextEvent.id)}
                  onRsvp={handleRsvp}
                  onCancelRsvp={handleCancelRsvp}
                  onEdit={podeEditar ? setEditing : undefined}
                />
              ) : (
                <p className="empty-state">Nenhuma edição agendada no momento.</p>
              )}

              <SectionHead eyebrow="Retrospectiva" title="Edições anteriores" />

              {pastEvents.length === 0 ? (
                <p className="empty-state">Ainda não há edições anteriores.</p>
              ) : (
                <>
                  {/* A busca vinha DEPOIS da grade: para filtrar era preciso
                      rolar por tudo que se queria filtrar. */}
                  <label className="ev-search glass-strong">
                    <Icon name="search" size={16} />
                    <input
                      type="search"
                      placeholder="Buscar por tema, palestrante ou mês…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>

                  {filteredPast.length === 0 && (
                    <p className="empty-state">Nenhuma edição encontrada para "{query}".</p>
                  )}

                  {porAno.map(([ano, doAno]) => (
                    <div className="ano-bloco" key={ano}>
                      <div className="ano-cabeca">
                        <span className="ano">{ano}</span>
                        <span className="quantas">
                          {doAno.length} {doAno.length === 1 ? 'edição' : 'edições'}
                        </span>
                      </div>
                      <div className="event-grid">
                        {doAno.map((event) => {
                          // a primeira foto da retrospectiva vira a capa da
                          // célula; edição sem foto continua no gradiente
                          const capa = event.recapMedia?.find((m) => m.tipo === 'foto');
                          return (
                            <button
                              key={event.id}
                              className={`event-cell${capa ? ' has-foto' : ''}`}
                              onClick={() => setRecapEvent(event)}
                              aria-label={`Ver retrospectiva de ${event.title}`}
                            >
                              {capa && (
                                <img
                                  className="capa foto-fade"
                                  src={capa.url}
                                  alt=""
                                  loading="lazy"
                                  onLoad={(e) => e.currentTarget.classList.add('carregou')}
                                />
                              )}
                              <span className="date">{formatEventShortDate(event.date)}</span>
                              {event.speaker !== ANFITRIA_TRIADE && (
                                <span className="nm">{firstName(event.speaker)}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {visibleCount < filteredPast.length && <div ref={sentinelRef} className="scroll-sentinel" />}
                </>
              )}
            </>
          )}
        </>
      )}

      {editing && (
        <EventEditSheet
          event={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {recapEvent && <EventRecapModal event={recapEvent} onClose={() => setRecapEvent(null)} />}
    </section>
  );
}
