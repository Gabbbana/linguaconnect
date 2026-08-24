import { useEffect, useState } from 'react';
import { fetchLanguages } from '../api/client';
import { colors } from '../styles/theme';

export interface LanguageOption {
  code: string;
  name: string;
  bg: string;
  fg: string;
  online: number;
}

export function LanguageSelectScreen({
  onContinue,
}: {
  onContinue: (language: string) => void;
}) {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetchLanguages()
      .then((r) => setLanguages(r.languages))
      .catch(() => setLanguages([]));
  }, []);

  const hasLang = !!selected;

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
      <div style={{ padding: '0 24px 18px' }}>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.4, lineHeight: 1.2 }}>
          What do you want to practice?
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.textMuted, marginTop: 8, lineHeight: 1.45 }}>
          Pick a language and we'll call someone who speaks it.
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 24px 16px', minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {languages.map((l) => {
            const isSelected = l.name === selected;
            return (
              <div
                key={l.code}
                onClick={() => setSelected(l.name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: '16px 14px',
                  borderRadius: 18,
                  background: isSelected ? colors.accentTint : '#FFFFFF',
                  border: `2px solid ${isSelected ? colors.accent : colors.cardBorder}`,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: l.bg,
                    color: l.fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13.5,
                    fontWeight: 900,
                    letterSpacing: 0.5,
                  }}
                >
                  {l.code}
                </div>
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 800 }}>{l.name}</div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 700,
                      color: colors.textMuted,
                      marginTop: 2,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: colors.online,
                        display: 'inline-block',
                      }}
                    />
                    {l.online} online
                  </div>
                </div>
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: colors.accent,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '12px 24px 46px', background: colors.screenBg }}>
        <button
          onClick={() => hasLang && onContinue(selected!)}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 16,
            border: 'none',
            background: hasLang ? colors.accent : colors.disabledBg,
            color: hasLang ? '#FFFFFF' : colors.disabledText,
            fontSize: 16.5,
            fontWeight: 800,
            cursor: hasLang ? 'pointer' : 'default',
          }}
        >
          {hasLang ? 'Find partners' : 'Pick a language to continue'}
        </button>
      </div>
    </div>
  );
}
