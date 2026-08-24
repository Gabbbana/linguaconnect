import type { WebSocket } from 'ws';
import { PRACTICE_LANGUAGE_NAMES } from '../languages.js';

export interface UserProfile {
  id: number;
  name: string;
  nativeLanguage: string;
  city: string | null;
}

export type ConnStatus = 'idle' | 'available' | 'matching' | 'in_call';

export interface ConnState {
  ws: WebSocket;
  profile: UserProfile;
  language: string | null; // practice language currently selected
  status: ConnStatus;
  roomId: string | null;
}

// One active connection per user (last connection wins).
const connections = new Map<number, ConnState>();

const AVATAR_PALETTE = [
  { bg: '#FBE3D6', fg: '#B05A33' },
  { bg: '#DFE9F8', fg: '#3D6396' },
  { bg: '#EBE3F2', fg: '#71519E' },
  { bg: '#DDF0E6', fg: '#2F7D5B' },
  { bg: '#FADEE4', fg: '#B04A64' },
  { bg: '#FCE9BE', fg: '#9C6B1F' },
];

export function avatarFor(userId: number) {
  return AVATAR_PALETTE[userId % AVATAR_PALETTE.length];
}

export function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function upsertConnection(profile: UserProfile, ws: WebSocket): ConnState {
  const existing = connections.get(profile.id);
  if (existing && existing.ws !== ws && existing.ws.readyState === existing.ws.OPEN) {
    existing.ws.close(4001, 'Replaced by a new connection');
  }
  const state: ConnState = { ws, profile, language: null, status: 'idle', roomId: null };
  connections.set(profile.id, state);
  return state;
}

export function removeConnection(userId: number, ws: WebSocket) {
  const existing = connections.get(userId);
  if (existing && existing.ws === ws) {
    connections.delete(userId);
  }
}

export function getConnection(userId: number): ConnState | undefined {
  return connections.get(userId);
}

export function allConnections(): ConnState[] {
  return Array.from(connections.values());
}

export function availablePartnersFor(language: string, excludeUserId: number) {
  return allConnections().filter(
    (c) => c.status === 'available' && c.language === language && c.profile.id !== excludeUserId,
  );
}

export function totalActiveCount(): number {
  return allConnections().filter((c) => c.status !== 'idle').length;
}

export function presenceCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const name of PRACTICE_LANGUAGE_NAMES) counts[name] = 0;
  for (const c of allConnections()) {
    if (c.status === 'available' && c.language && counts[c.language] !== undefined) {
      counts[c.language]! += 1;
    }
  }
  return counts;
}

export function toPartnerJSON(c: ConnState) {
  const av = avatarFor(c.profile.id);
  return {
    id: c.profile.id,
    name: c.profile.name,
    initials: initialsFor(c.profile.name),
    city: c.profile.city,
    nativeLanguage: c.profile.nativeLanguage,
    learning: c.language,
    avBg: av.bg,
    avFg: av.fg,
  };
}
