import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { formatEventDate, statusClass } from '@/lib/format';
import type { TriadeEvent } from '@/types';

interface EventCardProps {
  event: TriadeEvent;
  /** já confirmou presença? */
  going: boolean;
  onRsvp: (id: string) => void;
}

/** Card de uma edição do evento + botão de confirmar presença (só "em breve"). */
export function EventCard({ event, going, onRsvp }: EventCardProps) {
  return (
    <>
      <div className="ev-card glass">
        <div className="ph">
          <Mark size={30} />
        </div>
        <div className="body">
          <span className={`status-pill ${statusClass(event.status)}`}>{event.status}</span>
          <h3>{event.title}</h3>
          <div className="meta">
            <span>
              <Icon name="calendar" size={12} /> {formatEventDate(event.date)}
            </span>
            <span>
              <Icon name="pin" size={12} /> {event.location}
            </span>
          </div>
        </div>
      </div>

      {event.status === 'em breve' && (
        <button
          className={`btn ${going ? 'btn-glass' : 'btn-primary'} full ev-rsvp`}
          onClick={() => onRsvp(event.id)}
          disabled={going}
        >
          {going ? 'Presença confirmada ✓' : 'Quero participar'}
        </button>
      )}
    </>
  );
}
