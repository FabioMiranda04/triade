import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { useToast } from '@/components/Toast';

interface StoryDef {
  label: string;
  icon: IconName;
  /** rota de destino; sem rota, mostra um toast de "em breve" */
  to?: string;
}

const STORIES: StoryDef[] = [
  { label: 'Conexão', icon: 'heart', to: '/sobre' },
  { label: 'Inspiração', icon: 'sparkle', to: '/planos' },
  { label: 'Ação', icon: 'check' },
  { label: 'Próx. edição', icon: 'calendar', to: '/eventos' },
  { label: 'Palestras', icon: 'mic', to: '/palestrantes' },
];

/**
 * Fileira de "stories" no topo do Início.
 *
 * **Fora de uso desde 26/08/2026 — não recolocar sem conteúdo real.**
 * Motivo: ela parecia stories do Instagram (anel circular = foto/vídeo que
 * some), mas entregava navegação — e navegação DUPLICADA. Quatro dos cinco
 * atalhos levavam a destinos que já estão na barra de baixo ou no CTA do
 * cabeçalho, com nomes DIFERENTES dos de lá ("Conexão" para Sobre,
 * "Inspiração" para Planos), o que ensinava um vocabulário errado; o
 * quinto ("Ação") não levava a lugar nenhum. E "Conexão / Inspiração /
 * Ação" já aparecem escritos logo abaixo, na seção dos três pilares.
 *
 * O componente ficou de pé porque o Módulo 11 traz Stories e destaques
 * reais do export do Instagram — aí este é o lugar certo para eles, com
 * foto de verdade em vez de ícone.
 */
export function Stories() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <div className="stories">
      {STORIES.map((story) => (
        <button
          key={story.label}
          className="story"
          onClick={() =>
            story.to ? navigate(story.to) : showToast('Em breve: conteúdo dos stories')
          }
        >
          <span className="ring">
            <span className="hole">
              <Icon name={story.icon} size={20} />
            </span>
          </span>
          <span className="lbl">{story.label}</span>
        </button>
      ))}
    </div>
  );
}
