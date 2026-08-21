/** Formatações em pt-BR usadas na UI. */

/** "2026-09-19" -> "19 de set. de 2026" */
export function formatEventDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
