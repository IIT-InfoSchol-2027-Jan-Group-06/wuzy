// Single source of truth for design tokens. Pure constants: tailwind.config.js requires this file.

export const wuzyColors = {
  bg: '#0A0F17',
  surface: '#171E28',
  surfaceBorder: '#2B3545',
  yellow: '#FFE783',
  yellowSoft: '#FDF3C0',
  yellowDim: 'rgba(255, 231, 131, 0.2)',
  yellowMuted: '#C1AE5F',
  gray: '#8A96A6',
  white: '#FFFFFF',
  online: '#22C55E',
  glassFill: 'rgba(84, 82, 56, 0.35)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  badgeText: '#F3D5E0',
  badgeFill: 'rgba(61, 51, 58, 0.8)',
  badgeBorder: 'rgba(140, 98, 114, 0.4)',
};

export const wuzyFonts = {
  display: 'BebasNeue_400Regular',
  body: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// Font sizes in dp, on the Material 3 and iOS scales (body 16, secondary 14, caption 12). Never derived from the window width.
export const wuzyType = {
  hero: 48,
  display: 36,
  title: 24,
  section: 20,
  body: 16,
  small: 14,
  caption: 12,
} as const;

// Layout constants in dp. top is added below the safe-area inset.
export const wuzyLayout = {
  side: 32,
  top: 24,
  gap: 24,
  itemGap: 12,
  navBottom: 32,
  control: 44,
  glass: 50,
} as const;
