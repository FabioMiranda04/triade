import { Icon } from '@/components/Icon';
import { ModalOverlay } from '@/components/ModalOverlay';
import { useTabBarStyle } from '@/context/TabBarStyleContext';
import type { TabBarStyle } from '@/context/TabBarStyleContext';
import { THEMES, useTheme } from '@/context/ThemeContext';

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
  const { theme, setTheme } = useTheme();

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

        <div className="ios-section-label">Aparência</div>
        <div className="ios-group">
          {THEMES.map((opt) => (
            <button
              key={opt.value}
              className="ios-row"
              aria-pressed={theme === opt.value}
              onClick={() => setTheme(opt.value)}
            >
              <span className="ios-row-main">
                <span className="theme-swatch" data-theme-preview={opt.value} aria-hidden="true" />
                <span className="ios-row-text">
                  <span className="t">{opt.label}</span>
                  <span className="s">{opt.hint}</span>
                </span>
              </span>
              {theme === opt.value && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
        <p className="ios-hint">Vale para o app inteiro e fica salvo neste aparelho.</p>

        <div className="ios-section-label">Navegação</div>
        <div className="ios-group">
          {TABBAR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="ios-row"
              aria-pressed={style === opt.value}
              onClick={() => setStyle(opt.value)}
            >
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
