import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

export interface Partner {
  id: number;
  name: string;
  initials: string;
  city: string | null;
  nativeLanguage: string;
  learning: string | null;
  avBg: string;
  avFg: string;
}

export interface Matched {
  roomId: string;
  initiator: boolean;
  peer: Partner;
}

type SignalHandler = (from: number, data: unknown) => void;

interface RealtimeContextValue {
  connected: boolean;
  partners: Partner[];
  watchLanguage: (language: string) => void;
  unwatch: () => void;
  callUser: (targetUserId: number) => void;
  callRandom: () => void;
  matched: Matched | null;
  clearMatched: () => void;
  callFailed: string | null;
  clearCallFailed: () => void;
  callEnded: string | null;
  clearCallEnded: () => void;
  sendSignal: (roomId: string, data: unknown) => void;
  endCall: (roomId: string) => void;
  subscribeSignal: (handler: SignalHandler) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const WS_URL = import.meta.env.VITE_WS_URL as string;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const signalHandlers = useRef(new Set<SignalHandler>());
  const [connected, setConnected] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [matched, setMatched] = useState<Matched | null>(null);
  const [callFailed, setCallFailed] = useState<string | null>(null);
  const [callEnded, setCallEnded] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'partners_update':
          setPartners(msg.users);
          break;
        case 'matched':
          setMatched({ roomId: msg.roomId, initiator: msg.initiator, peer: msg.peer });
          break;
        case 'call_failed':
          setCallFailed(msg.reason);
          break;
        case 'call_ended':
          setCallEnded(msg.reason);
          setMatched(null);
          break;
        case 'signal':
          signalHandlers.current.forEach((h) => h(msg.from, msg.data));
          break;
        default:
          break;
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token]);

  function send(message: unknown) {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  }

  const value: RealtimeContextValue = {
    connected,
    partners,
    watchLanguage: (language) => send({ type: 'watch_language', language }),
    unwatch: () => {
      send({ type: 'unwatch' });
      setPartners([]);
    },
    callUser: (targetUserId) => send({ type: 'call_user', targetUserId }),
    callRandom: () => send({ type: 'call_random' }),
    matched,
    clearMatched: () => setMatched(null),
    callFailed,
    clearCallFailed: () => setCallFailed(null),
    callEnded,
    clearCallEnded: () => setCallEnded(null),
    sendSignal: (roomId, data) => send({ type: 'signal', roomId, data }),
    endCall: (roomId) => {
      send({ type: 'end_call', roomId });
      setMatched(null);
    },
    subscribeSignal: (handler) => {
      signalHandlers.current.add(handler);
      return () => signalHandlers.current.delete(handler);
    },
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
}
