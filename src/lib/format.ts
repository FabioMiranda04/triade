/** Formatações em pt-BR usadas na UI. */

/** "2026-09-19" -> "19 de set. de 2026" */
export function formatEventDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const SHORT_MONTHS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/** "2025-08-23" -> "23 ago" (rótulo compacto da célula na grade de edições) */
export function formatEventShortDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

/** 970 -> "R$ 970" · 0 -> "Grátis" */
export function formatPrice(value: number): string {
  return value === 0 ? 'Grátis' : 'R$ ' + value.toLocaleString('pt-BR');
}

/** "em breve" -> "embreve" (classe CSS do status-pill) */
export function statusClass(status: string): string {
  return status === 'em breve' ? 'embreve' : 'realizado';
}

/** "Marcela Zaidem" -> "Marcela" */
export function firstName(fullName: string): string {
  return fullName.split(' ')[0];
}

/**
 * Comparador de nomes em português, para `Array.sort`.
 *
 * `localeCompare` com 'pt-BR' é o que faz "Lia Chaves" vir antes de
 * "Lívia Duarte": a comparação binária de strings colocaria o "í" (U+00ED)
 * depois de qualquer letra sem acento, e a ordem sairia errada para
 * qualquer nome acentuado — que em português é a regra, não a exceção.
 */
export function byName<T extends { name: string }>(a: T, b: T): number {
  return a.name.localeCompare(b.name, 'pt-BR');
}
