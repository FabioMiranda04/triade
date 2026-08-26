import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { useTabBarStyle } from '@/context/TabBarStyleContext';

interface TabDef {
  to: string;
  /**
   * Texto do rótulo — visível E usado como nome acessível. Os dois têm que
   * ser o mesmo: um `aria-label` diferente do texto na tela quebra o
   * comando de voz ("tocar em Palestras" não acha um botão chamado
   * "Palestrantes") e a regra 2.5.3 da WCAG.
   *
   * Por isso a aba de palestrantes se chama "Palestras": "Palestrantes"
   * tem 12 caracteres e é cortado com reticências na pílula, que dá ~64px
   * por item em 375px (medido). Rótulo de navegação mais curto que o
   * título da tela é o normal em app — o título continua "Palestrantes".
   */
  label: string;
  icon: IconName;
  /** o item central (Eventos) ganha o badge circular destacado — só no Padrão */
  center?: boolean;
}

const TABS: TabDef[] = [
  { to: '/', label: 'Início', icon: 'home' },
  { to: '/sobre', label: 'Sobre', icon: 'heart' },
  { to: '/eventos', label: 'Eventos', icon: 'calendar', center: true },
  { to: '/palestrantes', label: 'Palestras', icon: 'mic' },
];

/**
 * Barra inferior de navegação. Tem dois estilos, trocáveis em
 * Configurações → Navegação (`TabBarStyleContext`):
 * "Padrão" — fixa, borda a borda, estilo Instagram/iOS (o original do app);
 * "Padrão 2" — pílula flutuante e compacta, estilo Uber. Em ambos, o `<nav>`
 * reserva sempre o mesmo espaço no rodapé — só a aparência interna muda.
 *
 * **Todo item tem rótulo de texto embaixo do ícone.** Sem eles, a barra
 * eram cinco ícones mudos: "coração = Sobre" e "microfone = Palestrantes"
 * não são deduzíveis, e contradizem o que o público já aprendeu no
 * Instagram (lá, coração = curtidas). O rótulo é o que carrega o
 * significado; o ícone só ajuda a reencontrar depois.
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
  // a foto de perfil fica um pouco maior que os outros ícones — é a usuária, precisa se destacar
  const avatarSize = iconSize + 6;

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
      <span className="tab-label">{tab.label}</span>
    </NavLink>
  ));

  links.push(
    <button key="perfil" type="button" className="tab" aria-label="Perfil" onClick={openAccount}>
      {profile?.avatar_url ? (
        <img className="tab-avatar" src={profile.avatar_url} alt="" style={{ width: avatarSize, height: avatarSize }} />
      ) : (
        <Icon name="user" size={iconSize} />
      )}
      <span className="tab-label">Perfil</span>
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
