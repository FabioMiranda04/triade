import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { SettingsSheet } from '@/components/SettingsSheet';
import { useToast } from '@/components/Toast';

/** Header fixo: logo (volta para o Início) + busca + notificações + configurações. */
export function TopBar() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        <button className="icon-btn" aria-label="Configurações" onClick={() => setSettingsOpen(true)}>
          <Icon name="settings" size={17} />
        </button>
      </div>
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
    </header>
  );
}
