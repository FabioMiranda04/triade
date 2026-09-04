/**
 * Preferências da usuária no navegador (curtidas, salvos, presenças, plano).
 *
 * Continua local mesmo com o Supabase ligado: sem autenticação (Módulo 2)
 * não há usuária a quem atribuir esses dados no servidor. As tabelas já
 * estão previstas em `supabase/schema.sql`.
 *
 * Namespace `triade_` — o mesmo do protótipo original, então quem testou o
 * HTML antigo mantém o que marcou.
 */

const NS = 'triade_';

function isBrowser(): boolean {
  // `typeof` NÃO protege aqui: quando o navegador bloqueia o storage (aba
  // anônima restrita, cookies de terceiros bloqueados dentro de iframe), o
  // próprio acesso a `window.localStorage` lança — e a exceção acontece
  // antes do `typeof` avaliar. Sem o try/catch, o app inteiro morre na
  // primeira leitura de preferência.
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getPref<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(NS + 'pref_' + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function setPref(key: string, value: unknown): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(NS + 'pref_' + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Marca de "já aconteceu nesta abertura do app".
 *
 * Vive em `sessionStorage`, e a escolha do storage **é** a regra: ele morre
 * quando a aba/janela do app fecha, e sobrevive a recarregar a página e a
 * navegar entre telas. É exatamente a fronteira de "abertura do app" que a
 * SPEC-001 precisa — `localStorage` sobreviveria demais (foi o que fez o
 * convite aparecer uma vez só, para sempre) e uma variável em memória
 * sobreviveria de menos (voltaria a cada F5).
 *
 * Mesmo cuidado do `isBrowser()` acima: o acesso em si pode lançar quando o
 * navegador bloqueia storage. Bloqueado, devolve `false` — o efeito é o
 * convite aparecer, que é o lado seguro de errar.
 */
export function getFlagSessao(key: string): boolean {
  try {
    return window.sessionStorage.getItem(NS + key) === '1';
  } catch {
    return false;
  }
}

export function setFlagSessao(key: string): void {
  try {
    window.sessionStorage.setItem(NS + key, '1');
  } catch {
    // storage bloqueado: o pior caso é o convite reaparecer ao recarregar
  }
}

export function readCache<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(NS + key);
    if (raw === null) {
      window.localStorage.setItem(NS + key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toggleInList(key: string, id: string): boolean {
  const list = getPref<string[]>(key, []);
  const i = list.indexOf(id);
  if (i > -1) list.splice(i, 1);
  else list.push(id);
  setPref(key, list);
  return list.includes(id);
}

/** Limpa tudo do app no navegador — só para desenvolvimento. */
export function resetLocal(): void {
  if (!isBrowser()) return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(NS))
    .forEach((k) => window.localStorage.removeItem(k));
}

/** Mixin com as operações de engajamento, compartilhado pelos dois providers. */
export const engagement = {
  isLiked: (postId: string) => getPref<string[]>('likes', []).includes(postId),
  toggleLike: (postId: string) => toggleInList('likes', postId),
  isSaved: (postId: string) => getPref<string[]>('saves', []).includes(postId),
  toggleSave: (postId: string) => toggleInList('saves', postId),
  hasRsvp: (eventId: string) => getPref<string[]>('rsvps', []).includes(eventId),
  rsvpEvent: (eventId: string) => {
    const list = getPref<string[]>('rsvps', []);
    if (!list.includes(eventId)) list.push(eventId);
    setPref('rsvps', list);
    return list;
  },
  cancelRsvp: (eventId: string) => {
    const list = getPref<string[]>('rsvps', []).filter((id) => id !== eventId);
    setPref('rsvps', list);
    return list;
  },
  getChosenPlan: () => getPref<string | null>('selected_plan', null),
  choosePlan: (planId: string) => setPref('selected_plan', planId),
};
