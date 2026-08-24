// Practice languages available for matching. The prototype's chat history
// narrowed this down to English and Spanish only.
export const PRACTICE_LANGUAGES = [
  { code: 'EN', name: 'English', bg: '#DFE9F8', fg: '#3D6396' },
  { code: 'ES', name: 'Spanish', bg: '#FBE3D6', fg: '#B05A33' },
] as const;

export type PracticeLanguageName = (typeof PRACTICE_LANGUAGES)[number]['name'];

export const PRACTICE_LANGUAGE_NAMES = PRACTICE_LANGUAGES.map((l) => l.name);

export function isPracticeLanguage(name: string): name is PracticeLanguageName {
  return PRACTICE_LANGUAGE_NAMES.includes(name as PracticeLanguageName);
}

// Broader list offered for "native language" at signup — not restricted,
// since a user's native tongue isn't limited to what's practicable.
export const NATIVE_LANGUAGES = [
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
