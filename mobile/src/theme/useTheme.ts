import { useColorScheme } from 'react-native';
import { useThemeStore } from '../state/themeStore';

const LIGHT = {
  bg: '#FFFDF9',
  card: '#FFFFFF',
  cardBorder: '#E7E5E4',
  text: '#111827',
  textSub: '#6B7280',
  textMuted: '#9CA3AF',
  primary: '#1B4332',
  accent: '#FF6B35',
  inputBg: '#FFFFFF',
  inputBorder: '#E7E5E4',
  sectionLabel: '#374151',
  pillBg: '#F3F4F6',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  successText: '#16A34A',
  errorBg: '#FEF2F2',
  errorText: '#DC2626',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningText: '#92400E',
};

const DARK: typeof LIGHT = {
  bg: '#0F1F17',
  card: '#1A2E22',
  cardBorder: '#2D4A38',
  text: '#F9FAFB',
  textSub: '#9CA3AF',
  textMuted: '#6B7280',
  primary: '#22C55E',
  accent: '#FF6B35',
  inputBg: '#1A2E22',
  inputBorder: '#2D4A38',
  sectionLabel: '#D1D5DB',
  pillBg: '#1A2E22',
  successBg: '#14532D',
  successBorder: '#166534',
  successText: '#4ADE80',
  errorBg: '#450A0A',
  errorText: '#FCA5A5',
  warningBg: '#422006',
  warningBorder: '#713F12',
  warningText: '#FDE68A',
};

export function useTheme() {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  return { colors: isDark ? DARK : LIGHT, isDark };
}
