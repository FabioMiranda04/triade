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

/**
 * "2026-09-11" + "2026-09-12" -> "11 e 12 de set. de 2026"
 *
 * Evento de dois dias com uma data só perde metade da informação — e a
 * Feira de Negócios é exatamente esse caso. Sem `endDate` devolve a data
 * única, então quem chama não precisa saber a diferença.
 */
export function formatEventDateRange(isoDate: string, isoEndDate?: string): string {
  if (!isoEndDate || isoEndDate === isoDate) return formatEventDate(isoDate);
  const inicio = new Date(isoDate + 'T00:00:00');
  const fim = new Date(isoEndDate + 'T00:00:00');
  // Mesmo mês vira "11 e 12 de set. de 2026". Repetir o mês dos dois lados
  // ("11 de set. e 12 de set. de 2026") lê como duas datas soltas em vez de
  // um evento que atravessa dois dias.
  if (inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear()) {
    const semDia = formatEventDate(isoEndDate).replace(/^\d{1,2}\s+de\s+/, '');
    return `${inicio.getDate()} e ${fim.getDate()} de ${semDia}`;
  }
  return `${formatEventDate(isoDate)} a ${formatEventDate(isoEndDate)}`;
}

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
