import { useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import { GaleriaEditor } from '@/components/GaleriaEditor';
import type { FotoEmEdicao } from '@/components/GaleriaEditor';
import { usePodeEditar } from '@/hooks/usePodeEditar';
import { db } from '@/lib/db';
import { savePostEdit } from '@/lib/db/localContent';
import type { Post, TriadeEvent } from '@/types';

interface PostEditSheetProps {
  post: Post;
  events: TriadeEvent[];
  onClose: () => void;
  /** `noBanco` diz para a tela qual mensagem mostrar depois de salvar */
  onSaved: (noBanco: boolean) => void;
}

/**
 * Formulário de edição do post de próximo evento em destaque na Início.
 *
 * A foto é o campo que mais importa aqui: sem ela o post cai no gradiente
 * com a marca no meio, que é só um selo de "ainda não tem imagem" — ver
 * `Post.mediaUrl`.
 *
 * Mesmos dois destinos do `EventEditSheet`: com permissão grava na tabela
 * `posts` e vale para todo mundo; sem permissão fica no overlay local. O
 * aviso no topo diz qual dos dois está valendo antes de a pessoa digitar.
 */
export function PostEditSheet({ post, events, onClose, onSaved }: PostEditSheetProps) {
  const podeSubir = usePodeEditar();
  const [caption, setCaption] = useState(post.caption);
  const [ctaLabel, setCtaLabel] = useState(post.ctaLabel ?? 'Ver detalhes');
  const [eventId, setEventId] = useState(post.eventId ?? events[0]?.id ?? '');
  const [fotos, setFotos] = useState<FotoEmEdicao[]>(
    post.mediaUrl ? [{ tipo: 'foto', url: post.mediaUrl }] : [],
  );


  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const subindo = fotos.some((f) => f.subindo);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (subindo || salvando) return;
    setErro(null);
    const patch = { caption, ctaLabel, eventId, mediaUrl: fotos[0]?.url || undefined };

    if (podeSubir) {
      setSalvando(true);
      try {
        await db.savePost({ ...post, ...patch });
        onSaved(true);
        return;
      } catch (falha) {
        setErro(falha instanceof Error ? falha.message : 'Não deu para salvar.');
        setSalvando(false);
        return;
      }
    }

    savePostEdit(post.id, patch);
    onSaved(false);
  }

  return (
    <EditSheet
      title="Editar post em destaque"
      onClose={onClose}
      onSubmit={(e) => void handleSubmit(e)}
      submitLabel={salvando ? 'Salvando…' : subindo ? 'Enviando foto…' : 'Salvar'}
      submitDisabled={salvando || subindo}
      aviso={
        podeSubir
          ? 'Você tem permissão de edição: o que salvar aqui vale para todo mundo.'
          : 'Sem permissão de edição — o que você salvar aqui fica só neste aparelho.'
      }
      erro={erro}
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
