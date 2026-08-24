import { useEffect } from 'react';
import { useRealtime } from '../context/RealtimeContext';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { colors, avatarFor, initialsFor } from '../styles/theme';

export function OnlinePartnersScreen({
  language,
  onBack,
}: {
  language: string;
  onBack: () => void;
}) {
  const { partners, watchLanguage, unwatch, callUser, callRandom, callFailed, clearCallFailed } =
    useRealtime();

  useEffect(() => {
    watchLanguage(language);
    return () => unwatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 0 0',
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 4px' }}>
        <button
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1.5px solid ${colors.inputBorder}`,
            background: '#fff',
            color: colors.textMuted2,
            fontSize: 19,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 0 2px',
          }}
        >
          ‹
        </button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.3 }}>Online now</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              color: colors.textMuted,
            }}
          >
            <span
              style={{ width: 7, height: 7, borderRadius: '50%', background: colors.online, display: 'inline-block' }}
            />
            {language} · {partners.length} people available
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 6px' }}>
        <button
          onClick={callRandom}
          disabled={partners.length === 0}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 16,
            border: 'none',
            background: colors.secondary,
            color: '#fff',
            fontSize: 15.5,
            fontWeight: 800,
            cursor: partners.length === 0 ? 'default' : 'pointer',
            boxShadow: '0 6px 16px rgba(46,156,138,0.25)',
            opacity: partners.length === 0 ? 0.6 : 1,
          }}
        >
          Call someone now
        </button>
      </div>

      {callFailed && (
        <div style={{ padding: '0 20px 6px' }}>
          <div
            style={{
              background: '#FDEFE9',
              color: colors.accentHover,
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>
              {callFailed === 'unavailable'
                ? "That person just went into another call — try someone else."
                : callFailed === 'none_available'
                  ? 'No one is free to talk right now. Check back soon.'
                  : 'Could not start the call. Please try again.'}
            </span>
            <button
              onClick={clearCallFailed}
              style={{ border: 'none', background: 'none', color: colors.accentHover, fontWeight: 900, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 46px', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {partners.length === 0 && (
          <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: 13.5, fontWeight: 600, marginTop: 24 }}>
            No one else is online for {language} right now.
          </div>
        )}
        {partners.map((u) => {
          const av = avatarFor(u.id);
          return (
            <div
              key={u.id}
              onClick={() => callUser(u.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: 14,
                borderRadius: 18,
                background: '#fff',
                border: `1.5px solid ${colors.cardBorderSoft}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar initials={u.initials || initialsFor(u.name)} bg={av.bg} fg={av.fg} size={50} fontSize={17} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    background: colors.online,
                    border: '2.5px solid #fff',
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800 }}>{u.name}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, marginTop: 1 }}>
                  {u.city ?? 'Location not shared'}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                  <Badge label={`Native ${u.nativeLanguage}`} bg={colors.nativeBadgeBg} color={colors.nativeBadgeText} />
                  <Badge label={`Learning ${u.learning}`} bg={colors.learningBadgeBg} color={colors.learningBadgeText} />
                </div>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  height: 36,
                  borderRadius: 999,
                  background: colors.accentTint,
                  color: colors.accent,
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 15px',
                }}
              >
                Call
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
