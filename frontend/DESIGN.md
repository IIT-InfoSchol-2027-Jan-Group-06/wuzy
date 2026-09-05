# Wuzy Frontend Design System

Source of truth for UI in Wuzy. Every value here lives in code at `constants/wuzy-theme.ts`; import from there, never retype a hex or a ratio. `tailwind.config.js` reads the same file, so `bg-wuzy-bg` and `wuzyColors.bg` are always the same color.

---

## Colors (`wuzyColors`)

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0A0F17` | Screen background |
| `surface` | `#171E28` | Cards, rows, input fields |
| `surfaceBorder` | `#2B3545` | Borders on surface cards |
| `yellow` | `#FFE783` | Titles, section titles, primary buttons, selected chips |
| `yellowSoft` | `#FDF3C0` | Soft yellow text over photos (profile name, locations) |
| `yellowDim` | `rgba(255,231,131,0.2)` | Unselected chips, search bar, icon pills |
| `yellowMuted` | `#C1AE5F` | Outgoing chat bubble, send button |
| `gray` | `#8A96A6` | Secondary text, placeholders, inactive icons |
| `white` | `#FFFFFF` | Primary text |
| `online` | `#22C55E` | Presence dot |
| `glassFill` | `rgba(84,82,56,0.35)` | Glass button fill, incoming chat bubble |
| `glassBorder` | `rgba(255,255,255,0.15)` | Hairline borders on glass and cards |

Tailwind classes: `bg-wuzy-<token>`, `text-wuzy-<token>`, `border-wuzy-<token>`.

---

## Typography

### Fonts (`wuzyFonts`)
- Display: `BebasNeue_400Regular` (`wuzyFonts.display`). Screen titles, hero titles, dates.
- Everything else: Poppins via `wuzyFonts.body`, `medium`, `semibold`, `bold`.

### Sizes (`wuzyType`, via `useResponsive().fontSize(name)`)
Sizes are `screenWidth * ratio`, rounded. Never hardcode a pixel font size.

| Name | Ratio | At 375 | Usage |
|------|-------|--------|-------|
| `display` | 0.10 | 38 | Tab-root titles (Wuzy, Explore, Messages, Awards), profile name, event hero title |
| `title` | 0.061 | 23 | `ScreenHeader` titles, ticket card title, event date and time |
| `section` | 0.045 | 17 | Section titles (Today, Timeline, Location), card titles, prices |
| `body` | 0.037 | 14 | Body text, list names, inputs, buttons |
| `small` | 0.030 | 11 | Chips, secondary lines, timestamps in rows |
| `caption` | 0.025 | 9 | Smallest labels only (time above a title, awards label). Never below this. |

```ts
const { fontSize } = useResponsive();
<Text style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('body') }} />
```

---

## Layout (`wuzyLayout`)

| Token | Value | Usage |
|-------|-------|-------|
| `side` | 32 | Horizontal gutter on every screen |
| `top` | 12 | Padding between the safe-area inset and the first element |
| `gap` | 24 | Between sections |
| `itemGap` | 12 | Between items in a list or row |
| `navBottom` | 32 | Minimum NavBar distance from the screen bottom |

Other fixed values: cards radius 24, inputs and map radius 16, glass and nav buttons `50/375 * screenWidth`, chips px 16 py 8, motion 250ms, wheel settle 400ms.

### Design width and wide screens
`useResponsive().screenWidth` is the window width clamped to `[minWidth 320, maxWidth 430]`, so every ratio stops growing on tablets and web and stops shrinking on dense Android display-size settings. `Screen` centers a `maxWidth` column, so wide screens show a phone layout on the `bg` color instead of a stretched one. Always size from `useResponsive()`, never from `useWindowDimensions` directly.

Full-bleed content inside a padded screen uses `marginHorizontal: -wuzyLayout.side` with `paddingHorizontal: wuzyLayout.side` on the scroll content, so the first item still aligns to the gutter (see `CategoryFilter`, the Today row on Explore).

---

## Shell components

### Screen
- Wraps every route. Owns background, safe area, top padding, and the 32 gutter.
- `import { Screen } from '@/components/Screen';`
- Props: `scroll` (renders a ScrollView whose bottom padding clears the NavBar on tab screens), `padded` (default true; false for full-bleed heroes), `style` (merged into the content container), `overlay` (floating controls rendered above the content, e.g. `Fab` or a floating header).
- Tab screens get the top inset only; pushed screens get top and bottom. Screens that own their own list use `useNavBarMetrics().clearance` as the list's bottom padding.

### TabHeader
- `import { TabHeader } from '@/components/TabHeader';`
- Header for the five tab roots: Bebas `display` title on the left, optional glass buttons in `right`. Always at least one GlassNavButton tall, so Wuzy, Explore, Awards, Messages, and Profile titles sit on the same baseline whether or not a button is present.

### ScreenHeader
- `import { ScreenHeader } from '@/components/ScreenHeader';`
- Back `GlassNavButton` on the left, uppercase Bebas `title` centered, optional `right` slot (share button, Share pill). The right slot is at least as wide as the back button so the title stays centered. No padding of its own; relies on `Screen`.

### NavBar and useNavBarMetrics
- Frosted pill, 72% of screen width, rendered by the tabs layout only. Respects the bottom safe-area inset.
- `useNavBarMetrics()` returns `{ barWidth, height, bottom, clearance }`. `clearance` is the space a screen must leave at the bottom so content and the `Fab` sit 16 above the bar.

### Fab
- `import { Fab } from '@/components/Fab';`
- The floating add button. `right: side`, `bottom: clearance`. Pass through `Screen`'s `overlay` prop. Used on Home.

### GlassNavButton
- Circular frosted glass button, default size `50/375 * screenWidth`. Never pass a smaller `size` for a nav or action button; every back, settings, like, share, and camera control is this size.
- `icon` takes an Ionicons name or a node. `children` plus a `style` width and height makes a glass pill (`PublishButton`, profile action buttons).

### Chip
- `import { Chip } from '@/components/Chip';`
- The one pill: `rounded-full px-[16px] py-[8px]`, contents centered, Poppins semibold `small`. `selected` is solid yellow with bg text; otherwise `yellowDim` fill with yellow text. Used for filters, tags, status labels, date separators, and small primary actions (Visit, Allow camera).

### CategoryFilter
- Horizontal row of `Chip`s that bleeds to the screen edges. Props: `options`, `selectedId`, `onSelect`.

### TagSection
- Horizontal row of `Chip`s inside the caller's gutter. Props: `tags`, `onTagPress`.

### SearchBar
- 44 tall `yellowDim` pill, search icon, Poppins `body` input, clear button when there is text.

---

## Feature components

### UserRow
- 48 avatar, gray label with white name inline (`body`), gray timestamp (`small`). Notifications list.

### ConnectionCard
- `surface` card, radius 24, padding 16. Yellow name (`body` semibold) over white username (`small`), 56 avatar with 14 online dot, `TagSection` below. Fills its `Wheel` slot.

### Wheel
- Endless vertical picker. Props: `data`, `keyExtractor`, `renderItem`, `itemHeight`, `gap`. Centered item full size, neighbours at 0.85 opacity, fade out 3.5 items away. Resets to the first item with a 250ms ease when `data` changes. Knobs at the top of `components/Wheel.tsx`.

### PostCard
- Home feed card, width `screenWidth - 2 * side`, 418:335 aspect. Avatar and name (`body`) with location (`small`) at top-left. Double tap pops a heart.

### FeaturedEventCard and UpcomingEventCard
- Explore. Featured: 0.75 x 1.05 of screen width poster, `Chip` tag and `GlassNavButton` heart on top, time (`caption`), title (`section` bold), location (`small` yellowSoft), price and a selected Visit `Chip` at the bottom. Upcoming: 120 tall banner, title (`body` bold), 28 host avatar, white 64 date badge with bg-colored text.

### TicketCard
- Radius 24, 13 notch radius, dashed `glassBorder` divider, dark photo backdrop, white QR. Type scales with the card width (title `width * 0.09`).

### ChatHeader, ChatBubble, MessageBar, MessageRow
- Header: back button, 44 ringed avatar, name (`body` medium) over status (`caption` yellowSoft).
- Bubble: `body` text, radius 16 with a 2 nick. Outgoing `yellowMuted` with bg text; incoming `glassFill` with `glassBorder`.
- MessageBar: 55 tall pill in `#3B3A2D` (opaque blend of `yellowDim` over `bg`), bold `body` input, send circle slides in when there is text. `onSend(text)` fires on the send button.
- MessageRow: 48 ringed avatar, name (`body` semibold) over preview (`small` gray), time (`caption`) and unread dot on the right.

### QrCode
- `value`, `size`, `color`, `card`. Card mode is a white rounded container; `card={false}` renders bare modules over dark images.

---

## Screens

Tab roots (Home, Explore, Awards, Messages, Profile) open with `TabHeader`. Pushed screens open with `ScreenHeader`.

- Profile: edge-to-edge hero photo (`screenWidth * 1.3` tall) with connect and settings glass buttons at the top right and the name, awards, and bio at its foot; then tags, two glass pill buttons, a Timeline title, and a full-bleed three-column grid.

- Connections: `ScreenHeader`, `SearchBar`, count, then a `Wheel` of `ConnectionCard`s (slot 132, gap 12) filling the rest of the screen.
- Ticket vault: blurred active-ticket art fills the screen behind a `ScreenHeader` and a snapping horizontal carousel (card 78% of width, gap 16).
- Chat thread: `ChatHeader`, inverted message list with a date `Chip` at the top, `MessageBar` in normal flow under the list inside a `KeyboardAvoidingView`.
- Event details: full-bleed hero with the Bebas title and a like button at its foot, floating `ScreenHeader` with a share button, then description, attendees, venue, date and time, map, gift and Buy ticket actions.
