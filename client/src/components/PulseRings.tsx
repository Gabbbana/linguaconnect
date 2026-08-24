import { Avatar } from './Avatar';

export function PulseRings({ initials, bg, fg }: { initials: string; bg: string; fg: string }) {
  const ring = (delay: number) => (
    <div
      key={delay}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '2.5px solid #E0674A',
        animation: 'lc-pulse 1.7s ease-out infinite',
        animationDelay: `${delay}s`,
      }}
    />
  );
  return (
    <div style={{ position: 'relative', width: 96, height: 96 }}>
      {ring(0)}
      {ring(0.85)}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Avatar initials={initials} bg={bg} fg={fg} size={96} fontSize={30} />
      </div>
    </div>
  );
}
