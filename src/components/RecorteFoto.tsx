import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { ModalOverlay } from '@/components/ModalOverlay';

/** A mesma proporção do bloco de imagem do post (`.post-media`, 4/3). */
const PROPORCAO = 4 / 3;
/** Largura do arquivo gerado. 1200 cobre um iPhone Pro em 3x sem virar peso morto. */
const LARGURA_FINAL = 1200;

interface RecorteFotoProps {
  arquivo: File;
  onCancel: () => void;
  onPronto: (recortado: File) => void;
}

/**
 * Recorte antes do upload.
 *
 * O acervo da Tríade é Stories 9:16 e o bloco do post é 4:3 — um `object-fit:
 * cover` decide o corte sozinho e às vezes decapita alguém. Aqui quem escolhe
 * é quem está publicando: arrasta para enquadrar, controle para aproximar, e
 * o que sobe já é o quadro final.
 *
 * O enquadramento é o mesmo cálculo do `cover` (a imagem nunca fica menor que
 * a moldura, então não existe borda vazia), só que com o deslocamento na mão.
 */
export function RecorteFoto({ arquivo, onCancel, onPronto }: RecorteFotoProps) {
  const [url] = useState(() => URL.createObjectURL(arquivo));
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [moldura, setMoldura] = useState({ w: 0, h: 0 });
  const molduraRef = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  useEffect(() => {
    const el = molduraRef.current;
    if (!el) return;
    const medir = () => setMoldura({ w: el.clientWidth, h: el.clientHeight });
    medir();
    // o teclado do celular abrindo redimensiona o pop-up no meio do recorte
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Geometria do `cover`: a imagem cobre a moldura na escala 1, e o zoom só
  // multiplica isso. `limite` é o quanto ela pode deslizar antes de mostrar vazio.
  const base = img && moldura.w ? Math.max(moldura.w / img.naturalWidth, moldura.h / img.naturalHeight) : 0;
  const k = base * zoom;
  const larg = img ? img.naturalWidth * k : 0;
  const alt = img ? img.naturalHeight * k : 0;
  const limite = { x: Math.max(0, (larg - moldura.w) / 2), y: Math.max(0, (alt - moldura.h) / 2) };

  function preso(p: { x: number; y: number }) {
    return {
      x: Math.min(limite.x, Math.max(-limite.x, p.x)),
      y: Math.min(limite.y, Math.max(-limite.y, p.y)),
    };
  }

  // ao aproximar, a sobra cresce; ao afastar, o enquadramento pode ter
  // ficado fora do novo limite e precisa voltar para dentro
  useEffect(() => setPos(preso), [zoom, moldura.w, img]); // eslint-disable-line react-hooks/exhaustive-deps

  function confirmar() {
    if (!img || !moldura.w) return;
    const canvas = document.createElement('canvas');
    canvas.width = LARGURA_FINAL;
    canvas.height = Math.round(LARGURA_FINAL / PROPORCAO);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const r = LARGURA_FINAL / moldura.w;
    ctx.drawImage(
      img,
      ((moldura.w - larg) / 2 + pos.x) * r,
      ((moldura.h - alt) / 2 + pos.y) * r,
      larg * r,
      alt * r,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.jpg';
        onPronto(new File([blob], nome, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.86,
    );
  }

  return (
    <ModalOverlay onClose={onCancel}>
      <div
        className="modal-sheet glass-dark recorte"
        role="dialog"
        aria-modal="true"
        aria-label="Recortar foto"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" aria-label="Fechar" onClick={onCancel}>
          <Icon name="close" size={18} />
        </button>
        <h2 className="modal-title">Enquadrar a foto</h2>
        <p className="recorte-dica">Arraste para escolher o pedaço que aparece.</p>

        <div
          className="recorte-moldura"
          ref={molduraRef}
          onPointerDown={(e) => {
            arrasto.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!arrasto.current) return;
            setPos(preso({ x: e.clientX - arrasto.current.x, y: e.clientY - arrasto.current.y }));
          }}
          onPointerUp={() => {
            arrasto.current = null;
          }}
        >
          <img
            src={url}
            alt=""
            draggable={false}
            onLoad={(e) => setImg(e.currentTarget)}
            style={
              img
                ? {
                    width: larg,
                    height: alt,
                    left: (moldura.w - larg) / 2 + pos.x,
                    top: (moldura.h - alt) / 2 + pos.y,
                  }
                : { visibility: 'hidden' }
            }
          />
        </div>

        <label className="recorte-zoom">
          <Icon name="search" size={15} />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            aria-label="Aproximar"
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        <button type="button" className="btn btn-primary full" onClick={confirmar} disabled={!img}>
          Usar esta foto
        </button>
      </div>
    </ModalOverlay>
  );
}
