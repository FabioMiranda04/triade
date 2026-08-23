import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { useTabBarStyle } from '@/context/TabBarStyleContext';

interface TabDef {
  to: string;
  label: string;
  icon: IconName;
  /** o item central (Eventos) ganha o badge circular destacado — só no Padrão */
  center?: boolean;
}

const TABS: TabDef[] = [
  { to: '/', label: 'Início', icon: 'home' },
  { to: '/sobre', label: 'Sobre', icon: 'heart' },
  { to: '/eventos', label: 'Eventos', icon: 'calendar', center: true },
  { to: '/palestrantes', label: 'Palestrantes', icon: 'mic' },
];

/**
 * Barra inferior de navegação. Tem dois estilos, trocáveis em
 * Configurações → Navegação (`TabBarStyleContext`):
 * "Padrão" — fixa, borda a borda, estilo Instagram/iOS (o original do app);
 * "Padrão 2" — pílula flutuante e compacta, estilo Uber. Em ambos, o `<nav>`
 * reserva sempre o mesmo espaço no rodapé — só a aparência interna muda.
 *
 * O último item é sempre "Perfil" — não é uma rota, abre o pop-up de conta
 * (`AccountSheet`, via `openAccount`), com a foto de quem estiver logada no
 * lugar do ícone genérico. "Planos" saiu daqui — virou o CTA "Quero ser
 * membro!" sempre visível no cabeçalho (ver `TopBar`).
 */
export function TabBar() {
  const { style } = useTabBarStyle();
  const { profile, openAccount } = useAuth();
  const floating = style === 'padrao2';
  const iconSize = floating ? 20 : 22;

  const links = TABS.map((tab) => (
    <NavLink
      key={tab.to}
      to={tab.to}
      end={tab.to === '/'}
      className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
      aria-label={tab.label}
    >
      {tab.center && !floating ? (
        <span className="center-badge">
          <Icon name={tab.icon} size={18} />
        </span>
      ) : (
        <Icon name={tab.icon} size={iconSize} />
      )}
      <span className="dot" />
    </NavLink>
  ));

  links.push(
    <button key="perfil" type="button" className="tab" aria-label="Perfil" onClick={openAccount}>
      {profile?.avatar_url ? (
        <img className="tab-avatar" src={profile.avatar_url} alt="" style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Icon name="user" size={iconSize} />
      )}
      <span className="dot" />
    </button>,
  );

  if (floating) {
    return (
      <nav className="tabbar padrao2-wrap" aria-label="Navegação principal">
        <div className="tab-pill glass-dark">{links}</div>
      </nav>
    );
  }

  return (
    <nav className="tabbar glass-dark" aria-label="Navegação principal">
      {links}
    </nav>
  );
}
