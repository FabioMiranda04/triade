import { Icon } from '@/components/Icon';
import { Kebab } from '@/components/Kebab';
import { Mark } from '@/components/Brand';
import { useIngresso } from '@/hooks/useIngresso';
import { formatEventDateRange, statusClass } from '@/lib/format';
import { formatCentavos } from '@/lib/ingresso';
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
export function EventCard({
  event,
  going,
  onRsvp,
  onCancelRsvp,
  onEdit,
  variant = 'default',
}: EventCardProps) {
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
        <AcaoDoCard event={event} going={going} onRsvp={onRsvp} onCancelRsvp={onCancelRsvp} />
      )}
    </>
  );
}

/**
 * O botão sob o card. Com ingresso à venda, comprar é o principal e o RSVP
 * vira ação secundária para quem ainda está decidindo (SPEC-003 D6).
 */
function AcaoDoCard({
  event,
  going,
  onRsvp,
  onCancelRsvp,
}: Pick<EventCardProps, 'event' | 'going' | 'onRsvp' | 'onCancelRsvp'>) {
  const { ingresso, acao, comprar, comprando } = useIngresso(event);
  const alternarRsvp = () => (going ? onCancelRsvp(event.id) : onRsvp(event.id));

  if (acao === 'ver-ingresso' && ingresso) {
    return ingresso.receiptUrl ? (
      <a
        className="btn btn-glass full ev-rsvp"
        href={ingresso.receiptUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="check" size={16} /> Ingresso garantido · ver comprovante
      </a>
    ) : (
      <p className="btn btn-glass full ev-rsvp" role="status">
        <Icon name="check" size={16} /> Ingresso garantido
      </p>
    );
  }

  if ((acao === 'comprar' || acao === 'entrar-para-comprar') && event.ticketPriceCents) {
    return (
      <>
        <button
          className="btn btn-primary full ev-rsvp"
          onClick={comprar}
          disabled={comprando}
          aria-busy={comprando}
        >
          {comprando
            ? 'Abrindo pagamento…'
            : `Comprar ingresso · ${formatCentavos(event.ticketPriceCents)}`}
        </button>
        <button className="ev-rsvp-sec" onClick={alternarRsvp} aria-pressed={going}>
          {going ? 'Interesse registrado ✓ · desfazer' : 'Ainda decidindo? Avise que tem interesse'}
        </button>
      </>
    );
  }

  return (
    <button
      className={`btn ${going ? 'btn-glass' : 'btn-primary'} full ev-rsvp`}
      onClick={alternarRsvp}
      aria-label={going ? 'Cancelar presença confirmada' : 'Confirmar presença'}
    >
      {going ? 'Presença confirmada ✓ · cancelar' : 'Quero participar'}
    </button>
  );
}
