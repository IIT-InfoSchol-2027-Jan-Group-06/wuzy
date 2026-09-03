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

### ConnectionCard
- **When to Use**: One person in the Connections list (`app/(tabs)/home/connections.tsx`)
- **Import**: `import { ConnectionCard } from '@/components/ConnectionCard';`
- **Layout**: Raised `surface` card, radius 24, padding 12. Name (Poppins SemiBold, body ratio, yellow) over username (Poppins Regular, small ratio, white) on the left; 40px avatar with a 12px `badge-online` dot on the right; interest tags below via `TagSection` (`yellowDim` fill, no border, `#CDC6B2` medium text)
- **Sizing**: Fills its parent's height (`flex-1`), so the list slot decides the card height

### Wheel
- **When to Use**: An endless vertical picker where one item is highlighted in the centre and the rest wrap around it (Connections list)
- **Import**: `import { Wheel } from '@/components/Wheel';`
- **Props**: `data`, `keyExtractor`, `renderItem`, `itemHeight`, `gap` (default 8). Each item fills a slot of `itemHeight`; the rendered item should use `flex-1`
- **Feel**: Items are projected onto a cylinder. The centred item is full size and opacity; neighbours sit one slot apart near the centre, then compress and shrink continuously toward the top and bottom (`scale = cos(angle)`), fading out about 3.5 items away. Past the last item comes the first
- **Gesture**: Vertical pan (horizontal swipes fall through). Release projects the fling a few items and settles on the nearest item with an ease-out
- **Knobs**: `STEP`, `VISIBLE`, `FLING`, `MAX_FLING`, `SETTLE_MS` at the top of `components/Wheel.tsx`

### TicketCard
- **When to Use**: Event tickets with authentic notch silhouette, dashed divider, dark photo backdrop, and centered QR code
- **Import**: `import { TicketCard } from '@/components/TicketCard';`
- **Shape**: Rounded rectangle (`24px` border radius) with circular side notches (`26px` diameter) dividing top and bottom sections
- **Divider**: Dashed horizontal line connecting the side notches
- **Background**: Full-bleed event image with dark frosted overlay (`rgba(10, 15, 23, 0.74)`)
- **Top Section**: Event title (`Poppins_700Bold`, uppercase, white), date & venue (`Poppins_500Medium`, uppercase, white/85)
- **Bottom Section**: Centered pure white QR code overlay (`QrCode` with `color="#FFFFFF"`, `card={false}`)

### ChatHeader
- **When to Use**: Top bar of an open chat (`app/(tabs)/chat/[id].tsx`)
- **Import**: `import { ChatHeader } from '@/components/chat/ChatHeader';`
- **Layout**: Floating `GlassNavButton` back button, avatar with soft yellow ring (`rgba(255,231,131,0.35)`), name (Poppins Medium, white) over status (Poppins Regular 12, `rgba(255,231,131,0.8)`) sitting flat with no pill behind them, then floating `GlassNavButton` call (`call-outline`) and video call (`videocam-outline`) buttons

### ChatBubble
- **When to Use**: A single message inside a chat thread
- **Import**: `import { ChatBubble } from '@/components/chat/ChatBubble';`
- **Props**: `text: string`, `outgoing: boolean`
- **Outgoing**: dim yellow `#C1AE5F` background, `#000811` text, radius 16 with a 2px top-right nick, soft matching glow shadow
- **Incoming**: glass `rgba(84, 82, 56, 0.35)` background (the `GlassNavButton` fill) with `rgba(255,255,255,0.3)` border, white text, radius 16 with a 2px top-left nick
- Max width 280, text Poppins Regular 16/24, all scaled by `screenWidth / 375`

### DateChip
- **When to Use**: Date separator between chat messages
- **Import**: `import { DateChip } from '@/components/chat/DateChip';`
- **Look**: Self-centered pill, `rgba(0, 19, 103, 0.5)` background, white/10 border, uppercase Poppins Medium 12 in white/60 with 0.6 letter spacing

### MessageBar
- **When to Use**: Chat composer at the bottom of an open chat
- **Import**: `import { MessageBar } from '@/components/chat/MessageBar';`
- **Look**: Full-round pill in solid `#3B3A2D` (the opaque blend of `yellowDim` over `bg`), 55 tall, emoji icon left, bold white "Message" input, attach and mic icons right
- **Placement**: Floats absolutely over the thread near the bottom edge, bubbles scroll behind it
- **Send button**: When text is typed, a `#C1AE5F` send circle slides in on the right like an elevator door and attach/mic slide left; it reverses when the text is cleared

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

---

## Connections Screen

- `ScreenHeader`, `SearchBar` and connection count in normal flow, then a `Wheel` of `ConnectionCard` rows (slot 100 tall, 8 gap, 44 horizontal padding) filling the rest of the screen
- Search filters by name, username or tag; the wheel resets to the first result. No match shows a centred gray "No connections match your search"
