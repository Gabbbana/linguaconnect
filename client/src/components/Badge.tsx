export function Badge({
  label,
  bg,
  color,
  size = 'sm',
}: {
  label: string;
  bg: string;
  color: string;
  size?: 'sm' | 'lg';
}) {
  return (
    <span
      style={{
        fontSize: size === 'sm' ? 11 : 11.5,
        fontWeight: 800,
        color,
        background: bg,
        borderRadius: 999,
        padding: size === 'sm' ? '3.5px 9px' : '4px 10px',
      }}
    >
      {label}
    </span>
  );
}
