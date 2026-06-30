import { useColorScheme } from 'react-native';
import { useThemeStore } from '../state/themeStore';

// ─── Ocean Breeze brand (V4 — Stitch UI) ─────────────────────────────────────
// A premium, airy fintech system. High-clarity blues on a near-white canvas.
//   Primary   Ocean Blue        #00658E  — CTAs, links, active states, amounts
//   Container Sky               #7FCDFF  — icon tiles, chips, soft gradients
//   Tertiary  Indigo            #4552C3  — secondary accents / chart series
//   Surface   Near-white        #F9F9FC  — every screen background
//   Card      White             #FFFFFF  — content cards (1px hairline border)
// Positive amounts stay green (owed to you); negative stays red (#BA1A1A).

const LIGHT = {
  bg: '#F9F9FC',
  card: '#FFFFFF',
  cardBorder: '#E2E2E5',
  text: '#1A1C1E',
  textSub: '#40484E',
  textMuted: '#70787F',
  primary: '#00658E',
  accent: '#00658E',
  inputBg: '#F3F3F6',
  inputBorder: '#E2E2E5',
  sectionLabel: '#40484E',
  pillBg: '#E7F0F7',
  successBg: '#DCFCE7',
  successBorder: '#A7F3D0',
  successText: '#16A34A',
  errorBg: '#FFDAD6',
  errorText: '#BA1A1A',
  warningBg: '#FEF3C7',
  warningBorder: '#FDE68A',
  warningText: '#92400E',

  // ── New Ocean Breeze tonal tokens (additive) ──────────────────────────────
  primaryContainer: '#7FCDFF',
  onPrimaryContainer: '#00577B',
  primarySoft: '#E2F2FB',      // light tint of primary for gradients / fills
  tertiary: '#4552C3',
  tertiaryContainer: '#BAC0FF',
  onTertiaryContainer: '#3744B4',
  secondary: '#4C6269',
  secondaryContainer: '#CCE4EC',
  onSecondaryContainer: '#50666D',
  surfaceLow: '#F3F3F6',       // surface-container-low — subtle raised fills
  surfaceHigh: '#E8E8EA',      // surface-container-high — progress tracks
  glass: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.55)',
  fab: '#111418',              // near-black floating + button
};

const DARK: typeof LIGHT = {
  bg: '#0E1419',
  card: '#1A2029',
  cardBorder: '#2A313B',
  text: '#E4E5E8',
  textSub: '#BFC7CF',
  textMuted: '#8B939B',
  primary: '#85CFFF',
  accent: '#85CFFF',
  inputBg: '#1A2029',
  inputBorder: '#2A313B',
  sectionLabel: '#BFC7CF',
  pillBg: '#16222E',
  successBg: '#06281C',
  successBorder: '#004C6C',
  successText: '#34D399',
  errorBg: '#3A1714',
  errorText: '#FFB4AB',
  warningBg: '#1C0D00',
  warningBorder: '#713F12',
  warningText: '#FCD34D',

  primaryContainer: '#004C6C',
  onPrimaryContainer: '#C7E7FF',
  primarySoft: '#10283A',
  tertiary: '#BDC2FF',
  tertiaryContainer: '#2B38AA',
  onTertiaryContainer: '#DFE0FF',
  secondary: '#B3CAD2',
  secondaryContainer: '#344A51',
  onSecondaryContainer: '#CCE4EC',
  surfaceLow: '#161C24',
  surfaceHigh: '#222A34',
  glass: 'rgba(26,32,41,0.72)',
  glassBorder: 'rgba(255,255,255,0.08)',
  fab: '#F4F5F7',
};

export function useTheme() {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  return { colors: isDark ? DARK : LIGHT, isDark };
}
