import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { ModalOverlay } from '@/components/ModalOverlay';
import { founders } from '@/data/seed';
import { useIngresso } from '@/hooks/useIngresso';
import { firstName, formatEventDateRange, statusClass } from '@/lib/format';
import { formatCentavos } from '@/lib/ingresso';
import { buildTicketMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import type { TriadeEvent } from '@/types';

interface EventModalProps {
  event: TriadeEvent;
  onClose: () => void;
  /**
   * Onde o pop-up abre. `contact` pula os detalhes e já mostra as sócias —
   * é o caminho de quem clicou "Quero participar" no feed e já decidiu.
   */
  passoInicial?: 'details' | 'contact';
}

const sortedFounders = [...founders].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

/**
 * Pop-up de detalhes do evento. "Quero participar" leva a um segundo passo
 * com as 3 sócias — cada botão abre o WhatsApp com uma mensagem pronta.
 */
export function EventModal({ event, onClose, passoInicial = 'details' }: EventModalProps) {
  const [step, setStep] = useState<'details' | 'contact'>(passoInicial);

  return (
    <ModalOverlay onClose={onClose}>
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
          <div className="modal-step" key="details">
            <div className="modal-ph">
              <Mark size={30} />
            </div>
            <span className={`status-pill ${statusClass(event.status)}`}>{event.status}</span>
            <h2 className="modal-title">{event.title}</h2>
            <p className="modal-theme">{event.theme}</p>
            <div className="modal-meta">
              <span>
                <Icon name="calendar" size={14} /> {formatEventDateRange(event.date, event.endDate)}
              </span>
              <span>
                <Icon name="pin" size={14} /> {event.location}
              </span>
              <span>
                <Icon name="mic" size={14} /> {event.speaker}
              </span>
              {!!event.spots && (
                <span>
                  <Icon name="users" size={14} /> {event.spots} vagas
                </span>
              )}
            </div>
            {event.status === 'em breve' && (
              <AcaoDoModal event={event} onContato={() => setStep('contact')} />
            )}
          </div>
        ) : (
          <div className="modal-step" key="contact">
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
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

/**
 * SPEC-003 — com ingresso à venda, comprar é o principal; falar com as
 * sócias continua ali, como segunda opção, para quem tem dúvida antes.
 */
function AcaoDoModal({ event, onContato }: { event: TriadeEvent; onContato: () => void }) {
  const { ingresso, acao, comprar, comprando } = useIngresso(event);

  if (acao === 'ver-ingresso' && ingresso) {
    return ingresso.receiptUrl ? (
      <a
        className="btn btn-glass full"
        href={ingresso.receiptUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="check" size={16} /> Ingresso garantido · ver comprovante
      </a>
    ) : (
      <p className="btn btn-glass full" role="status">
        <Icon name="check" size={16} /> Ingresso garantido
      </p>
    );
  }

  if ((acao === 'comprar' || acao === 'entrar-para-comprar') && event.ticketPriceCents) {
    return (
      <div className="modal-acoes">
        <button
          className="btn btn-primary full"
          onClick={comprar}
          disabled={comprando}
          aria-busy={comprando}
        >
          {comprando
            ? 'Abrindo pagamento…'
            : `Comprar ingresso · ${formatCentavos(event.ticketPriceCents)}`}
        </button>
        <button className="btn btn-glass full" onClick={onContato}>
          Tenho dúvidas — falar com a gente
        </button>
      </div>
    );
  }

  return (
    <button className="btn btn-primary full" onClick={onContato}>
      Quero participar
    </button>
  );
}
