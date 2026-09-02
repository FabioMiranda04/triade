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

/** `2026-09-11` a partir de um `Date` local, sem passar por UTC (que puxaria um dia). */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

  // Evento de dois dias marca os DOIS: a Feira de Negócios acontece em 11 e
  // 12, e comparar só com `date` deixava o dia 12 em branco no calendário.
  function eventOn(day: Date): TriadeEvent | undefined {
    const d = iso(day);
    return events.find((e) => d >= e.date && d <= (e.endDate ?? e.date));
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
          // A foto do evento vira a própria célula. Um ponto de 4px embaixo
          // do número não competia com mais nada na grade — o dia com
          // encontro precisa ser a coisa mais forte do mês, não uma nota de
          // rodapé. Sem foto, o quadro fica no dourado (por vir) ou no
          // vidro (já aconteceu), que ainda lê como "tem coisa aqui".
          const capa = event.recapMedia?.find((m) => m.tipo === 'foto');
          const porVir = event.status === 'em breve';
          // Evento de vários dias vira UM bloco em vez de quadros soltos: a
          // Feira é 11 e 12, e dois quadrados separados leem como dois
          // eventos. A emenda só vale dentro da mesma semana — colar um
          // sábado num domingo da linha de baixo desenharia uma ponte que
          // atravessa a grade.
          const vizinho = (delta: number) => {
            const d = new Date(day);
            d.setDate(d.getDate() + delta);
            return eventOn(d)?.id === event.id;
          };
          const juntaEsq = day.getDay() !== 0 && vizinho(-1);
          const juntaDir = day.getDay() !== 6 && vizinho(1);
          return (
            <button
              key={i}
              className={
                `cal-cell has-event${capa ? ' com-foto' : porVir ? ' por-vir' : ''}` +
                `${juntaEsq ? ' junta-esq' : ''}${juntaDir ? ' junta-dir' : ''}`
              }
              onClick={() => onSelectEvent(event)}
              aria-label={`${day.getDate()} de ${MONTHS[day.getMonth()]} — ${event.title}`}
            >
              {capa && (
                <img
                  className="cal-capa foto-fade"
                  src={capa.url}
                  alt=""
                  loading="lazy"
                  onLoad={(e) => e.currentTarget.classList.add('carregou')}
                />
              )}
              <span className="cal-dia">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
