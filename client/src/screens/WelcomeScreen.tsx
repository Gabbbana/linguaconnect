import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';
import { fetchPresenceSummary } from '../api/client';

const NATIVE_LANGUAGES = [
  'English',
  'Spanish',
  'Portuguese',
  'French',
  'German',
  'Italian',
  'Japanese',
  'Mandarin',
  'Korean',
  'Arabic',
  'Hindi',
  'Russian',
  'Other',
];

const inputStyle: React.CSSProperties = {
  height: 52,
  borderRadius: 16,
  border: `1.5px solid ${colors.inputBorder}`,
  background: '#fff',
  padding: '0 18px',
  fontSize: 15,
  fontWeight: 600,
  color: colors.text,
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
};

export function WelcomeScreen() {
  const { logIn, signUp, loading, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [city, setCity] = useState('');
  const [activeNow, setActiveNow] = useState<number | null>(null);

  useEffect(() => {
    fetchPresenceSummary()
      .then((r) => setActiveNow(r.activeNow))
      .catch(() => setActiveNow(null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'login') {
      await logIn(email, password).catch(() => {});
    } else {
      await signUp({ email, password, name, nativeLanguage, city: city || undefined }).catch(() => {});
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '56px 28px 48px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: colors.accent }} />
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: colors.secondary,
              marginLeft: -16,
              mixBlendMode: 'multiply',
              opacity: 0.92,
            }}
          />
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.5 }}>LinguaConnect</div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 600,
            color: colors.textMuted,
            textAlign: 'center',
            lineHeight: 1.45,
            maxWidth: 270,
          }}
        >
          Practice a language with real people, live — one call at a time.
        </div>
        {activeNow !== null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: colors.cardTint,
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              color: colors.textMuted2,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colors.online,
                display: 'inline-block',
              }}
            />
            {activeNow} {activeNow === 1 ? 'person' : 'people'} online right now
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 24 }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'signup' && (
          <>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              style={{ ...inputStyle, appearance: 'none' as const }}
            >
              {NATIVE_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  Native language: {l}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City (optional)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={inputStyle}
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
          minLength={mode === 'signup' ? 8 : undefined}
        />
        {error && (
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.danger, textAlign: 'center' }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 54,
            borderRadius: 16,
            border: 'none',
            background: colors.accent,
            color: '#fff',
            fontSize: 16.5,
            fontWeight: 800,
            cursor: loading ? 'default' : 'pointer',
            boxShadow: '0 6px 16px rgba(224,103,74,0.28)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
        <button
          type="button"
          onClick={() => {
            clearError();
            setMode(mode === 'login' ? 'signup' : 'login');
          }}
          style={{
            height: 44,
            borderRadius: 16,
            border: 'none',
            background: 'transparent',
            color: colors.textMuted,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {mode === 'login' ? (
            <>
              New here? <span style={{ color: colors.accent }}>Create an account</span>
            </>
          ) : (
            <>
              Already have an account? <span style={{ color: colors.accent }}>Log in</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
