import { useColorScheme } from 'react-native';
import { useThemeStore } from '../state/themeStore';

// ─── Atlantic Blue brand (V3) ────────────────────────────────────────────────
// Primary  Atlantic Blue   #0F4B70  — headers, primary buttons, deep surfaces
// CTA      Bright Blue     #0466C8  — FAB, settle/pay actions, active tab
// Accent   Soft Sky Blue   #C4F8FF  — highlights, AI tint, active chips
// Canvas   White Convolvulus #F5F2F3 — every screen background
// Positive amounts stay green (money owed to you); negative stays red.

const LIGHT = {
  bg: '#F5F2F3',
  card: '#FFFFFF',
  cardBorder: '#C4DFEF',
  text: '#04192B',
  textSub: '#33415C',
  textMuted: '#7D8597',
  primary: '#0F4B70',
  accent: '#0466C8',
  inputBg: '#FFFFFF',
  inputBorder: '#C4DFEF',
  sectionLabel: '#33415C',
  pillBg: '#EBF4FA',
  successBg: '#D1FAE5',
  successBorder: '#A7F3D0',
  successText: '#059669',
  errorBg: '#FEE2E2',
  errorText: '#DC2626',
  warningBg: '#FEF3C7',
  warningBorder: '#FDE68A',
  warningText: '#92400E',
};

const DARK: typeof LIGHT = {
  bg: '#020D16',
  card: '#04192B',
  cardBorder: '#0A3858',
  text: '#F5F2F3',
  textSub: '#8BBFD9',
  textMuted: '#4D96BE',
  primary: '#C4F8FF',
  accent: '#52E0F0',
  inputBg: '#04192B',
  inputBorder: '#0A3858',
  sectionLabel: '#8BBFD9',
  pillBg: '#072741',
  successBg: '#022C22',
  successBorder: '#0A3858',
  successText: '#34D399',
  errorBg: '#2A0A0A',
  errorText: '#F87171',
  warningBg: '#1C0D00',
  warningBorder: '#713F12',
  warningText: '#FCD34D',
};

export function useTheme() {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  return { colors: isDark ? DARK : LIGHT, isDark };
}
