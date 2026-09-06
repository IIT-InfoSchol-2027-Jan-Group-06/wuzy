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
};

export const wuzyFonts = {
  display: 'BebasNeue_400Regular',
  body: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// Font sizes are screenWidth * ratio, see useResponsive().fontSize.
export const wuzyType = {
  display: 0.1,
  title: 0.061,
  section: 0.045,
  body: 0.037,
  small: 0.03,
  caption: 0.025,
} as const;

// Fixed layout constants in px. top is added below the safe-area inset.
// Sizes are computed from a design width capped at maxWidth, and Screen centers a
// maxWidth column on anything wider, so tablets and web get a phone layout.
export const wuzyLayout = {
  maxWidth: 430,
  side: 32,
  top: 12,
  gap: 24,
  itemGap: 12,
  navBottom: 32,
} as const;
