import type { IncomingMessage } from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import { verifyToken } from '../middleware/auth.js';
import { pool } from '../db/pool.js';
import {
  availablePartnersFor,
  getConnection,
  removeConnection,
  toPartnerJSON,
  upsertConnection,
  type ConnState,
  type UserProfile,
} from './presence.js';
import { isPracticeLanguage } from '../languages.js';
import { createRoom, deleteRoom, getRoom, otherUser } from './rooms.js';

function send(ws: WebSocket, message: unknown) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message));
}

function broadcastPartnersUpdate(language: string) {
  const available = availablePartnersFor(language, -1); // -1 never matches, get everyone
  for (const watcher of available) {
    const others = available.filter((c) => c.profile.id !== watcher.profile.id);
    send(watcher.ws, {
      type: 'partners_update',
      language,
      users: others.map(toPartnerJSON),
    });
  }
}

function setAvailable(state: ConnState, language: string) {
  state.language = language;
  state.status = 'available';
}

function clearToIdleOrAvailable(state: ConnState) {
  state.roomId = null;
  state.status = state.language ? 'available' : 'idle';
}

function pair(caller: ConnState, target: ConnState) {
  const previousLanguage = caller.language;
  const room = createRoom(caller.profile.id, target.profile.id);
  caller.status = 'in_call';
  caller.roomId = room.id;
  target.status = 'in_call';
  target.roomId = room.id;

  send(caller.ws, { type: 'matched', roomId: room.id, initiator: true, peer: toPartnerJSON(target) });
  send(target.ws, { type: 'matched', roomId: room.id, initiator: false, peer: toPartnerJSON(caller) });

  if (previousLanguage) broadcastPartnersUpdate(previousLanguage);
}

function endCall(state: ConnState, reason: string) {
  if (!state.roomId) return;
  const room = getRoom(state.roomId);
  if (room) {
    const otherId = otherUser(room, state.profile.id);
    const other = getConnection(otherId);
    if (other && other.roomId === room.id) {
      send(other.ws, { type: 'call_ended', roomId: room.id, reason });
      clearToIdleOrAvailable(other);
      if (other.language) broadcastPartnersUpdate(other.language);
    }
    deleteRoom(room.id);
  }
  clearToIdleOrAvailable(state);
}

async function loadProfile(userId: number): Promise<UserProfile | null> {
  const result = await pool.query(
    'SELECT id, name, native_language, city FROM users WHERE id = $1',
    [userId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: row.id, name: row.name, nativeLanguage: row.native_language, city: row.city };
}

export function attachWebSocketServer(wss: WebSocketServer) {
  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? '', 'http://localhost');
    const token = url.searchParams.get('token');
    if (!token) {
      ws.close(4000, 'Missing token');
      return;
    }
    let userId: number;
    try {
      userId = verifyToken(token).userId;
    } catch {
      ws.close(4000, 'Invalid token');
      return;
    }

    const profile = await loadProfile(userId);
    if (!profile) {
      ws.close(4000, 'User not found');
      return;
    }

    const state = upsertConnection(profile, ws);
    send(ws, { type: 'connected', self: profile });

    ws.on('message', (raw: Buffer) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      handleMessage(state, msg);
    });

    ws.on('close', () => {
      if (state.roomId) endCall(state, 'peer_disconnected');
      const lang = state.language;
      removeConnection(userId, ws);
      if (lang) broadcastPartnersUpdate(lang);
    });
  });
}

function handleMessage(state: ConnState, msg: any) {
  switch (msg?.type) {
    case 'watch_language': {
      const language = msg.language;
      if (typeof language !== 'string' || !isPracticeLanguage(language)) {
        send(state.ws, { type: 'error', message: 'Unknown language' });
        return;
      }
      if (state.status === 'in_call' || state.status === 'matching') return;
      const previous = state.language;
      setAvailable(state, language);
      if (previous && previous !== language) broadcastPartnersUpdate(previous);
      broadcastPartnersUpdate(language);
      break;
    }
    case 'unwatch': {
      const previous = state.language;
      state.language = null;
      state.status = 'idle';
      if (previous) broadcastPartnersUpdate(previous);
      break;
    }
    case 'call_user': {
      if (state.status !== 'available' || !state.language) {
        send(state.ws, { type: 'call_failed', reason: 'not_ready' });
        return;
      }
      const target = getConnection(Number(msg.targetUserId));
      if (!target || target.status !== 'available' || target.language !== state.language) {
        send(state.ws, { type: 'call_failed', reason: 'unavailable' });
        return;
      }
      pair(state, target);
      break;
    }
    case 'call_random': {
      if (state.status !== 'available' || !state.language) {
        send(state.ws, { type: 'call_failed', reason: 'not_ready' });
        return;
      }
      const candidates = availablePartnersFor(state.language, state.profile.id);
      if (candidates.length === 0) {
        send(state.ws, { type: 'call_failed', reason: 'none_available' });
        return;
      }
      const target = candidates[Math.floor(Math.random() * candidates.length)]!;
      pair(state, target);
      break;
    }
    case 'signal': {
      if (!state.roomId || state.roomId !== msg.roomId) return;
      const room = getRoom(state.roomId);
      if (!room) return;
      const other = getConnection(otherUser(room, state.profile.id));
      if (!other) return;
      send(other.ws, { type: 'signal', roomId: room.id, from: state.profile.id, data: msg.data });
      break;
    }
    case 'end_call': {
      if (state.roomId && state.roomId === msg.roomId) {
        endCall(state, 'ended');
        if (state.language) broadcastPartnersUpdate(state.language);
      }
      break;
    }
    default:
      break;
  }
}
