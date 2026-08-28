# Wuzy Frontend Design System

This file defines the source of truth for UI design in Wuzy. Follow these tokens and components strictly across all screens.

---

## Colors

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `bg` | `#0A0F17` | Screen background (dark charcoal) |
| `surface` | `#171E28` | Elevated surfaces, cards, rows |
| `surface-glass` | `rgba(23, 30, 40, 0.65)` | Frosted glass containers |
| `border-glass` | `rgba(255, 255, 255, 0.15)` | Glass borders |
| `yellow` | `#FFE783` | Primary display accents, active tabs, header titles |
| `white` | `#FFFFFF` | Primary text, bright icons |
| `gray` | `#8A96A6` | Secondary text, inactive tab icons, subtext |
| `badge-online` | `#22C55E` | Online presence indicators |

---

## Typography

### Fonts
- **Display**: `BebasNeue_400Regular` (`wuzyFonts.display`)
- **Body / Headings**: `Poppins` (`wuzyFonts.regular`, `wuzyFonts.medium`, `wuzyFonts.semibold`, `wuzyFonts.bold`)

### Font Size Ratios
Font sizes scale with screen width (`screenWidth * ratio`):

| Ratio | Multiplier | Usage |
|-------|------------|-------|
| Title / Header | `0.061` | Screen titles in `ScreenHeader` |
| Ticket Title | `0.076` | Main event title on `TicketCard` |
| Ticket Subtext | `0.033` | Event date and venue on `TicketCard` |
| Body Regular | `0.037` | Main text content |
| Small / Badge | `0.030` | Timestamps, status labels |

---

## Components

### ScreenHeader
- Fixed header on pushed sub-screens
- Left: `GlassNavButton`
- Center: Yellow uppercase title with Bebas Neue (`fontFamily: wuzyFonts.display`)
- Right: Spacer of equal size to maintain symmetry

### GlassNavButton
- Circular frosted glass button with subtle gold sheen and dark blur
- Renders arrow-back or custom icons

### TicketCard
- **When to Use**: Event tickets with authentic notch silhouette, dashed divider, dark photo backdrop, and centered QR code
- **Import**: `import { TicketCard } from '@/components/TicketCard';`
- **Shape**: Rounded rectangle (`24px` border radius) with circular side notches (`26px` diameter) dividing top and bottom sections
- **Divider**: Dashed horizontal line connecting the side notches
- **Background**: Full-bleed event image with dark frosted overlay (`rgba(10, 15, 23, 0.74)`)
- **Top Section**: Event title (`Poppins_700Bold`, uppercase, white), date & venue (`Poppins_500Medium`, uppercase, white/85)
- **Bottom Section**: Centered pure white QR code overlay (`QrCode` with `color="#FFFFFF"`, `card={false}`)

### QrCode
- **When to Use**: Scannable QR code for tickets, check-ins, or share links
- **Import**: `import { QrCode } from '@/components/QrCode';`
- **Props**: `value: string`, `size?: number`, `color?: string`, `card?: boolean`
- **Modes**: Default card mode with white rounded container, or overlay mode (`card={false}`) for bare white modules over dark images

---

## Ticket Vault Screen

### Structure
- Route: `app/(tabs)/home/ticket-vault.tsx`
- Header: `ScreenHeader` with title `TICKETS`
- Carousel: Horizontal `FlatList` with `snapToInterval={cardWidth + cardGap}`, `decelerationRate="fast"`, and active card centered (`(screenWidth - cardWidth) / 2` padding)
