import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { getPref, setPref } from '@/lib/db/prefs';

export type TabBarStyle = 'padrao' | 'padrao2';

/**
 * Estilos oferecidos em Configurações → Navegação.
 *
 * Os VALORES continuam 'padrao'/'padrao2' porque é o que está salvo nos
 * aparelhos — renomear quebraria a escolha de quem já fez uma. O que mudou
 * em 26/08/2026 foi o RÓTULO: "Padrão" e "Padrão 2" são nome de
 * desenvolvedor, não dizem nada para quem usa, e obrigavam a testar os dois
 * para descobrir a diferença. O flutuante vem primeiro por ser o padrão.
 */
export const TABBAR_STYLES: { value: TabBarStyle; label: string; hint: string }[] = [
  {
    value: 'padrao2',
    label: 'Barra flutuante',
    hint: 'Pílula compacta, sobre o conteúdo.',
  },
  {
    value: 'padrao',
    label: 'Barra fixa',
    hint: 'Ocupa a largura toda da tela.',
  },
];

interface TabBarStyleContextValue {
  style: TabBarStyle;
  setStyle: (style: TabBarStyle) => void;
}

const TabBarStyleContext = createContext<TabBarStyleContextValue | null>(null);

/**
 * Preferência de estilo da tab bar (Configuracoes -> Navegacao), salva no
 * aparelho. O padrão passou a ser a pílula flutuante ("Padrão 2") em
 * 26/08/2026; quem já tinha escolhido mantém a escolha.
 */
export function TabBarStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<TabBarStyle>(() =>
    getPref<TabBarStyle>('tabbar_style', 'padrao2'),
  );

  const setStyle = useCallback((next: TabBarStyle) => {
    setPref('tabbar_style', next);
    setStyleState(next);
  }, []);

  return <TabBarStyleContext.Provider value={{ style, setStyle }}>{children}</TabBarStyleContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTabBarStyle(): TabBarStyleContextValue {
  const ctx = useContext(TabBarStyleContext);
  if (!ctx) throw new Error('useTabBarStyle precisa estar dentro de <TabBarStyleProvider>');
  return ctx;
}
