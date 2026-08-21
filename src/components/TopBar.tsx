import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { useToast } from '@/components/Toast';

/** Header fixo: logo (volta para o Início) + busca + notificações. */
export function TopBar() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <header className="app-top glass">
      <div className="sheen" />
      <button className="brand" onClick={() => navigate('/')} aria-label="Ir para o início">
        <Mark size={28} />
        <span>
          <span className="name">TRÍADE</span>
          <span className="tag">conecta</span>
        </span>
      </button>
      <div className="top-actions">
        <button
          className="icon-btn"
          aria-label="Buscar"
          onClick={() => showToast('Em breve: busca na comunidade')}
        >
          <Icon name="search" size={17} />
        </button>
        <button
          className="icon-btn"
          aria-label="Notificações"
          onClick={() => showToast('Em breve: notificações')}
        >
          <Icon name="bell" size={17} />
        </button>
      </div>
    </header>
  );
}
