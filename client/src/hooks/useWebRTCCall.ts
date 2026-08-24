import { useEffect, useRef, useState } from 'react';
import { useRealtime, type Matched } from '../context/RealtimeContext';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

type SignalData =
  | { kind: 'offer'; sdp: RTCSessionDescriptionInit }
  | { kind: 'answer'; sdp: RTCSessionDescriptionInit }
  | { kind: 'ice'; candidate: RTCIceCandidateInit };

// Bridges the matched call's WS signaling to a real WebRTC peer connection
// carrying live microphone audio between the two matched users.
export function useWebRTCCall(matched: Matched | null) {
  const { sendSignal, subscribeSignal } = useRealtime();
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSet = useRef(false);

  useEffect(() => {
    if (!matched) return;
    let cancelled = false;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(matched.roomId, { kind: 'ice', candidate: event.candidate.toJSON() });
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0] ?? null;
      }
    };

    const unsubscribe = subscribeSignal(async (_from, raw) => {
      const data = raw as SignalData;
      if (!pcRef.current) return;
      try {
        if (data.kind === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          remoteDescSet.current = true;
          await flushPending(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(matched.roomId, { kind: 'answer', sdp: answer });
        } else if (data.kind === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          remoteDescSet.current = true;
          await flushPending(pc);
        } else if (data.kind === 'ice') {
          if (remoteDescSet.current) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            pendingCandidates.current.push(data.candidate);
          }
        }
      } catch (err) {
        console.error('Signal handling failed', err);
      }
    });

    async function flushPending(pc: RTCPeerConnection) {
      for (const candidate of pendingCandidates.current) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidates.current = [];
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        if (matched.initiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal(matched.roomId, { kind: 'offer', sdp: offer });
        }
      } catch (err) {
        setMediaError(err instanceof Error ? err.message : 'Could not access microphone');
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      pc.close();
      pcRef.current = null;
      remoteDescSet.current = false;
      pendingCandidates.current = [];
      setConnectionState('new');
    };
  }, [matched?.roomId]);

  function toggleMute() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !muted;
    stream.getAudioTracks().forEach((track) => (track.enabled = !next));
    setMuted(next);
  }

  return { remoteAudioRef, muted, toggleMute, connectionState, mediaError };
}
