import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { RecorteFoto } from '@/components/RecorteFoto';
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
  /** rótulo do bloco — o padrão serve para a retrospectiva de uma edição */
  titulo?: string;
  /** quantas fotos cabem. 1 transforma o bloco em "foto única" */
  max?: number;
  /** a legenda por foto só faz sentido numa galeria */
  comLegenda?: boolean;
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
export function GaleriaEditor({
  fotos,
  onChange,
  pasta,
  podeSubir,
  titulo = 'Fotos da edição',
  max = Infinity,
  comLegenda = true,
}: GaleriaEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  // foto única passa pelo recorte antes de subir — ver `RecorteFoto`
  const [recortando, setRecortando] = useState<File | null>(null);
  // as URLs `blob:` precisam ser liberadas na mão, senão o arquivo fica
  // preso na memória da aba até a página recarregar
  const previas = useRef<string[]>([]);
  useEffect(() => {
    const criadas = previas.current;
    return () => criadas.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  async function receber(arquivos: File[]) {
    if (arquivos.length === 0) return;
    // com `max = 1`, escolher um arquivo novo troca a foto em vez de
    // empilhar — é o que a pessoa espera de um campo de foto única
    const anteriores = max === 1 ? [] : fotos;
    const escolhidos = arquivos.slice(0, max - anteriores.length);
    const novos: FotoEmEdicao[] = [];
    for (const arquivo of escolhidos) {
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

    const base = [...anteriores, ...novos];
    onChange(base);

    // sobe uma a uma, atualizando a lista conforme cada uma termina
    let atual = base;
    const paraSubir = escolhidos.filter(
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

  /**
   * Uma foto só (o post) passa pelo recorte: é ela que precisa caber num
   * 4:3 sem cortar cabeça. Numa galeria de várias, recortar uma a uma seria
   * castigo — ali o `cover` resolve.
   */
  function escolher(arquivos: File[]) {
    const so = arquivos[0];
    if (max === 1 && so?.type.startsWith('image/')) setRecortando(so);
    else void receber(arquivos);
  }

  function remover(indice: number) {
    onChange(fotos.filter((_, i) => i !== indice));
  }

  function mudarLegenda(indice: number, legenda: string) {
    onChange(fotos.map((f, i) => (i === indice ? { ...f, legenda } : f)));
  }

  return (
    <div className="galeria-editor">
      {recortando && (
        <RecorteFoto
          arquivo={recortando}
          onCancel={() => setRecortando(null)}
          onPronto={(recortado) => {
            setRecortando(null);
            void receber([recortado]);
          }}
        />
      )}
      <span className="ge-titulo">{titulo}</span>

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
                ) : !comLegenda ? (
                  <span className="ge-estado">{foto.subindo ? 'Enviando…' : 'Foto no ar'}</span>
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

      {/* em foto única o botão nunca some: ele TROCA. Escondê-lo quando já
          existe foto obrigaria a remover antes para poder trocar. */}
      {podeSubir && (fotos.length < max || max === 1) ? (
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
              void escolher(Array.from(e.dataTransfer.files));
            }}
          >
            <Icon name="plus" size={17} />
            <span>{fotos.length > 0 && max === 1 ? 'Trocar foto' : 'Adicionar foto'}</span>
            <span className="ge-dica">JPG ou PNG, até {TAMANHO_MAX_MB} MB</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={max !== 1}
            hidden
            onChange={(e) => {
              void escolher(Array.from(e.target.files ?? []));
              // sem isto, escolher o MESMO arquivo de novo não dispara change
              e.target.value = '';
            }}
          />
        </>
      ) : podeSubir ? null : (
        <p className="ge-aviso">
          Enviar fotos exige uma conta com permissão de edição. Sem ela, o que você mudar aqui fica
          salvo só neste aparelho.
        </p>
      )}
    </div>
  );
}
