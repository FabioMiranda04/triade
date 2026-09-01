import { Icon } from '@/components/Icon';
import { Kebab } from '@/components/Kebab';
import { Mark } from '@/components/Brand';
import { formatEventDateRange, statusClass } from '@/lib/format';
import type { TriadeEvent } from '@/types';

interface EventCardProps {
  event: TriadeEvent;
  /** já confirmou presença? */
  going: boolean;
  onRsvp: (id: string) => void;
  onCancelRsvp: (id: string) => void;
  /** ausente = quem está vendo não pode editar; o "..." não aparece */
  onEdit?: (event: TriadeEvent) => void;
  /** 'featured' = card grande do próximo evento (tela Eventos, modo Lista) */
  variant?: 'default' | 'featured';
}

/**
 * Card de uma edição do evento + botão de presença (só "em breve").
 * O mesmo botão confirma e, se tocado de novo, desconfirma a presença.
 */
export function EventCard({ event, going, onRsvp, onCancelRsvp, onEdit, variant = 'default' }: EventCardProps) {
  const featured = variant === 'featured';
  return (
    <>
      <div className={`ev-card glass${featured ? ' featured' : ''}`}>
        <div className="ph">
          <Mark size={featured ? 40 : 30} />
        </div>
        <div className="body">
          <span className={`status-pill ${statusClass(event.status)}`}>{event.status}</span>
          <h3>{event.title}</h3>
          {featured && <p className="theme">{event.theme}</p>}
          <div className="meta">
            <span>
              <Icon name="calendar" size={12} /> {formatEventDateRange(event.date, event.endDate)}
            </span>
            <span>
              <Icon name="pin" size={12} /> {event.location}
            </span>
            {featured && (
              <span>
                <Icon name="mic" size={12} /> {event.speaker}
              </span>
            )}
            {featured && !!event.spots && (
              <span>
                <Icon name="users" size={12} /> {event.spots} vagas
              </span>
            )}
          </div>
          {onEdit && (
            <Kebab
              label="Opções do evento"
              actions={[{ label: 'Editar', icon: 'edit', onClick: () => onEdit(event) }]}
            />
          )}
        </div>
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
