import { useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import { savePostEdit } from '@/lib/db/localContent';
import type { Post, TriadeEvent } from '@/types';

interface PostEditSheetProps {
  post: Post;
  events: TriadeEvent[];
  onClose: () => void;
  onSaved: () => void;
}

/** Formulário de edição do post de próximo evento em destaque na Início. */
export function PostEditSheet({ post, events, onClose, onSaved }: PostEditSheetProps) {
  const [caption, setCaption] = useState(post.caption);
  const [ctaLabel, setCtaLabel] = useState(post.ctaLabel ?? 'Ver detalhes');
  const [eventId, setEventId] = useState(post.eventId ?? events[0]?.id ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    savePostEdit(post.id, { caption, ctaLabel, eventId });
    onSaved();
  }

  return (
    <EditSheet title="Editar post em destaque" onClose={onClose} onSubmit={handleSubmit}>
      <label className="field">
        <span>Legenda</span>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} required />
      </label>
      <label className="field">
        <span>Texto do botão</span>
        <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} required />
      </label>
      <label className="field">
        <span>Evento vinculado</span>
        <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </label>
    </EditSheet>
  );
}
