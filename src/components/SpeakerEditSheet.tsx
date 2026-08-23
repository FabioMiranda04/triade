import { useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import { createSpeaker, saveSpeakerEdit } from '@/lib/db/localContent';
import type { Speaker } from '@/types';

interface SpeakerEditSheetProps {
  /** null = criar palestrante nova */
  speaker: Speaker | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Formulário de criação/edição de palestrante — grava só no navegador (ver localContent.ts). */
export function SpeakerEditSheet({ speaker, onClose, onSaved }: SpeakerEditSheetProps) {
  const [name, setName] = useState(speaker?.name ?? '');
  const [topic, setTopic] = useState(speaker?.topic ?? '');
  const [bio, setBio] = useState(speaker?.bio ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const patch = { name, topic, bio };
    if (speaker) {
      saveSpeakerEdit(speaker.id, patch);
    } else {
      createSpeaker({ id: `sp-${Date.now()}`, ...patch });
    }
    onSaved();
  }

  return (
    <EditSheet
      title={speaker ? 'Editar palestrante' : 'Nova palestrante'}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <label className="field">
        <span>Nome</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field">
        <span>Tema</span>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} required />
      </label>
      <label className="field">
        <span>Bio</span>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} required />
      </label>
    </EditSheet>
  );
}
