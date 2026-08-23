import { useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import type { TriadeEvent } from '@/types';

interface EventCalendarProps {
  events: TriadeEvent[];
  onSelectEvent: (event: TriadeEvent) => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function parseIsoDate(iso: string): Date {
  return new Date(iso + 'T00:00:00');
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Mês corrente com um marcador nos dias que têm evento (qualquer status).
 * Tocar num dia com evento aciona `onSelectEvent` — quem decide o que fazer
 * com isso (abrir o card em destaque ou a retrospectiva) é a tela chamadora.
 */
export function EventCalendar({ events, onSelectEvent }: EventCalendarProps) {
  const initialMonth = useMemo(() => {
    const next = events.find((e) => e.status === 'em breve');
    const reference = next ?? events[0];
    return reference ? parseIsoDate(reference.date) : new Date();
  }, [events]);
  const [viewDate, setViewDate] = useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));

  const cells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: (Date | null)[] = Array.from({ length: startOffset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(year, month, d));
    return list;
  }, [viewDate]);

  function eventOn(day: Date): TriadeEvent | undefined {
    return events.find((e) => sameDay(parseIsoDate(e.date), day));
  }

  function changeMonth(delta: number) {
    setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  }

  const today = new Date();

  return (
    <div className="cal glass-strong">
      <div className="cal-head">
        <button className="cal-nav" aria-label="Mês anterior" onClick={() => changeMonth(-1)}>
          <Icon name="chevronLeft" size={16} />
        </button>
        <span className="cal-title">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button className="cal-nav" aria-label="Próximo mês" onClick={() => changeMonth(1)}>
          <Icon name="chevronRight" size={16} />
        </button>
      </div>

      <div className="cal-weekdays">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((day, i) => {
          if (!day) return <span key={i} className="cal-cell empty" />;
          const event = eventOn(day);
          if (!event) {
            return (
              <span key={i} className={`cal-cell${sameDay(day, today) ? ' today' : ''}`}>
                {day.getDate()}
              </span>
            );
          }
          return (
            <button
              key={i}
              className="cal-cell has-event"
              onClick={() => onSelectEvent(event)}
              aria-label={`${day.getDate()} de ${MONTHS[day.getMonth()]} — ${event.title}`}
            >
              {day.getDate()}
              <span className="dot" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
