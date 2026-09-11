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
| `badgeText` | `#F3D5E0` | `StatusBadge` text and flame |
| `badgeFill` | `rgba(61,51,58,0.8)` | `StatusBadge` fill |
| `badgeBorder` | `rgba(140,98,114,0.4)` | `StatusBadge` border |

Tailwind classes: `bg-wuzy-<token>`, `text-wuzy-<token>`, `border-wuzy-<token>`.

---

## Typography

### Fonts (`wuzyFonts`)
- Display: `BebasNeue_400Regular` (`wuzyFonts.display`). Screen titles, hero titles, dates.
- Everything else: Poppins via `wuzyFonts.body`, `medium`, `semibold`, `bold`.

### Sizes (`wuzyType`)
Sizes are dp constants on the Material 3 and iOS default scales (M3 body-large 16, body-medium 14, label-medium 12, headline-small 24, display-small 36; iOS body 17, callout 16, caption 12, title 3 20, large title 34). The platform scales dp to the screen density and `allowFontScaling` (on by default) applies the user's text-size setting. Never hardcode a font size and never multiply one by the window width.

| Name | dp | Usage |
|------|----|-------|
| `hero` | 48 | Profile name only, two Bebas lines at 1.1 line height |
| `display` | 36 | Tab-root titles (Wuzy, Explore, Messages, Awards), event hero title |
| `title` | 24 | `ScreenHeader` titles, ticket card title, event date and time |
| `section` | 20 | Section titles (Today, Timeline, Location), card titles, prices |
| `body` | 16 | Body text, list names, inputs, buttons |
| `small` | 14 | Chips, secondary lines, timestamps in rows |
| `caption` | 12 | Smallest labels only (time above a title, awards label). Never below this. |

```ts
<Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body }} />
```

---

## Layout (`wuzyLayout`)

| Token | Value | Usage |
|-------|-------|-------|
| `side` | 32 | Horizontal gutter on every screen |
| `top` | 24 | Padding between the safe-area inset and the first element, so titles and header buttons clear the notch comfortably |
| `gap` | 24 | Between sections |
| `itemGap` | 12 | Between items in a list or row |
| `navBottom` | 32 | Minimum NavBar distance from the screen bottom |
| `control` | 44 | Bars and pills: `NavBar`, `MessageBar`, `SearchBar`, inputs, glass pills, action buttons. Apple's minimum hit region is 44; Material 3 buttons are 40 with a 48 target. |
| `glass` | 50 | Circular `GlassNavButton` (back, bell, like, share, settings, tickets, connect, camera, `Fab`) and the `ScreenHeader` and `TabHeader` row, which is exactly one circle tall. |

Other fixed values: cards radius 24, inputs and map radius 16, chips px 16 py 8, motion 250ms, wheel settle 400ms.

### Sizing rules
Every size is a dp number: type from `wuzyType`, control heights from `wuzyLayout`, everything else a literal. Sizes never grow or shrink with the window, so a phone at a different display density and a tablet both get the same dp geometry, which is what the platform expects. "50 px relative to the DPI" is what a dp already is: the OS multiplies it by the screen density, so `glass: 50` is the same physical size on every phone and does not become huge on a tablet.

Width comes from layout, not arithmetic: `flex: 1` or `width: '100%'` to fill, `aspectRatio` for cards, percentages for bubbles. Heroes and banners take an explicit height, `Math.min(round(width * k), cap)` from `useWindowDimensions`, because Yoga narrows an `aspectRatio` box instead of cropping it when `maxHeight` clamps it. Otherwise `useWindowDimensions` is only for layout decisions such as the profile grid cell size or centering the ticket carousel. Never multiply a font size, padding, or control size by the width, and never clamp `Screen` to a phone column.

Full-bleed content inside a padded screen uses `marginHorizontal: -wuzyLayout.side` with `paddingHorizontal: wuzyLayout.side` on the scroll content, so the first item still aligns to the gutter (see `CategoryFilter`, the Today row on Explore).

---

## Shell components

### Screen
- Wraps every route. Owns background, safe area, the `top` padding, and the 32 gutter.
- `import { Screen } from '@/components/Screen';`
- Props: `scroll` (renders a ScrollView whose bottom padding clears the NavBar on tab screens), `padded` (default true; false for full-bleed heroes), `style` (merged into the content container), `overlay` (floating controls rendered above the content, e.g. `Fab` or a floating header).
- Tab screens get the top inset only; pushed screens get top and bottom. Screens that own their own list use `useNavBarMetrics().clearance` as the list's bottom padding.

### TabHeader
- `import { TabHeader } from '@/components/TabHeader';`
- Header for the tab roots: Bebas `display` title on the left, optional glass buttons in `right`. The row is exactly one GlassNavButton tall (`glass`) with no padding of its own, so the title top is always `top + (row - lineHeight) / 2` from the safe-area inset, with or without a button. Under a header, a `SearchBar` or `CategoryFilter` sits at `itemGap` (12); the first content block sits at `gap` (24).

### ScreenHeader
- `import { ScreenHeader } from '@/components/ScreenHeader';`
- Back `GlassNavButton` on the left, uppercase Bebas `title` centered as an overlay across the whole row, optional `right` slot (share button, Share pill) of any width. The row is exactly one GlassNavButton tall, same as `TabHeader`. No padding of its own; relies on `Screen`.

### NavBar and useNavBarMetrics
- Frosted pill, `control` tall, 72% of the window width capped at 300, rendered by the tabs layout only. Respects the bottom safe-area inset.
- `useNavBarMetrics()` returns `{ barWidth, height, bottom, clearance }`. `clearance` is the space a screen must leave at the bottom so content and the `Fab` sit 16 above the bar.
- Optional `chatUnread` prop: when greater than 0, the Chat icon gets a yellow dot badge on its top-right corner with the `caption`-size count (cap 99+). Fed by the `ChatUnreadProvider` context, so any chat tab can show an up-to-date count without re-rendering the bar itself.

### Fab
- `import { Fab } from '@/components/Fab';`
- The floating add button. `right: side`, `bottom: clearance`. Pass through `Screen`'s `overlay` prop. Used on Home.

### GlassNavButton
- Circular frosted glass button, default size `glass`. Never pass a smaller `size` for a nav or action button; every back, settings, like, share, and camera control is this size.
- `icon` takes an Ionicons name or a node. `children` plus a `style` width and height makes a glass pill (`PublishButton`).

### Chip
- `import { Chip } from '@/components/Chip';`
- The one pill: `rounded-full px-[16px] py-[8px]`, contents centered, Poppins semibold `small`. `selected` is solid yellow with bg text; otherwise `yellowDim` fill with yellow text. Used for filters, tags, status labels, date separators, and small primary actions (Visit, Allow camera).

### StatusBadge
- `import { StatusBadge } from '@/components/events/StatusBadge';`
- Mauve pill (`badgeFill`, `badgeBorder`, `badgeText`) with a 12 flame and `caption` text, px 10 py 5. Event status tags only (Selling fast, Early bird, Popular). Not a `Chip`: the yellow pill is for filters, tags, and actions.

### CategoryFilter
- Horizontal row of `Chip`s that bleeds to the screen edges. Props: `options`, `selectedId`, `onSelect`.

### TagSection
- Horizontal row of `Chip`s inside the caller's gutter. Props: `tags`, `onTagPress`.

### SearchBar
- `control` tall `yellowDim` pill, search icon, Poppins `body` input, clear button when there is text.

---

## Feature components

### UserRow
- 48 avatar, gray label with white name inline (`body`), gray timestamp (`small`). Notifications list.

### ConnectionCard
- `surface` card, radius 24, padding 16. Yellow name (`body` semibold) over white username (`small`), 56 avatar with 14 online dot, `TagSection` below. Fills its `Wheel` slot.

### Wheel
- Endless vertical picker. Props: `data`, `keyExtractor`, `renderItem`, `itemHeight`, `gap`. Centered item full size, neighbours at 0.85 opacity, fade out 3.5 items away. Resets to the first item with a 250ms ease when `data` changes. Knobs at the top of `components/Wheel.tsx`.

### PostCard
- Home feed card, fills the gutter width at a 335:418 aspect ratio. Avatar and name (`body`) with location (`small`) at top-left. Double tap pops a heart.

### FeaturedEventCard and UpcomingEventCard
- Explore. Featured: 300 wide poster at a 0.75:1.05 aspect ratio, `StatusBadge` tag and `GlassNavButton` heart on top, time (`caption`), title (`section` bold), location (`small` yellowSoft), price and a selected Visit `Chip` at the bottom. Upcoming: 120 tall banner, title (`body` bold), 28 host avatar, white 64 date badge with bg-colored text.

### TicketCard
- Radius 24, 13 notch radius, dashed `glassBorder` divider, dark photo backdrop, white QR. Height is 1.58 x the width prop; type is `title` and `small`.

### ChatHeader, ChatBubble, MessageBar, MessageRow
- Header: back button, 44 ringed avatar, name (`body` medium) over status (`caption` yellowSoft).
- Bubble: `body` text, radius 16 with a 2 nick. Outgoing `yellowMuted` with bg text; incoming `glassFill` with `glassBorder`.
- MessageBar: `control` tall pill in `#3B3A2D` (opaque blend of `yellowDim` over `bg`), bold `body` input, send circle slides in when there is text. `onSend(text)` fires on the send button.
- MessageRow: 48 ringed avatar, name (`body` semibold) over preview (`small` gray), time (`caption`) and unread dot on the right.

### QrCode
- `value`, `size`, `color`, `card`. Card mode is a white rounded container; `card={false}` renders bare modules over dark images.

### ProfileHero and ProfileGrid
- ProfileHero: full-width background photo (explicit capped height, same rule as the profile hero) fading to `bg`, with Bebas `hero` name, awards medals, and `body` bio at its foot. `actions` render at the top right (owner only: Connect and Settings glass buttons).
- ProfileGrid: full-bleed three-column photo grid of `ApiPost`s with loading and empty states. `onEmptyPress` turns the empty state into the owner's "share your first one" call to action; without it the empty state is a plain "No posts yet".
- Used by Profile (tab, owner, has edit/connect/connections actions) and the pushed `profile/[id]` route (read-only viewer: floating `ScreenHeader` back button only, lists that user's permanent posts).

### BadgeGrid (awards sticker board)
- **When to Use**: The Awards screen's sticker board (`app/(tabs)/awards.tsx`)
- **Import**: `import { BadgeGrid } from '@/components/awards/BadgeGrid';`
- **Look**: A fixed 200 tall transparent yellow glass card: `bg-[#FFE783]/10`, `backdrop-blur` (a BlurView on native), `border border-[#FFE783]/20`, `rounded-3xl`, `overflow-hidden`
- **Placement**: A seeded random scatter (`STICKER_PLACEMENTS`): each sticker lands anywhere inside the box margins so it reads as a fun board rather than a grid, and never overlaps another. Any sticker the random pass cannot fit is placed on a gap-checked lattice sweep.
- **Data**: The full 15-sticker set renders always as a fixed decorative board. The art is bundled locally in `components/awards/BadgeGrid.tsx`. Nothing is read from the API. Empty-state hints are unnecessary because the board is never empty.
- **Sticker feel**: Each sticker is 40-46 square, tilted up to `±12deg`, stacked with `zIndex`, and carries a soft drop shadow. No background cards or borders on individual items.
- **Asset rule**: Badge files must be transparent PNGs with no square background frame baked into the image.

### QuestCard and QuestsSection (awards tasks)
- **When to Use**: The Awards screen's task list (`app/(tabs)/awards.tsx`). Three flat tasks: Attend Live Events, Social Network, Ticket Sharing.
- **Import**: `import { QuestCard } from '@/components/awards/QuestCard';` and `import { QuestsSection } from '@/components/awards/QuestsSection';`
- **Data**: `apiGetQuests()` returns each task with `current_progress`, `target_count`, `progress_unit`, and a derived `claimed` boolean, plus its reward fields. `apiBumpQuestProgress(id)` counts one performed action (capped at the target; reaching it flips `claimed` true). Task header art maps by task name via `questArtFor` in `constants/awards-data.ts`.
- **Look**: Compact `surface` card, radius 24, padding 16, cards stacked at `itemGap`. One row: a 48 slot with task art on the left; a center column holding the task name (Poppins semibold white), a 5 tall yellow progress bar that fills `current / target` underneath it, and a `caption` gray counter such as "7 / 10 friends" or "3 / 3 completed" below the bar; the right column holds the status control. No subtask lists, reward lines, or step rows.
- **Status control (right)**: Incomplete tasks with an action get an outlined yellow pill: Social Network "Add" pushes `/connect`, Ticket Sharing "Share" pushes `/ticket-vault`, and Attend Live Events has none. When the counter hits the target the card shows a solid yellow Claim pill (+ N XP). Pressing it triggers a sparkle-pop animation: the pill springs outward and a burst of colored particles flies up and fades, then after a short beat the pill swaps to the bordered grayed-out Claimed badge. Claiming a task that is not yet at the target returns a 400, so only genuinely completed tasks can be claimed.
- **Real-time progress**: The screens that perform the counted action call `apiBumpQuestProgress` (buying a ticket in `event-details.tsx`, sharing one in `ticket-vault.tsx`). `QuestsSection` refetches on focus, so the bar and counter update the moment the user returns to the Awards screen.

---

## Screens

Tab roots (Home, Explore, Awards, Messages, Profile) open with `TabHeader`. Pushed screens open with `ScreenHeader`.

- Profile: edge-to-edge hero photo (1.3 x width, max 540 tall) with connect and settings glass buttons at the top right and the name, awards, and bio at its foot; then tags, two `control` tall flat glass pills (dark blur, 10% yellow tint, 20% white border, Poppins semibold `small`) that fill the row up to 160 each, a centered Timeline title, and a full-bleed three-column grid that fills the width.

- Connections: `ScreenHeader`, `SearchBar`, count, then a `Wheel` of `ConnectionCard`s (slot 132, gap 12) filling the rest of the screen.
- Ticket vault: blurred active-ticket art fills the screen behind a `ScreenHeader` and a snapping horizontal carousel (card 78% of width capped at 360, gap 16).
- Chat thread: `ChatHeader`, inverted message list with a date `Chip` at the top, `MessageBar` in normal flow under the list inside a `KeyboardAvoidingView`.
- Event details: full-bleed hero with the Bebas title and a like button at its foot, floating `ScreenHeader` with a share button, then description, attendees, venue, date and time, map, gift and Buy ticket actions.
