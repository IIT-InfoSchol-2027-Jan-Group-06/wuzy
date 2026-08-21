# Profile Screen Design System

## Overview
This document defines the design tokens and specifications for the Profile screen, ensuring consistency across platforms and easy backend integration.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0A0F17` | Main screen background |
| `surface` | `#171E28` | Tag pills, card backgrounds |
| `surfaceBorder` | `#2B3545` | Tag pill borders |
| `primary` | `#FFE783` | Accent color (yellow/gold) |
| `primarySoft` | `rgba(255, 231, 131, 0.1)` | Glass button fill |
| `primaryBorder` | `rgba(255, 231, 131, 0.2)` | Glass button borders |
| `primaryBorderStrong` | `rgba(255, 231, 131, 0.3)` | Strong glass borders |
| `glassBackground` | `rgba(244, 196, 0, 0.1)` | Glassmorphism base layer |
| `glassBorder` | `rgba(255, 255, 255, 0.2)` | Navbar-style borders |
| `textPrimary` | `#FFFFFF` | Primary text |
| `textSecondary` | `#FDF3C0` | Headlines, name, section titles |
| `textMuted` | `#888888` | Secondary labels |
| `shadow` | `rgba(0, 0, 0, 0.4)` | Shadows |
| `overlayStart` | `transparent` | Gradient start |
| `overlayEnd` | `#0A0F17` | Gradient end |
| `linkButtonBg` | `rgba(255, 255, 255, 0.1)` | Link button background |
| `linkButtonBorder` | `rgba(255, 255, 255, 0.2)` | Link button border |
| `gradientRefraction` | `rgba(255, 255, 255, 0.3)` | Glass highlight line |

## Typography

All font sizes are **relative to screen width** (DPI-independent) using ratio multipliers.

| Token | Font Family | Size Ratio | Line Height Ratio | Usage |
|-------|-------------|------------|-------------------|-------|
| `display` | `BebasNeue_400Regular` | `0.10` | `0.11` | Large display text |
| `title` | `BebasNeue_400Regular` | `0.10` | `0.11` | Name (stacked) |
| `body` | `Poppins_400Regular` | `0.035` | `0.05` | Bio text |
| `tag` | `Poppins_600SemiBold` | `0.032` | - | Tag pills |
| `button` | `Poppins_600SemiBold` | `0.028` | - | Action buttons |
| `sectionTitle` | `Poppins_700Bold` | `0.045` | - | "Timeline" |
| `awardsLabel` | `Poppins_400Regular` | `0.025` | - | "awards" label |
| `linkIcon` | - | `22px` fixed | - | Link icon |
| `awardIcon` | - | `0.035` ratio | - | Medal icons |

**Calculation**: `fontSize = Math.round(screenWidth * ratio)`

Example on 390px screen:
- Name: `390 * 0.10 = 39px`
- Bio: `390 * 0.035 = 14px`
- Tags: `390 * 0.032 = 12px`

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `heroHeight` | `400px` | Hero section height |
| `heroPaddingHorizontal` | `24px` | Hero content horizontal padding |
| `heroPaddingBottom` | `30px` | Hero content bottom padding |
| `heroTopActionTop` | `50px` | Link button top position |
| `heroTopActionRight` | `20px` | Link button right position |
| `sectionGap` | `24px` | Gap between major sections |
| `tagsMarginTop` | `24px` | Tags section top margin |
| `tagsPaddingHorizontal` | `24px` | Tags horizontal padding |
| `tagPaddingHorizontal` | `16px` | Tag pill horizontal padding |
| `tagPaddingVertical` | `8px` | Tag pill vertical padding |
| `tagGap` | `8px` | Gap between tags |
| `buttonsMarginVertical` | `20px` | Action buttons vertical margin |
| `buttonsPaddingHorizontal` | `24px` | Action buttons horizontal padding |
| `buttonGap` | `12px` | Gap between action buttons |
| `timelinePaddingHorizontal` | `24px` | Timeline horizontal padding |
| `timelineTitleMarginBottom` | `16px` | Timeline title bottom margin |
| `gridGap` | `2px` | Grid item gap |
| `gridMarginHorizontal` | `-2px` | Grid negative margin for edge-to-edge |
| `scrollPaddingBottom` | `140px` | ScrollView bottom padding (navbar clearance) |

## Dimensions

| Token | Value | Description |
|-------|-------|-------------|
| `buttonWidthRatio` | `0.32` | Button width as % of screen width |
| `buttonHeightRatio` | `0.092` | Button height as % of screen width |
| `linkButtonSize` | `44px` | Link button diameter |
| `gridColumns` | `3` | Photo grid columns |
| `gridGap` | `2px` | Grid item gap |

## Blur / Glassmorphism

| Token | Value |
|-------|-------|
| `intensity` | `80` |
| `tint` | `dark` |
| `method` | `dimezisBlurView` |

Matches the Navbar blur configuration exactly.

## Gradient Overlay (Hero)

| Token | Value |
|-------|-------|
| `angle` | `-45deg` |
| `locations` | `[0, 0.6, 1]` |
| `start` | `{ x: 1, y: 0 }` |
| `end` | `{ x: 0, y: 1 }` |
| `colors` | `['transparent', '#0A0F17', '#0A0F17']` |

## Shadow

| Token | Value |
|-------|-------|
| `button` | `lg` (large) |
| `buttonOpacity` | `0.4` |

## Border Radius

| Token | Value |
|-------|-------|
| `full` | `9999` (fully rounded) |
| `button` | `full` |
| `tag` | `20px` |
| `hero` | `0` |

## Data Structure (Backend Integration)

```typescript
interface UserProfile {
  id: string;
  name: string;           // "Ludwig Bennet" → split for stacked display
  username: string;       // "@ludwigbennet"
  bio: string;            // User bio text
  avatar: ImageSource;    // Profile photo
  backgroundImage: ImageSource; // Hero background
  tags: string[];         // ["Music", "Reading", "Movie", "Tech"]
  awardsCount: number;    // Number of medals to show
  photos: ImageSource[];  // 9 images for 3x3 grid
  location?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
}
```

## Usage

```tsx
import { ProfileScreen } from '@/app/(tabs)/profile';
import type { UserProfile } from '@/constants/profile-data';

// From API
const userData: UserProfile = await fetchUserProfile(userId);

<ProfileScreen user={userData} />
```

Falls back to mock data if no `user` prop provided.