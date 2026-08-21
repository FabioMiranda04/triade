import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';

interface TabDef {
  to: string;
  label: string;
  icon: IconName;
  /** o item central (Eventos) ganha o badge circular destacado */
  center?: boolean;
}

const TABS: TabDef[] = [
  { to: '/', label: 'Início', icon: 'home' },
  { to: '/sobre', label: 'Sobre', icon: 'heart' },
  { to: '/eventos', label: 'Eventos', icon: 'calendar', center: true },
  { to: '/palestrantes', label: 'Palestrantes', icon: 'mic' },
  { to: '/planos', label: 'Planos', icon: 'sparkle' },
];

/**
 * Barra inferior fixa, borda a borda, estilo Instagram/iOS.
 * O respiro da área de gestos do iPhone vem de `--safe-b` no CSS.
 */
export function TabBar() {
  return (
    <nav className="tabbar glass-dark" aria-label="Navegação principal">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
          aria-label={tab.label}
        >
          {tab.center ? (
            <span className="center-badge">
              <Icon name={tab.icon} size={18} />
            </span>
          ) : (
            <Icon name={tab.icon} size={22} />
          )}
          <span className="dot" />
        </NavLink>
      ))}
    </nav>
  );
}
