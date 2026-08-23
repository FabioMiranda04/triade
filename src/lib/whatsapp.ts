import { formatEventDate } from '@/lib/format';
import type { TriadeEvent } from '@/types';

/** "+55 62 8165-1103" -> "https://wa.me/556281651103?text=..." */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Mensagem pronta para pedir ingresso de um evento a uma das sócias. */
export function buildTicketMessage(event: TriadeEvent, founderFirstName: string): string {
  return `Olá, ${founderFirstName}! Vim pelo app da Tríade Conecta e quero comprar meu ingresso para a ${event.title}, no dia ${formatEventDate(event.date)}. Pode me ajudar?`;
}
