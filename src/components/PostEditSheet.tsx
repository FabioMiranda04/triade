import { useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import { GaleriaEditor } from '@/components/GaleriaEditor';
import type { FotoEmEdicao } from '@/components/GaleriaEditor';
import { usePodeEditar } from '@/hooks/usePodeEditar';
import { savePostEdit } from '@/lib/db/localContent';
import type { Post, TriadeEvent } from '@/types';

interface PostEditSheetProps {
  post: Post;
  events: TriadeEvent[];
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Formulário de edição do post de próximo evento em destaque na Início.
 *
 * A foto é o campo que mais importa aqui: sem ela o post cai no gradiente
 * com a marca no meio, que é só um selo de "ainda não tem imagem" — ver
 * `Post.mediaUrl`.
 *
 * O arquivo em si sobe para o Storage do Supabase (real, compartilhado),
 * mas post não tem tabela no banco: o vínculo entre post e foto continua
 * indo para o overlay local do navegador. O aviso no topo diz isso.
 */
export function PostEditSheet({ post, events, onClose, onSaved }: PostEditSheetProps) {
  const podeSubir = usePodeEditar();
  const [caption, setCaption] = useState(post.caption);
  const [ctaLabel, setCtaLabel] = useState(post.ctaLabel ?? 'Ver detalhes');
  const [eventId, setEventId] = useState(post.eventId ?? events[0]?.id ?? '');
  const [fotos, setFotos] = useState<FotoEmEdicao[]>(
    post.mediaUrl ? [{ tipo: 'foto', url: post.mediaUrl }] : [],
  );


  const subindo = fotos.some((f) => f.subindo);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (subindo) return;
    savePostEdit(post.id, { caption, ctaLabel, eventId, mediaUrl: fotos[0]?.url || undefined });
    onSaved();
  }

  return (
    <EditSheet
      title="Editar post em destaque"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={subindo ? 'Enviando foto…' : 'Salvar'}
      submitDisabled={subindo}
      aviso="O post ainda não grava no banco: o que você mudar aqui fica só neste aparelho."
    >
      <GaleriaEditor
        fotos={fotos}
        onChange={setFotos}
        pasta={`posts/${post.id}`}
        podeSubir={podeSubir}
        titulo="Foto do post"
        max={1}
        comLegenda={false}
      />
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
