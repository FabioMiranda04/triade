import { useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import { db } from '@/lib/db';
import { usePodeEditar } from '@/hooks/usePodeEditar';
import { createSpeaker, saveSpeakerEdit } from '@/lib/db/localContent';
import type { Speaker } from '@/types';

interface SpeakerEditSheetProps {
  /** null = criar palestrante nova */
  speaker: Speaker | null;
  onClose: () => void;
  /** `noBanco` diz para a tela qual mensagem mostrar depois de salvar */
  onSaved: (noBanco: boolean) => void;
}

/**
 * Formulário de criação/edição de palestrante.
 *
 * Mesmos dois destinos do `EventEditSheet`: com permissão grava na tabela
 * `speakers` e vale para todo mundo; sem permissão fica no overlay local
 * (`localContent.ts`). O aviso no topo diz qual dos dois está valendo antes
 * de a pessoa digitar — um formulário que parece publicar e só guarda no
 * navegador é pior que um que não existe.
 */
export function SpeakerEditSheet({ speaker, onClose, onSaved }: SpeakerEditSheetProps) {
  const [name, setName] = useState(speaker?.name ?? '');
  const [topic, setTopic] = useState(speaker?.topic ?? '');
  const [bio, setBio] = useState(speaker?.bio ?? '');
  const podeEditar = usePodeEditar();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const id = speaker?.id ?? `sp-${Date.now()}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (salvando) return;
    setErro(null);
    const patch = { name, topic, bio };

    if (podeEditar) {
      setSalvando(true);
      try {
        await db.saveSpeaker({ id, ...patch });
        onSaved(true);
        return;
      } catch (falha) {
        setErro(falha instanceof Error ? falha.message : 'Não deu para salvar.');
        setSalvando(false);
        return;
      }
    }

    if (speaker) saveSpeakerEdit(speaker.id, patch);
    else createSpeaker({ id, ...patch });
    onSaved(false);
  }

  return (
    <EditSheet
      title={speaker ? 'Editar palestrante' : 'Nova palestrante'}
      onClose={onClose}
      onSubmit={(e) => void handleSubmit(e)}
      submitLabel={salvando ? 'Salvando…' : 'Salvar'}
      submitDisabled={salvando}
      aviso={
        podeEditar
          ? 'Você tem permissão de edição: o que salvar aqui vale para todo mundo.'
          : 'Sem permissão de edição — o que você salvar aqui fica só neste aparelho.'
      }
      erro={erro}
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
