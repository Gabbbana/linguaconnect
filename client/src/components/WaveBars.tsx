export function WaveBars() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 30, marginTop: 4 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 26,
            borderRadius: 3,
            background: '#2E9C8A',
            display: 'inline-block',
            transformOrigin: 'center',
            animation: 'lc-wave 1s ease-in-out infinite',
            animationDelay: `${i * 0.13}s`,
          }}
        />
      ))}
    </div>
  );
}
