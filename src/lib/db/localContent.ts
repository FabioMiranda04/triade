import { getPref, setPref } from './prefs';
import type { Post, Speaker, TriadeEvent } from '@/types';

/**
 * Edição de conteúdo feita pela própria usuária no aparelho, por cima do que
 * vem do provider (local ou Supabase). Fica só no navegador — combina com a
 * regra do projeto de nunca gravar no Supabase sem autenticação (Módulo 2).
 * Cada tela aplica `applyXEdits` sobre o resultado de `db.getXxx()`.
 */

// ---------- eventos ----------
export function applyEventEdits(events: TriadeEvent[]): TriadeEvent[] {
  const overrides = getPref<Record<string, Partial<TriadeEvent>>>('event_overrides', {});
  const created = getPref<TriadeEvent[]>('event_extra', []);
  return [...events.map((e) => ({ ...e, ...overrides[e.id] })), ...created];
}

export function saveEventEdit(id: string, patch: Partial<TriadeEvent>): void {
  const overrides = getPref<Record<string, Partial<TriadeEvent>>>('event_overrides', {});
  overrides[id] = { ...overrides[id], ...patch };
  setPref('event_overrides', overrides);
}

export function createEvent(event: TriadeEvent): void {
  const created = getPref<TriadeEvent[]>('event_extra', []);
  setPref('event_extra', [...created, event]);
}

// ---------- palestrantes ----------
export function applySpeakerEdits(speakers: Speaker[]): Speaker[] {
  const overrides = getPref<Record<string, Partial<Speaker>>>('speaker_overrides', {});
  const created = getPref<Speaker[]>('speaker_extra', []);
  return [...speakers.map((s) => ({ ...s, ...overrides[s.id] })), ...created];
}

export function saveSpeakerEdit(id: string, patch: Partial<Speaker>): void {
  const overrides = getPref<Record<string, Partial<Speaker>>>('speaker_overrides', {});
  overrides[id] = { ...overrides[id], ...patch };
  setPref('speaker_overrides', overrides);
}

export function createSpeaker(speaker: Speaker): void {
  const created = getPref<Speaker[]>('speaker_extra', []);
  setPref('speaker_extra', [...created, speaker]);
}

// ---------- post em destaque (Início) ----------
export function applyPostEdits(posts: Post[]): Post[] {
  const overrides = getPref<Record<string, Partial<Post>>>('post_overrides', {});
  return posts.map((p) => ({ ...p, ...overrides[p.id] }));
}

export function savePostEdit(id: string, patch: Partial<Post>): void {
  const overrides = getPref<Record<string, Partial<Post>>>('post_overrides', {});
  overrides[id] = { ...overrides[id], ...patch };
  setPref('post_overrides', overrides);
}
