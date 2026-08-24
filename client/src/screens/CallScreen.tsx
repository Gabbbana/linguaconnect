import { useEffect, useRef, useState } from 'react';
import type { Matched } from '../context/RealtimeContext';
import { useRealtime } from '../context/RealtimeContext';
import { useWebRTCCall } from '../hooks/useWebRTCCall';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { WaveBars } from '../components/WaveBars';
import { PulseRings } from '../components/PulseRings';
import { colors } from '../styles/theme';

function formatTime(secs: number) {
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function CallScreen({ matched, onEnded }: { matched: Matched; onEnded: () => void }) {
  const { endCall } = useRealtime();
  const { remoteAudioRef, muted, toggleMute, connectionState, mediaError } = useWebRTCCall(matched);
  const [speaker, setSpeaker] = useState(false);
  const [callSecs, setCallSecs] = useState(0);
  const connectedOnceRef = useRef(false);

  const isConnected = connectionState === 'connected';

  useEffect(() => {
    if (!isConnected) return;
    connectedOnceRef.current = true;
    const interval = setInterval(() => setCallSecs((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (connectionState === 'failed' || connectionState === 'disconnected') {
      const t = setTimeout(() => {
        endCall(matched.roomId);
        onEnded();
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [connectionState]);

  function handleEndCall() {
    endCall(matched.roomId);
    onEnded();
  }

  const { peer } = matched;
  const showOverlay = !isConnected && !connectedOnceRef.current;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '56px 26px 50px',
        boxSizing: 'border-box',
        minHeight: 0,
        position: 'relative',
      }}
    >
      <audio ref={remoteAudioRef} autoPlay />

      <div style={{ fontSize: 12, fontWeight: 800, color: colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {peer.learning} practice call
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
        {formatTime(callSecs)}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Avatar
          initials={peer.initials}
          bg={peer.avBg}
          fg={peer.avFg}
          size={118}
          fontSize={38}
          ring={`0 0 0 5px ${colors.screenBg}, 0 0 0 8px ${colors.online}`}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{peer.name}</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.textMuted, marginTop: 3 }}>
            {peer.city ?? 'Location not shared'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Badge label={`Native ${peer.nativeLanguage}`} bg={colors.nativeBadgeBg} color={colors.nativeBadgeText} size="lg" />
          <Badge label={`Learning ${peer.learning}`} bg={colors.learningBadgeBg} color={colors.learningBadgeText} size="lg" />
        </div>
        {isConnected && <WaveBars />}
      </div>

      <div style={{ flex: 1 }} />

      {mediaError ? (
        <div style={{ background: '#FDEFE9', borderRadius: 14, padding: '11px 16px', fontSize: 12.5, fontWeight: 700, color: colors.dangerHover, textAlign: 'center', lineHeight: 1.5, maxWidth: 300 }}>
          Couldn't access your microphone: {mediaError}
        </div>
      ) : (
        <div style={{ background: colors.cardTint, borderRadius: 14, padding: '11px 16px', fontSize: 12.5, fontWeight: 700, color: colors.textMuted2, textAlign: 'center', lineHeight: 1.5, maxWidth: 300 }}>
          Ice-breaker: describe your favorite meal — in {peer.learning}.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 20 }}>
        <button
          onClick={toggleMute}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 16,
            border: `1.5px solid ${muted ? colors.text : colors.toggleBorder}`,
            background: muted ? colors.text : '#FFFFFF',
            color: muted ? '#FFFFFF' : colors.text,
            fontSize: 14.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={() => setSpeaker((s) => !s)}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 16,
            border: `1.5px solid ${speaker ? colors.text : colors.toggleBorder}`,
            background: speaker ? colors.text : '#FFFFFF',
            color: speaker ? '#FFFFFF' : colors.text,
            fontSize: 14.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {speaker ? 'Speaker on' : 'Speaker'}
        </button>
      </div>
      <button
        onClick={handleEndCall}
        style={{
          width: '100%',
          height: 54,
          borderRadius: 16,
          border: 'none',
          background: colors.danger,
          color: '#fff',
          fontSize: 16,
          fontWeight: 800,
          cursor: 'pointer',
          marginTop: 10,
          boxShadow: '0 6px 16px rgba(214,69,69,0.28)',
        }}
      >
        End call
      </button>

      {showOverlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            background: 'rgba(251,247,240,0.97)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 26,
          }}
        >
          <PulseRings initials={peer.initials} bg={peer.avBg} fg={peer.avFg} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 19, fontWeight: 900 }}>Calling {peer.name.split(' ')[0]}…</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.textMuted, marginTop: 6 }}>
              {peer.city ?? 'Location not shared'} · Native {peer.nativeLanguage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
