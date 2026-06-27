import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

/**
 * Minimalist line icons for the bottom tab bar, matching the UI reference
 * (house / person / people / sparkle). Built with react-native-svg so there's
 * no extra icon-font dependency. Color is driven by the focused state.
 */
export type TabIconName = 'Home' | 'Friends' | 'Groups' | 'AI' | 'Personal';

export function TabBarIcon({
  name,
  color,
  size = 24,
}: {
  name: TabIconName;
  color: string;
  size?: number;
}) {
  const sw = 2;
  const common = {
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  switch (name) {
    case 'Home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 10.5 L12 4 L20 10.5 V19 a1 1 0 0 1-1 1 H5 a1 1 0 0 1-1-1 Z" {...common} />
          <Path d="M9.5 20 V14.5 h5 V20" {...common} />
        </Svg>
      );
    case 'Friends':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="8" r="3.4" {...common} />
          <Path d="M5.5 20 c0-3.6 2.9-6.2 6.5-6.2 s6.5 2.6 6.5 6.2" {...common} />
        </Svg>
      );
    case 'Groups':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="9" cy="8.5" r="3" {...common} />
          <Path d="M3.4 19.5 c0-3.2 2.5-5.4 5.6-5.4 s5.6 2.2 5.6 5.4" {...common} />
          <Circle cx="17.2" cy="7.4" r="2.4" {...common} />
          <Path d="M15.2 13.3 c3.3-.4 5.4 1.8 5.4 4.9" {...common} />
        </Svg>
      );
    case 'AI':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 3 L13.7 10.3 L21 12 L13.7 13.7 L12 21 L10.3 13.7 L3 12 L10.3 10.3 Z"
            {...common}
          />
        </Svg>
      );
    case 'Personal':
      // Receipt / expenses glyph — the personal monthly-spend tab.
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 3 h12 v18 l-2-1.3 -2 1.3 -2-1.3 -2 1.3 -2-1.3 -2 1.3 Z" {...common} />
          <Path d="M9 8 h6 M9 12 h6" {...common} />
        </Svg>
      );
    default:
      return null;
  }
}
