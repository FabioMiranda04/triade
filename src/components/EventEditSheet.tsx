import { useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import { createEvent, saveEventEdit } from '@/lib/db/localContent';
import type { EventStatus, TriadeEvent } from '@/types';

interface EventEditSheetProps {
  /** null = criar evento novo */
  event: TriadeEvent | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Formulário de criação/edição de evento — grava só no navegador (ver localContent.ts). */
export function EventEditSheet({ event, onClose, onSaved }: EventEditSheetProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(event?.date ?? '');
  const [status, setStatus] = useState<EventStatus>(event?.status ?? 'em breve');
  const [location, setLocation] = useState(event?.location ?? 'Goiânia, GO');
  const [speaker, setSpeaker] = useState(event?.speaker ?? '');
  const [theme, setTheme] = useState(event?.theme ?? '');
  const [spots, setSpots] = useState(event?.spots ?? 65);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const patch = { title, date, status, location, speaker, theme, spots };
    if (event) {
      saveEventEdit(event.id, patch);
    } else {
      createEvent({ id: `ev-${Date.now()}`, ...patch });
    }
    onSaved();
  }

  return (
    <EditSheet title={event ? 'Editar evento' : 'Novo evento'} onClose={onClose} onSubmit={handleSubmit}>
      <label className="field">
        <span>Título</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="field">
        <span>Data</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label className="field">
        <span>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}>
          <option value="em breve">Em breve</option>
          <option value="realizado">Realizado</option>
        </select>
      </label>
      <label className="field">
        <span>Local</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} required />
      </label>
      <label className="field">
        <span>Palestrante</span>
        <input value={speaker} onChange={(e) => setSpeaker(e.target.value)} required />
      </label>
      <label className="field">
        <span>Tema</span>
        <textarea value={theme} onChange={(e) => setTheme(e.target.value)} required />
      </label>
      <label className="field">
        <span>Vagas</span>
        <input
          type="number"
          min={0}
          value={spots}
          onChange={(e) => setSpots(Number(e.target.value))}
          required
        />
      </label>
    </EditSheet>
  );
}
