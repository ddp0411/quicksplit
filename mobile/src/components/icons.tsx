import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Small UI line icons (search, filter) for in-screen controls, matching the
 * tab-bar icon style. Uses react-native-svg (already a dependency) instead of
 * typographic glyphs like ⌕ / ≡.
 */
type IconProps = { color: string; size?: number };

export function SearchIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M20 20 L16.2 16.2" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function FilterIcon({ color, size = 20 }: IconProps) {
  // Funnel
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 5 H20 L14 12.5 V19 L10 20.5 V12.5 Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
