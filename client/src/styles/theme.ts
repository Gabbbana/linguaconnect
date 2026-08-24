// Design tokens lifted directly from the LinguaConnect.dc.html prototype.
export const colors = {
  pageBg: '#F0E9DD',
  screenBg: '#FBF7F0',
  text: '#2E2823',
  textMuted: '#8B8175',
  textMuted2: '#6B6155',

  accent: '#E0674A',
  accentHover: '#C95A3F',
  accentTint: '#FDEFE9',

  secondary: '#2E9C8A',
  secondaryHover: '#278779',

  danger: '#D64545',
  dangerHover: '#BC3A3A',

  online: '#3FA34D',

  cardTint: '#F1EBE0',
  cardBorder: 'rgba(46,40,35,0.1)',
  cardBorderSoft: 'rgba(46,40,35,0.09)',
  inputBorder: 'rgba(46,40,35,0.14)',
  toggleBorder: 'rgba(46,40,35,0.16)',

  disabledBg: '#E8E1D5',
  disabledText: '#A99F91',

  nativeBadgeBg: '#DFF0EC',
  nativeBadgeText: '#26786A',
  learningBadgeBg: '#F1EBE0',
  learningBadgeText: '#6B6155',
} as const;

export const fontFamily = "'Nunito', system-ui, sans-serif";

export const avatarPalette = [
  { bg: '#FBE3D6', fg: '#B05A33' },
  { bg: '#DFE9F8', fg: '#3D6396' },
  { bg: '#EBE3F2', fg: '#71519E' },
  { bg: '#DDF0E6', fg: '#2F7D5B' },
  { bg: '#FADEE4', fg: '#B04A64' },
  { bg: '#FCE9BE', fg: '#9C6B1F' },
];

export function avatarFor(userId: number) {
  return avatarPalette[userId % avatarPalette.length];
}

export function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
