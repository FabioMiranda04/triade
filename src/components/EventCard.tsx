import { Icon } from '@/components/Icon';
import { Kebab } from '@/components/Kebab';
import { Mark } from '@/components/Brand';
import { formatEventDate, statusClass } from '@/lib/format';
import type { TriadeEvent } from '@/types';

interface EventCardProps {
  event: TriadeEvent;
  /** já confirmou presença? */
  going: boolean;
  onRsvp: (id: string) => void;
  onCancelRsvp: (id: string) => void;
  onEdit: (event: TriadeEvent) => void;
}

/**
 * Card de uma edição do evento + botão de presença (só "em breve").
 * O mesmo botão confirma e, se tocado de novo, desconfirma a presença.
 */
export function EventCard({ event, going, onRsvp, onCancelRsvp, onEdit }: EventCardProps) {
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
        <Kebab
          label="Opções do evento"
          actions={[{ label: 'Editar', icon: 'edit', onClick: () => onEdit(event) }]}
        />
      </div>

      {event.status === 'em breve' && (
        <button
          className={`btn ${going ? 'btn-glass' : 'btn-primary'} full ev-rsvp`}
          onClick={() => (going ? onCancelRsvp(event.id) : onRsvp(event.id))}
          aria-label={going ? 'Cancelar presença confirmada' : 'Confirmar presença'}
        >
          {going ? 'Presença confirmada ✓ · cancelar' : 'Quero participar'}
        </button>
      )}
    </>
  );
}
