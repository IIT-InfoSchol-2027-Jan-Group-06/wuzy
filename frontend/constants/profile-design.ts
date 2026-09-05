export const profileDesignTokens = {
  colors: {
    background: '#0A0F17',
    surface: '#171E28',
    surfaceBorder: '#2B3545',
    primary: '#FFE783',
    primarySoft: 'rgba(255, 231, 131, 0.1)',
    primaryBorder: 'rgba(255, 231, 131, 0.2)',
    primaryBorderStrong: 'rgba(255, 231, 131, 0.3)',
    glassBackground: 'rgba(244, 196, 0, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    textPrimary: '#FFFFFF',
    textSecondary: '#FDF3C0',
    textMuted: '#888888',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlayStart: 'transparent',
    overlayEnd: '#0A0F17',
    linkButtonBg: 'rgba(255, 255, 255, 0.1)',
    linkButtonBorder: 'rgba(255, 255, 255, 0.2)',
    gradientRefraction: 'rgba(255, 255, 255, 0.3)',
  },

  typography: {
    display: {
      fontFamily: 'BebasNeue_400Regular',
      size: { ratio: 0.10, lineHeight: 0.11 },
    },
    title: {
      fontFamily: 'BebasNeue_400Regular',
      size: { ratio: 0.10, lineHeight: 0.11 },
    },
    body: {
      fontFamily: 'Poppins_400Regular',
      size: { ratio: 0.035, lineHeight: 0.05 },
    },
    tag: {
      fontFamily: 'Poppins_600SemiBold',
      size: { ratio: 0.032 },
    },
    button: {
      fontFamily: 'Poppins_600SemiBold',
      size: { ratio: 0.028 },
    },
    sectionTitle: {
      fontFamily: 'Poppins_700Bold',
      size: { ratio: 0.045 },
    },
    awardsLabel: {
      fontFamily: 'Poppins_400Regular',
      size: { ratio: 0.025 },
    },
    linkIcon: {
      size: 22,
    },
    awardIcon: {
      ratio: 0.035,
    },
  },

  spacing: {
    heroHeight: 400,
    heroPaddingHorizontal: 24,
    heroPaddingBottom: 30,
    heroTopActionTop: 50,
    heroTopActionRight: 20,
    sectionGap: 24,
    tagsMarginTop: 24,
    tagsPaddingHorizontal: 24,
    tagPaddingHorizontal: 16,
    tagPaddingVertical: 8,
    tagGap: 8,
    buttonsMarginVertical: 20,
    buttonsPaddingHorizontal: 24,
    buttonGap: 12,
    timelinePaddingHorizontal: 24,
    timelineTitleMarginBottom: 16,
    gridGap: 2,
    gridMarginHorizontal: -2,
    scrollPaddingBottom: 140,
  },

  dimensions: {
    buttonWidthRatio: 0.32,
    buttonHeightRatio: 0.092,
    linkButtonSize: 44,
    gridColumns: 3,
    gridGap: 2,
  },

  blur: {
    intensity: 80,
    tint: 'dark',
  },

  gradient: {
    angle: -45,
    locations: [0, 0.6, 1],
    start: { x: 1, y: 0 },
    end: { x: 0, y: 1 },
  },

  shadow: {
    button: 'lg',
    buttonOpacity: 0.4,
  },

  borderRadius: {
    full: 9999,
    button: 'full',
    tag: 20,
    hero: 0,
  },
};

export type ProfileDesignTokens = typeof profileDesignTokens;