export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  backgroundStart: string;
  backgroundMid: string;
  backgroundEnd: string;
  surface: string;
  surfaceAlt: string;
  cardBg: string;
  cardBorder: string;
  primary: string;
  primarySoft: string;
  accent: string;
  success: string;
  textMain: string;
  textMuted: string;
  textDescription: string;
  error: string;
  // Tag colors for history badges
  tagAi: string;
  tagBinary: string;
  tagSpeech: string;
}

export const lightColors: ThemeColors = {
  backgroundStart: '#F7F9FC',
  backgroundMid: '#EEF2F8',
  backgroundEnd: '#E6ECF5',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F5FA',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  primary: '#2563EB',
  primarySoft: 'rgba(37, 99, 235, 0.1)',
  accent: '#7C3AED',
  success: '#22C55E',
  textMain: '#0F172A',
  textMuted: '#94A3B8',
  textDescription: '#64748B',
  error: '#EF4444',
  tagAi: '#2563EB',
  tagBinary: '#7C3AED',
  tagSpeech: '#0EA5E9',
};

export const darkColors: ThemeColors = {
  backgroundStart: '#0B1020',
  backgroundMid: '#0F1629',
  backgroundEnd: '#141B33',
  surface: '#161B2E',
  surfaceAlt: '#1B2138',
  cardBg: '#161B2E',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  primary: '#3B82F6',
  primarySoft: 'rgba(59, 130, 246, 0.16)',
  accent: '#A855F7',
  success: '#22C55E',
  textMain: '#FFFFFF',
  textMuted: '#64748B',
  textDescription: '#94A3B8',
  error: '#F87171',
  tagAi: '#3B82F6',
  tagBinary: '#A855F7',
  tagSpeech: '#38BDF8',
};

export const palettes: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

/**
 * @deprecated Use `useTheme()` for dynamic light/dark colors.
 * Kept as a static fallback (dark palette) for non-React modules.
 */
export const THEME = { colors: darkColors };
