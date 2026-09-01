import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Kebab } from '@/components/Kebab';
import { Mark } from '@/components/Brand';
import { useToast } from '@/components/Toast';
import { useEngagement } from '@/hooks/useEngagement';
import { useDoubleTap } from '@/hooks/useDoubleTap';
import type { Post, TabId } from '@/types';

const TAB_PATH: Record<TabId, string> = {
  inicio: '/',
  sobre: '/sobre',
  eventos: '/eventos',
  palestrantes: '/palestrantes',
  planos: '/planos',
};

/**
 * Post do feed, estilo rede social: avatar, imagem, ações
 * (curtir / compartilhar / salvar) e legenda.
 * Curtir também funciona com duplo toque na imagem.
 *
 * **Não existe botão de comentar** — ele existiu até 26/08/2026 mostrando
 * só um toast de "em breve". Um botão que não faz o que promete não é lido
 * como "ainda não pronto": é lido como "eu errei alguma coisa" ou "esse app
 * está quebrado", e isso custa a confiança que vira venda de plano. Ele
 * volta quando o Módulo 3 entregar comentários de verdade.
 */
interface PostCardProps {
  post: Post;
  /** chamado no lugar da navegação quando o post tem `eventId` */
  onOpenEvent?: (eventId: string) => void;
  /** presente só no post de evento em destaque — abre o formulário de edição */
  onEdit?: () => void;
  /**
   * Marca este post como "chegando agora". Só o Início usa, e só na
   * primeira montagem da sessão — ver `Home.tsx`.
   */
  destaqueNovo?: boolean;
  /**
   * O chamariz da comunidade: o post do próximo encontro, primeiro card da
   * primeira tela. Ganha moldura dourada e selo. Só um post por vez.
   */
  chamariz?: boolean;
}

export function PostCard({ post, onOpenEvent, onEdit, destaqueNovo, chamariz }: PostCardProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { liked, saved, toggleLike, likeOnly, toggleSave } = useEngagement(post.id);
  const [bursting, setBursting] = useState(false);
  const burstTimer = useRef<number | undefined>(undefined);

  const handleDoubleTap = useDoubleTap(() => {
    likeOnly();
    setBursting(false);
    window.clearTimeout(burstTimer.current);
    // reinicia a animação do coração no próximo frame
    requestAnimationFrame(() => {
      setBursting(true);
      burstTimer.current = window.setTimeout(() => setBursting(false), 800);
    });
  });

  const likes = post.baseLikes + (liked ? 1 : 0);

  return (
    <article
      className={`post glass${chamariz ? ' post-chamariz' : ''}${destaqueNovo ? ' post-novo' : ''}`}
    >
      <div className="post-head">
        <div className="post-avatar">{post.authorInitials}</div>
        <div className="post-who">
          {chamariz && (
            <span className="post-selo">
              <Icon name="sparkle" size={11} />
              Próximo encontro
            </span>
          )}
          <div className="n">{post.author}</div>
          <div className="t">{post.subtitle}</div>
        </div>
        {post.eventId && onEdit ? (
          <Kebab label="Opções do post" actions={[{ label: 'Editar', icon: 'edit', onClick: onEdit }]} />
        ) : (
          <button
            className="act-btn"
            aria-label="Mais opções"
            onClick={() => showToast('Em breve: mais opções do post')}
          >
            <Icon name="more" size={18} />
          </button>
        )}
      </div>

      <div
        className="post-media"
        style={post.mediaGradient ? { background: post.mediaGradient } : undefined}
        onPointerUp={handleDoubleTap}
        onDoubleClick={likeOnly}
        role="img"
        aria-label={post.caption}
      >
        <Mark size={46} />
        <span className={`heart-burst${bursting ? ' burst' : ''}`}>
          <Icon name="heartFill" size={86} />
        </span>
      </div>

      {post.showActions && (
        <>
          <div className="post-actions">
            <button
              className={`act-btn${liked ? ' liked' : ''}`}
              onClick={toggleLike}
              aria-pressed={liked}
              aria-label={liked ? 'Descurtir' : 'Curtir'}
            >
              <Icon name={liked ? 'heartFill' : 'heart'} />
            </button>
            <button
              className="act-btn"
              aria-label="Compartilhar"
              onClick={() => showToast('Link copiado para compartilhar')}
            >
              <Icon name="share" />
            </button>
            <span className="grow" />
            <button
              className={`act-btn${saved ? ' saved' : ''}`}
              onClick={toggleSave}
              aria-pressed={saved}
              aria-label={saved ? 'Remover dos salvos' : 'Salvar'}
            >
              <Icon name={saved ? 'bookmarkFill' : 'bookmark'} />
            </button>
          </div>
          <div className="post-likes">{likes} curtidas</div>
        </>
      )}

      <div className="post-caption">
        <b>{post.author}</b> {post.caption}
      </div>

      {(post.eventId || post.ctaTab) && (
        <div className="post-cta">
          <button
            className="btn btn-primary full"
            onClick={() =>
              post.eventId ? onOpenEvent?.(post.eventId) : navigate(TAB_PATH[post.ctaTab!])
            }
          >
            {post.ctaLabel ?? 'Ver mais'} <Icon name="chevronRight" size={15} />
          </button>
        </div>
      )}
    </article>
  );
}
