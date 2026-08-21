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

/** Fileira de stories no topo do Início. */
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
