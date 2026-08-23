import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { getPref, setPref } from '@/lib/db/prefs';

export type TabBarStyle = 'padrao' | 'padrao2';

interface TabBarStyleContextValue {
  style: TabBarStyle;
  setStyle: (style: TabBarStyle) => void;
}

const TabBarStyleContext = createContext<TabBarStyleContextValue | null>(null);

/** Preferência de estilo da tab bar (Configurações → Navegação), salva no aparelho. */
export function TabBarStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<TabBarStyle>(() =>
    getPref<TabBarStyle>('tabbar_style', 'padrao'),
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
