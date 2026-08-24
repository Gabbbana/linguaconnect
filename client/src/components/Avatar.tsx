import type { CSSProperties } from 'react';

export function Avatar({
  initials,
  bg,
  fg,
  size,
  fontSize,
  ring,
  style,
}: {
  initials: string;
  bg: string;
  fg: string;
  size: number;
  fontSize: number;
  ring?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 900,
        boxShadow: ring,
        flexShrink: 0,
        ...style,
      }}
    >
      {initials}
    </div>
  );
}
