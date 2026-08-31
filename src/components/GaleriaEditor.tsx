import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { db } from '@/lib/db';
import type { EventRecapMedia } from '@/types';

/** Acima disto o upload demora demais no 4G de quem está no evento. */
const TAMANHO_MAX_MB = 12;

export interface FotoEmEdicao extends EventRecapMedia {
  /** URL local (`blob:`) enquanto o arquivo ainda está subindo */
  previa?: string;
  subindo?: boolean;
  erro?: string;
}

interface GaleriaEditorProps {
  fotos: FotoEmEdicao[];
  onChange: (fotos: FotoEmEdicao[]) => void;
  /** agrupa os arquivos no bucket — normalmente o id da edição */
  pasta: string;
  /**
   * `false` quando a usuária não pode escrever no banco (sem Supabase, sem
   * login, ou logada sem permissão). O bloco vira um aviso em vez de sumir:
   * sumir faria parecer que o app não tem a função.
   */
  podeSubir: boolean;
}

/**
 * Gerenciador das fotos de uma edição, dentro do pop-up de edição.
 *
 * O arquivo sobe para o Storage do Supabase **assim que é escolhido**, e o
 * que fica guardado no formulário é só a URL pública. Isso é de propósito:
 * segurar o arquivo até o "Salvar" significaria enviar tudo de uma vez, com
 * a usuária olhando um botão travado sem saber se são 2s ou 40s. Subindo na
 * hora, cada foto tem seu próprio estado e um erro em uma não derruba as
 * outras.
 *
 * Enquanto sobe, a miniatura mostrada é a prévia local (`blob:`) — a
 * usuária vê a foto que escolheu no mesmo instante, sem esperar a rede.
 */
export function GaleriaEditor({ fotos, onChange, pasta, podeSubir }: GaleriaEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  // as URLs `blob:` precisam ser liberadas na mão, senão o arquivo fica
  // preso na memória da aba até a página recarregar
  const previas = useRef<string[]>([]);
  useEffect(() => {
    const criadas = previas.current;
    return () => criadas.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  async function receber(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    const novos: FotoEmEdicao[] = [];
    for (const arquivo of Array.from(arquivos)) {
      if (!arquivo.type.startsWith('image/')) {
        novos.push({ tipo: 'foto', url: '', erro: `"${arquivo.name}" não é uma imagem.` });
        continue;
      }
      if (arquivo.size > TAMANHO_MAX_MB * 1024 * 1024) {
        novos.push({
          tipo: 'foto',
          url: '',
          erro: `"${arquivo.name}" tem mais de ${TAMANHO_MAX_MB} MB.`,
        });
        continue;
      }
      const previa = URL.createObjectURL(arquivo);
      previas.current.push(previa);
      novos.push({ tipo: 'foto', url: '', legenda: '', previa, subindo: true });
    }

    const base = [...fotos, ...novos];
    onChange(base);

    // sobe uma a uma, atualizando a lista conforme cada uma termina
    let atual = base;
    const paraSubir = Array.from(arquivos).filter(
      (a) => a.type.startsWith('image/') && a.size <= TAMANHO_MAX_MB * 1024 * 1024,
    );
    for (const arquivo of paraSubir) {
      const alvo = atual.findIndex((f) => f.subindo && !f.url);
      if (alvo === -1) continue;
      try {
        const url = await db.uploadMedia(arquivo, pasta);
        atual = atual.map((f, i) => (i === alvo ? { ...f, url, subindo: false } : f));
      } catch (erro) {
        const msg = erro instanceof Error ? erro.message : 'Falha ao subir.';
        atual = atual.map((f, i) => (i === alvo ? { ...f, subindo: false, erro: msg } : f));
      }
      onChange(atual);
    }
  }

  function remover(indice: number) {
    onChange(fotos.filter((_, i) => i !== indice));
  }

  function mudarLegenda(indice: number, legenda: string) {
    onChange(fotos.map((f, i) => (i === indice ? { ...f, legenda } : f)));
  }

  return (
    <div className="galeria-editor">
      <span className="ge-titulo">Fotos da edição</span>

      {fotos.length > 0 && (
        <ul className="ge-lista">
          {fotos.map((foto, i) => (
            <li key={foto.url || foto.previa || i} className={foto.erro ? 'ge-item erro' : 'ge-item'}>
              <span className="ge-thumb">
                {(foto.previa || foto.url) && (
                  <img src={foto.previa || foto.url} alt="" />
                )}
                {foto.subindo && <span className="ge-subindo" aria-label="Enviando" />}
              </span>
              <span className="ge-meio">
                {foto.erro ? (
                  <span className="ge-erro">{foto.erro}</span>
                ) : (
                  <input
                    className="ge-legenda"
                    value={foto.legenda ?? ''}
                    placeholder={foto.subindo ? 'Enviando…' : 'Legenda (opcional)'}
                    disabled={foto.subindo}
                    onChange={(e) => mudarLegenda(i, e.target.value)}
                  />
                )}
              </span>
              <button
                type="button"
                className="ge-remover"
                aria-label="Remover foto"
                onClick={() => remover(i)}
              >
                <Icon name="close" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {podeSubir ? (
        <>
          <button
            type="button"
            className={arrastando ? 'ge-solta arrastando' : 'ge-solta'}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastando(false);
              void receber(e.dataTransfer.files);
            }}
          >
            <Icon name="plus" size={17} />
            <span>Adicionar foto</span>
            <span className="ge-dica">JPG ou PNG, até {TAMANHO_MAX_MB} MB</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              void receber(e.target.files);
              // sem isto, escolher o MESMO arquivo de novo não dispara change
              e.target.value = '';
            }}
          />
        </>
      ) : (
        <p className="ge-aviso">
          Enviar fotos exige uma conta com permissão de edição. Sem ela, o que você mudar aqui fica
          salvo só neste aparelho.
        </p>
      )}
    </div>
  );
}
