import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { SettingsSheet } from '@/components/SettingsSheet';

/**
 * Header fixo: logo (volta para o Início) + CTA "Quero ser membro!" (sempre
 * visível, leva para `/planos`) + configurações. Busca e notificações saíram
 * daqui por enquanto — eram só placeholders "em breve", sem função real; e a
 * conta virou o último item da tab bar (ver `TabBar`).
 */
export function TopBar() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="app-top glass">
      <div className="sheen" />
      <button className="brand" onClick={() => navigate('/')} aria-label="Ir para o início">
        <Mark size={28} />
        <span className="brand-lockup">
          <span className="name">TRÍADE</span>
          <span className="tag">conecta</span>
        </span>
      </button>
      <div className="top-actions">
        <button className="btn-cta-member" onClick={() => navigate('/planos')}>
          <Icon name="sparkle" size={13} />
          <span className="cta-full">Quero ser membro!</span>
          <span className="cta-short">Seja membro!</span>
        </button>
        <button className="icon-btn" aria-label="Configurações" onClick={() => setSettingsOpen(true)}>
          <Icon name="settings" size={17} />
        </button>
      </div>
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
    </header>
  );
}
