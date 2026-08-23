import { Icon } from '@/components/Icon';
import { ModalOverlay } from '@/components/ModalOverlay';
import { useTabBarStyle } from '@/context/TabBarStyleContext';
import type { TabBarStyle } from '@/context/TabBarStyleContext';

interface SettingsSheetProps {
  onClose: () => void;
}

const TABBAR_OPTIONS: { value: TabBarStyle; label: string }[] = [
  { value: 'padrao', label: 'Padrão' },
  { value: 'padrao2', label: 'Padrão 2' },
];

/** Pop-up de configurações do app, com lista agrupada estilo iOS. */
export function SettingsSheet({ onClose }: SettingsSheetProps) {
  const { style, setStyle } = useTabBarStyle();

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="modal-sheet glass-dark"
        role="dialog"
        aria-modal="true"
        aria-label="Configurações"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Fechar" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <h2 className="modal-title">Configurações</h2>

        <div className="ios-section-label">Navegação</div>
        <div className="ios-group">
          {TABBAR_OPTIONS.map((opt) => (
            <button key={opt.value} className="ios-row" onClick={() => setStyle(opt.value)}>
              <span>{opt.label}</span>
              {style === opt.value && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
        <p className="ios-hint">Estilo da barra de navegação no rodapé do app.</p>
      </div>
    </ModalOverlay>
  );
}
