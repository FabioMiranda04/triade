import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getPref, setPref } from '@/lib/db/prefs';

export type ThemeName = 'perola' | 'onyx';

/**
 * Temas disponíveis em Configurações → Aparência.
 *
 * Cada valor aqui precisa ter um bloco correspondente em
 * `src/styles/tokens.css` (`[data-theme='<value>']`), exceto `onyx`, que é
 * o `:root` — o tema PADRÃO mora lá para pintar certo sem JavaScript.
 * A cor da barra de status não fica aqui de propósito: é lida do próprio
 * token `--sand` do tema, senão o mesmo valor viveria em dois lugares e um
 * dia sairia de sincronia.
 */
export const THEMES: { value: ThemeName; label: string; hint: string }[] = [
  {
    value: 'onyx',
    label: 'Ônix',
    hint: 'Preto e branco com detalhes dourados.',
  },
  {
    value: 'perola',
    label: 'Pérola',
    hint: 'O visual claro original, com vinho e dourado.',
  },
];

const DEFAULT_THEME: ThemeName = 'onyx';

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
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const salvo = getPref<string>(PREF_KEY, DEFAULT_THEME);
    // O tema claro já se chamou 'areia' (até 25/08/2026). Quem tinha esse
    // valor salvo ESCOLHEU o claro, então precisa continuar no claro — e
    // não cair no padrão, que desde 26/08/2026 é o escuro. Trocar a
    // escolha de alguém por causa de uma renomeação interna seria um bug.
    const migrado = salvo === 'areia' ? 'perola' : salvo;
    // Qualquer outro valor desconhecido cai no padrão, em vez de aplicar um
    // `data-theme` que não existe em `tokens.css`.
    return THEMES.some((t) => t.value === migrado) ? (migrado as ThemeName) : DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    // a cor da barra de status é o próprio fundo do tema, lido do CSS já
    // aplicado — nunca um hex repetido aqui
    const fundo = getComputedStyle(document.documentElement).getPropertyValue('--sand').trim();
    if (fundo) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', fundo);
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
