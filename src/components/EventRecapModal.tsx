import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { ModalOverlay } from '@/components/ModalOverlay';
import { formatEventDate, statusClass } from '@/lib/format';
import type { TriadeEvent } from '@/types';

interface EventRecapModalProps {
  event: TriadeEvent;
  onClose: () => void;
}

/** Placeholder de foto (sem material real ainda, ver Módulo 11) é sempre um gradiente CSS. */
function isPlaceholderGradient(url: string): boolean {
  return url.startsWith('linear-gradient');
}

/** Pop-up de retrospectiva de uma edição já realizada — texto + galeria de fotos/vídeos. */
export function EventRecapModal({ event, onClose }: EventRecapModalProps) {
  const hasRecap = Boolean(event.recapText) || Boolean(event.recapMedia?.length);

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="modal-sheet glass-dark"
        role="dialog"
        aria-modal="true"
        aria-label={`Retrospectiva de ${event.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Fechar" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>

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
        </div>

        {event.recapText && <p className="recap-text">{event.recapText}</p>}

        {event.recapMedia && event.recapMedia.length > 0 && (
          <div className="recap-gallery">
            {event.recapMedia.map((media, i) =>
              media.tipo === 'vídeo' ? (
                <div className="recap-video" key={i}>
                  <iframe src={media.url} title={media.legenda ?? event.title} loading="lazy" allowFullScreen />
                  {media.legenda && <span className="cap">{media.legenda}</span>}
                </div>
              ) : isPlaceholderGradient(media.url) ? (
                <div className="recap-photo" key={i} style={{ background: media.url }}>
                  {media.legenda && <span className="cap">{media.legenda}</span>}
                </div>
              ) : (
                <div className="recap-photo" key={i}>
                  <img src={media.url} alt={media.legenda ?? ''} loading="lazy" />
                  {media.legenda && <span className="cap">{media.legenda}</span>}
                </div>
              ),
            )}
          </div>
        )}

        {!hasRecap && <p className="modal-theme">Em breve, o registro completo dessa edição.</p>}
      </div>
    </ModalOverlay>
  );
}
