import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { founders } from '@/data/seed';
import { firstName, formatEventDate, statusClass } from '@/lib/format';
import { buildTicketMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import type { TriadeEvent } from '@/types';

interface EventModalProps {
  event: TriadeEvent;
  onClose: () => void;
}

const sortedFounders = [...founders].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

/**
 * Pop-up de detalhes do evento. "Quero participar" leva a um segundo passo
 * com as 3 sócias — cada botão abre o WhatsApp com uma mensagem pronta.
 */
export function EventModal({ event, onClose }: EventModalProps) {
  const [step, setStep] = useState<'details' | 'contact'>('details');

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay center" onClick={onClose}>
      <div
        className="modal-sheet glass-dark"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${event.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Fechar" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>

        {step === 'details' ? (
          <>
            <div className="modal-ph">
              <Mark size={30} />
            </div>
            <span className={`status-pill ${statusClass(event.status)}`}>{event.status}</span>
            <h2 className="modal-title">{event.title}</h2>
            <p className="modal-theme">{event.theme}</p>
            <div className="modal-meta">
              <span>
                <Icon name="calendar" size={14} /> {formatEventDate(event.date)}
              </span>
              <span>
                <Icon name="pin" size={14} /> {event.location}
              </span>
              <span>
                <Icon name="mic" size={14} /> {event.speaker}
              </span>
              <span>
                <Icon name="users" size={14} /> {event.spots} vagas
              </span>
            </div>
            {event.status === 'em breve' && (
              <button className="btn btn-primary full" onClick={() => setStep('contact')}>
                Quero participar
              </button>
            )}
          </>
        ) : (
          <>
            <button className="modal-back" onClick={() => setStep('details')}>
              <Icon name="chevronLeft" size={14} /> Voltar
            </button>
            <h2 className="modal-title">Fale com a gente!</h2>
            <p className="modal-theme">
              Escolha quem vai te ajudar a garantir sua vaga na {event.title}.
            </p>
            <div className="modal-contacts">
              {sortedFounders.map((f) => (
                <a
                  key={f.id}
                  className="wa-btn"
                  href={buildWhatsAppLink(f.whatsapp, buildTicketMessage(event, firstName(f.name)))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="av">{f.initials}</span>
                  <span className="who">
                    <span className="n">{f.name}</span>
                    <span className="r">{f.whatsapp}</span>
                  </span>
                  <span className="wa-badge">
                    <Icon name="whatsapp" size={17} />
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
