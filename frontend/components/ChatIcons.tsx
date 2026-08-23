import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function HomeIcon({ size = 28, color = '#FFFFFF', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9 22v-6h6v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChatIcon({ size = 28, color = '#FFFFFF', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.32 0-2.58-.3-3.7-.83L3 21l1.6-5.7A8.5 8.5 0 1 1 21 11.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke={color} strokeWidth={strokeWidth * 1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function PartyIcon({ size = 28, color = '#FFFFFF', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 8a2 2 0 0 1 4 0c0 1.5-1 3-1.5 4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M19 8a2 2 0 0 0-4 0c0 1.5 1 3 1.5 4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 4v2M7.5 12c1.5 0 2.5 1 3.5 2s2 2 3.5 2M4.5 14.5c1-.5 1.5 0 2 .5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m5 13 3 6h3l-3-6zM14.5 9.5l2.5 4.5H12z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color = '#FFFFFF', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m21 21-4.35-4.35" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = '#FFFFFF', strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}