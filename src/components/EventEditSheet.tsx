import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import { GaleriaEditor } from '@/components/GaleriaEditor';
import type { FotoEmEdicao } from '@/components/GaleriaEditor';
import { db } from '@/lib/db';
import { createEvent, saveEventEdit } from '@/lib/db/localContent';
import type { EventStatus, TriadeEvent } from '@/types';

interface EventEditSheetProps {
  /** null = criar evento novo */
  event: TriadeEvent | null;
  onClose: () => void;
  /** `noBanco` diz para a tela qual mensagem mostrar depois de salvar */
  onSaved: (noBanco: boolean) => void;
}

/**
 * Formulário de criação/edição de evento.
 *
 * Tem dois destinos, e qual vale depende da permissão de quem está
 * editando:
 *
 * - **com permissão** (conta na tabela `admins` do Supabase): grava no
 *   banco e as fotos vão para o Storage — muda para todo mundo;
 * - **sem permissão** (o caso normal): grava só no navegador, via
 *   `localContent.ts`, exatamente como era antes do Módulo 5.
 *
 * A diferença é dita na tela em vez de silenciosa: um formulário que
 * parece publicar e só guarda localmente é pior que um que não existe.
 */
export function EventEditSheet({ event, onClose, onSaved }: EventEditSheetProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(event?.date ?? '');
  const [status, setStatus] = useState<EventStatus>(event?.status ?? 'em breve');
  const [location, setLocation] = useState(event?.location ?? 'Goiânia, GO');
  const [speaker, setSpeaker] = useState(event?.speaker ?? '');
  const [theme, setTheme] = useState(event?.theme ?? '');
  const [spots, setSpots] = useState(event?.spots ?? 65);
  const [recapText, setRecapText] = useState(event?.recapText ?? '');
  const [fotos, setFotos] = useState<FotoEmEdicao[]>(event?.recapMedia ?? []);

  const [podeEditar, setPodeEditar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void db.podeEditarConteudo().then((pode) => {
      if (vivo) setPodeEditar(pode);
    });
    return () => {
      vivo = false;
    };
  }, []);

  // o id define a pasta do Storage, então precisa existir antes do upload —
  // num evento novo ele é criado aqui e reaproveitado no salvamento
  const [idNovo] = useState(() => `ev-${Date.now()}`);
  const id = event?.id ?? idNovo;

  const subindoAlguma = fotos.some((f) => f.subindo);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (subindoAlguma) return;
    setErro(null);

    // guarda só o que interessa ao dado: prévia local, estado de upload e
    // mensagem de erro são da tela, não do evento
    const recapMedia = fotos
      .filter((f) => f.url)
      .map(({ tipo, url, legenda }) => ({ tipo, url, ...(legenda ? { legenda } : {}) }));

    const patch = {
      title,
      date,
      status,
      location,
      speaker,
      theme,
      spots,
      recapText: recapText || undefined,
      recapMedia: recapMedia.length > 0 ? recapMedia : undefined,
    };

    if (podeEditar) {
      setSalvando(true);
      try {
        await db.saveEvent({ id, ...patch });
        onSaved(true);
        return;
      } catch (falha) {
        setErro(falha instanceof Error ? falha.message : 'Não deu para salvar.');
        setSalvando(false);
        return;
      }
    }

    if (event) saveEventEdit(event.id, patch);
    else createEvent({ id, ...patch });
    onSaved(false);
  }

  return (
    <EditSheet
      title={event ? 'Editar evento' : 'Novo evento'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={salvando ? 'Salvando…' : subindoAlguma ? 'Enviando fotos…' : 'Salvar'}
      submitDisabled={salvando || subindoAlguma}
      aviso={
        podeEditar
          ? 'Você tem permissão de edição: o que salvar aqui vale para todo mundo.'
          : 'Sem permissão de edição — o que você salvar aqui fica só neste aparelho.'
      }
      erro={erro}
    >
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

      {/* A retrospectiva só faz sentido depois que a edição aconteceu —
          num evento "em breve" os dois campos seriam ruído. */}
      {status === 'realizado' && (
        <>
          <label className="field">
            <span>Retrospectiva</span>
            <textarea
              value={recapText}
              placeholder="Como foi a edição, em um parágrafo."
              onChange={(e) => setRecapText(e.target.value)}
            />
          </label>
          <GaleriaEditor fotos={fotos} onChange={setFotos} pasta={id} podeSubir={podeEditar} />
        </>
      )}
    </EditSheet>
  );
}
