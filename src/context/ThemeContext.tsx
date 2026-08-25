import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getPref, setPref } from '@/lib/db/prefs';

export type ThemeName = 'areia' | 'onyx';

/**
 * Temas disponíveis em Configurações → Aparência.
 *
 * `statusBar` alimenta a `<meta name="theme-color">` — é a cor que o
 * Android/Chrome pinta atrás da barra de status quando o app está aberto
 * (e a que o iOS usa no atalho da tela de início). Sem atualizar isso, o
 * tema Ônix ficaria com uma faixa clara colada no topo da tela.
 *
 * Cada valor aqui precisa ter um bloco correspondente em
 * `src/styles/tokens.css` (`[data-theme='<value>']`), exceto `areia`, que
 * é o `:root` padrão.
 */
export const THEMES: {
  value: ThemeName;
  label: string;
  hint: string;
  statusBar: string;
}[] = [
  {
    value: 'areia',
    label: 'Areia',
    hint: 'O visual original: fundo claro, vinho e dourado.',
    statusBar: '#F4EEE3',
  },
  {
    value: 'onyx',
    label: 'Ônix',
    hint: 'Preto e branco com detalhes dourados.',
    statusBar: '#0B0A0A',
  },
];

const DEFAULT_THEME: ThemeName = 'areia';

/** Chave usada em `prefs.ts` — repetida no index.html, ver comentário lá. */
const PREF_KEY = 'theme';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Tema visual do app (Configurações → Aparência), salvo no aparelho.
 *
 * O tema não é uma classe num componente: é um `data-theme` no `<html>`,
 * e cada tema redefine os tokens de cor em `tokens.css`. Nenhum
 * componente precisa saber qual tema está ativo — é o que permite
 * adicionar um tema novo sem tocar em nenhum `.tsx`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() =>
    getPref<ThemeName>(PREF_KEY, DEFAULT_THEME),
  );

  useEffect(() => {
    const entry = THEMES.find((t) => t.value === theme) ?? THEMES[0];
    document.documentElement.dataset.theme = entry.value;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', entry.statusBar);
  }, [theme]);

  const setTheme = useCallback((next: ThemeName) => {
    setPref(PREF_KEY, next);
    setThemeState(next);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}
