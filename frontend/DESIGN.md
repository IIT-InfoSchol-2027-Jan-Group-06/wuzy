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

### LiquidGlass
- `import { LiquidGlass } from '@/components/LiquidGlass';`
- Frosted yellow "liquid glass" surface: `rounded-full` with a `wuzy-yellow` hairline border, BlurView base under a translucent `wuzy-yellow` tint (default 25%, pass `tint` to tune), and a white shine down the top 60%. Pass `style` for size and layout. Only the Connect toggle (`ModeToggle`) uses it.

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

### ReferralNotificationCard
- A referral entry in the Notifications list: 48 avatar, gray `Referral` label (`caption`) above the sentence "[sender] wants to refer you to [other recipient]" (`small`, up to two lines) in white, gray timestamp (`small`) below. Pending entries add Accept/Decline liquid-glass pills (`LiquidGlass`, `control` tall, flex row, `itemGap` 12): Accept tint 0.3, Decline 0.1, both with `small` semibold yellow text. Tapping either opens a `ConfirmDialog` confirmation ("Accept Referral?"/"Decline Referral?") and confirming resolves the referral server-side; resolved entries are then removed from the list. Once I have accepted but the other recipient has not, the pills are replaced by a `small` semibold yellow "Waiting for {name}'s response" note at the same spot. Same spacing and fonts as `UserRow`.

### ConnectionCard
- `surface` card, radius 24, padding 16. White name (`body` semibold) on the left, 56 avatar with 14 online dot on the right, `TagSection` below. Fills its `Wheel` slot. Connections come from the backend (`/chat/people`) shaped into the card by `toConnection` in `constants/connection-data.ts`; the online dot stays off until presence data exists.
- Tapping anywhere on the card surface expands the card in place (only its visual padding and content, which are one element): Reanimated height grows from 132 to 215 so it overlays the wheel neighbours, and by default a row of two `control` tall buttons appears 35 below the tags: "Go to profile" (pushes `/profile/{id}`) and a two-line "Refer to a friend". Both are `GlassNavButton` pills, the same frosted glass, shape and `wp` blur as the back button, with `wuzy-yellow` text on a white tint layer (`tintColor="rgba(255, 255, 255, 0.1)"` swaps the yellow tint kept by every other button at the same 10% translucency; padding, border, shape and blur are unchanged). While expanded the card surface stops responding (the avatar tap and an outside tap collapse it, and the inner buttons keep their own taps). Pass `expandedContent` to replace those buttons (the refer screen shows a "Send Request" note instead) and `onReferPress` to wire the refer button. `ConnectionList` can be controlled (`expandedId`/`onExpandedChange`) so a screen can collapse a card programmatically, and `heightFor(c)` overrides an expanded card's height per connection (only the refer screen's collapsing card shrinks back to 132 while its content switches back to the Send Request pill).
- Nothing ever bleeds over an expanded card: the wheel re-renders the expanded card as its last sibling (`frontIndex`) and stacks the wrappers explicitly (neighbours `zIndex`/`elevation` 1, expanded 100) while the card itself repeats the same two-sided comparison. On Android the expanded item's wrapper and the card both set `needsOffscreenAlphaCompositing` and `renderToHardwareTextureAndroid` so their text and images composite above the siblings. No inner element of the card sets its own `zIndex`/`elevation`.

### Wheel
- Endless vertical picker. Props: `data`, `keyExtractor`, `renderItem`, `itemHeight`, `gap`, `frontIndex`. Centered item full size, neighbours at 0.85 opacity, fade out 3.5 items away. Resets to the first item with a 250ms ease when `data` changes. Knobs at the top of `components/Wheel.tsx`. Pass `frontIndex` to paint that item last and above every other (`zIndex`/`elevation` 100 vs 1), so an expanded card is never covered while the wheel keeps scrolling underneath it.

### PostCard
- Home feed card, fills the gutter width at a 335:418 aspect ratio. Avatar and name (`body`) with location (`small`) at top-left. Double tap pops a heart.

### FeaturedEventCard and UpcomingEventCard
- Explore. Featured: 300 wide poster at a 0.75:1.05 aspect ratio, `StatusBadge` tag and `GlassNavButton` heart on top, time (`caption`), title (`section` bold), location (`small` yellowSoft), price and a selected Visit `Chip` at the bottom. Upcoming: 120 tall banner, title (`body` bold), 28 host avatar, white 64 date badge with bg-colored text. The `CategoryFilter` options are fetched per user from `GET /events/categories` (ranked by the same interest vocabulary as the feed) so each user's pills reflect their hobbies; cards push `/event-details` with the event `id`.

### TicketCard
- Radius 24, 13 notch radius, dashed `glassBorder` divider, dark photo backdrop, white QR. Height is 1.58 x the width prop; type is `title` and `small`.

### ChatHeader, ChatBubble, MessageBar, MessageRow
- Header: back button, 44 ringed avatar, name (`body` medium) over status (`caption` yellowSoft).
- Bubble: `body` text, radius 16 with a 2 nick. Outgoing `yellowMuted` with bg text; incoming `glassFill` with `glassBorder`.
- MessageBar: `control` tall pill in `#3B3A2D` (opaque blend of `yellowDim` over `bg`), bold `body` input, send circle slides in when there is text. `onSend(text)` fires on the send button.
- MessageRow: 48 ringed avatar, name (`body` semibold) over preview (`small` gray), time (`caption`) and unread dot on the right.

### QrCode
- `value`, `size`, `color`, `card`. Card mode is a white rounded container; `card={false}` renders bare modules over dark images.

### QrScanner
- Camera side of the Connect card (`components/QrScanner.tsx`). A square (`aspectRatio: 1`, radius 24) `surface` box holding either a live `CameraView` (QR barcode scan behind a yellow finder frame) or the scan outcome. Parses the scanned URL's `/profile/<username>`, looks the user up (`/users/by-username/{username}`), checks the current user's connections (`/chat/people`, fetched fresh at scan time so it is never stale), and flashes a brief yellow "Connected!" when they are new (establishing the mutual follow via `/users/{id}/connect`) or "Already Connected!" when they are already a Connection. Identical font, color, and placement for both messages, and both return to scanning on their own after 1.5s. The new connection's card appears on the Connections screen (refetched on focus), never in the camera view. An "Allow camera" `Chip` asks for permission when it is missing.

### ProfileHero and ProfileGrid
- ProfileHero: full-width background photo (explicit capped height, same rule as the profile hero) fading to `bg`, with Bebas `hero` name, awards, and `body` bio at its foot. When real earned awards are available via the `awards` prop, the medal icons are replaced by 32px sticker tile images; the medal icon count stays as a fallback on other profiles. `actions` render at the top right (owner only: Connect and Settings glass buttons).
- ProfileGrid: full-bleed three-column photo grid of `ApiPost`s with loading and empty states. `onEmptyPress` turns the empty state into the owner's "share your first one" call to action; without it the empty state is a plain "No posts yet".
- Used by Profile (tab, owner, has edit/connect/connections actions) and the pushed `profile/[id]` route (read-only viewer: floating `ScreenHeader` back button only, lists that user's permanent posts).

### QuestCard and QuestsSection (awards tasks)
- **When to Use**: The Awards screen's task list (`app/(tabs)/awards.tsx`). Four parent tasks - Daily Login, Attend Live Events, Social Network, Ticket Sharing - each holding an ordered list of subtasks the user completes one at a time. Cards render in a fixed board order (`QuestsSection`): Daily Login first, Ticket Sharing last, with the custom cards (Purchase Ticket, Complete Profile) in between.
- **Import**: `import { QuestCard } from '@/components/awards/QuestCard';` and `import { QuestsSection } from '@/components/awards/QuestsSection';`
- **Data**: `apiGetQuests()` returns each task with its `active_subtask` (the first unclaimed one, carrying its own `current_progress`, `target_count`, `progress_unit` and reward) plus `subtask_step` / `subtask_total` for the step dots. `active_subtask` is null once every substep is claimed. `apiBumpQuestProgress(id)` counts one performed action (capped at the active substep's target); `apiClaimQuest(id)` claims it and advances to the next substep. Task header art maps by task name via `questArtForUser(userId, name)` in `constants/awards-data.ts`, which hands each user their personal sticker deck (a deterministic shuffle of the 15 badges seeded by their user id), so every account earns a different set of stickers.
- **Look**: Compact `surface` card, radius 24, padding 16, cards stacked at `itemGap`. One row: a center column holding the task name (Poppins semibold white), the active subtask name in yellow `caption`, then the progress bar, then the step dots; the right column holds the status control. A fully completed quest deactivates the card: the whole card dims to opacity 0.5.
- **Progress bar**: A 24 tall pill (`bg-white/10`, 11 white semibold text) with the yellow fill absolutely positioned behind it. The counter text - "0 / 3 completed", "2 / 3 friends" - sits centered inside the bar on top of the fill, so it stays readable at any fill level. Below it the step dots mark position: done steps are yellow pills, the active step is a longer yellow pill, upcoming steps are white/15 dots.
- **Status control (right)**: In-progress subtasks with an action get an outlined yellow pill: Attend Live Events "Attend" pushes `/event-details`, Social Network "Add" pushes `/connect`, Ticket Sharing "Share" pushes `/ticket-vault`. Daily Login needs no action button: the bar fills automatically each day on app launch via `apiRecordDailyLogin()`. When the active subtask hits its target the card shows a solid yellow Claim pill. Pressing it triggers a sparkle-pop on the pill (a spring and a burst of colored particles); on success the card advances to the next subtask. Claiming a subtask that is not yet at the target returns a 400. Once every substep is claimed the card shows an outlined "All Done" badge and the card dims to opacity 0.5. In the sticker board (`app/(tabs)/awards.tsx`), the badge art sits centered on the board and the XP bar sits directly beneath it. XP is computed client-side from completed quests: each of the 6 quests (4 quests + Purchase Ticket + Complete Profile) is worth a share of a 600 XP max. The badge only changes when a whole quest finishes (every subtask claimed) or a custom task completes: it advances through that user's personal deck (`boardDeckFor(userId)`, a deterministic shuffle of the 15 badges seeded by user id) as quests complete, the old badge fading out and the new one sliding up from below. On load the badge snaps straight to its current rank without animating, so only completions made while the screen is open animate. When all quests are done the bar shows "600 XP — Max rank", the final badge of the user's deck swaps in, and a soft yellow glow pulses behind it. The sticker board is the earned badge itself at the board's size, with no separate board art behind it. The XP counter sits beneath the board.
- **Real-time progress**: The route (`app/(tabs)/awards.tsx`) fetches quests on focus and owns the state. The screens that perform the counted action call `apiBumpQuestProgress` (buying a ticket in `event-details.tsx`, sharing one in `ticket-vault.tsx`, confirming a scan in `connect.tsx`). On return, `QuestsSection` re-renders from the fresh fetch, so the bar, counter, and status control update the moment the user returns to the Awards screen.

---

## Screens

Tab roots (Home, Explore, Awards, Messages, Profile) open with `TabHeader`. Pushed screens open with `ScreenHeader`.

- Profile: edge-to-edge hero photo (1.3 x width, max 540 tall) with connect and settings glass buttons at the top right and the name, awards, and bio at its foot; then tags, two `control` tall flat glass pills (dark blur, 10% yellow tint, 20% white border, Poppins semibold `small`) that fill the row up to 160 each, a centered Timeline title, and a full-bleed three-column grid that fills the width.

- Connections: `ScreenHeader`, then a `ConnectionList` (a shared component): `SearchBar`, a live count from the backend (`/chat/people`), then a `Wheel` of `ConnectionCard`s (slot 132, gap 12) filling the rest of the screen. Refetches on focus, so a QR scan on the Connect screen appears as a new connection with an incremented count. Only one card expands at a time; a press anywhere outside it (the screen is wrapped in a collapse `Pressable`) closes it. The wheel keeps scrolling while a card is expanded; the expanded card stays painted above the rest.
- Refer to a friend (`app/refer-friend.tsx`): pushed from the Connections screen's "Refer to a friend" button with the first recipient's `id` and full `name` as params. Same `ScreenHeader` (back returns to Connections) and the same `ConnectionList`, minus the connections count, listing every connection except the referred user and anyone the referred user is already connected to (their mutual follows, refetched on focus via `GET /users/{id}/connections`). Expanding a card here shows a centered "Send Request" pill (a `GlassNavButton`, the same frosted style as the back button, `wuzy-yellow` text) 35 below the tags. Tapping it creates a backend `ReferralRequest` (`POST /referrals` with `{ first_user_id, second_user_id }`, idempotent only while a pending row exists for that sender-pair) introducing the expanded user and this card's user to each other, and the card locks to a `wuzy-yellow` awaiting note: "Awaiting for {first}'s & {second}'s response!" while both are deciding, dropping to "Awaiting for {name}'s response!" (just the one still deciding) once the other has accepted. The lock is driven by the sender's outgoing referrals (`GET /referrals/outgoing`, refetched on focus via `useOutgoingReferrals`); only cards with a pending request show the note. Once both accept the card flashes "Connection made!" for 1 second; a decline flashes "Referral Denied!" for 1 second. Both resolved outcomes are `small` semibold yellow and auto-compress the card after the flash, marking the referral `consumed` server-side (`POST /referrals/{id}/consume`) and remembering it for the session, so the card returns to the "Send Request" pill permanently and can be used to refer the same pair again. Right after the flash the card switches back to the pill and shrinks via `heightFor` = 132, staying on this screen.
- Referral QR (`app/referral-qr.tsx`): legacy, no longer reached. Accepted referrals used to push this screen (the approving user's QR plus a Done pill that consumed the request); the accepted flow now auto-compresses with a 1s "Connection made!" flash, so this route sits unused. `ConnectCard` keeps the `showBack={false}` and `doneLabel`/`onDone` overrides it depended on.
- Referral delivery: creating a request notifies both recipients ("{sender} wants to refer you to {other}", different per recipient) with a live frame over the shared WebSocket (`type: "referral"`, delivered by `deliver_live` in `ws.py`, forwarded by `subscribeReferrals` in `lib/ws.ts`) plus a best-effort OS push banner for each (tapping opens Notifications). Responding updates only the responder's own status and notifies the sender back with a `type: "referral_response"` frame (`subscribeReferralResponses`), which the refer screen consumes to update an open card in place; outcomes also persist through the refetch-on-focus pattern. When the whole referral resolves (both accepted, or either declined) both recipients get another `type: "referral"` frame so their Notifications screen pops the outcome. The Notifications screen shows inbox referrals (`GET /referrals/inbox`, resolved rows included) as `ReferralNotificationCard` rows in the New group, refreshed on focus and on each live frame; only pending rows are shown, and a resolved referral pops once per session ("Connection made with {other}!" or "Referral Denied!") in a centered fade-in modal styled like `ConfirmDialog` but with a single OK pill, before the row disappears. Fully accepted referrals become a real connection: the backend creates the mutual follow between the two recipients, so both connection lists and counts include each other.
- Connect: full-bleed blurred profile photo behind a frosted card. Back `GlassNavButton` on the left of the top row. A centered glass pill (`ModeToggle` in `ConnectCard.tsx`, built on `LiquidGlass`): `glass` wide halves at `control` tall with a yellow 1px vertical divider down the middle. The active half is solid `wuzy-yellow` with a `wuzy-bg` icon; the inactive half is translucent with a `#282F36` icon. It sits 40 above the card and flips the single frosted card (blur, glass tint, hairline border, "Connect" title) between the owner's QR and the scanner. Same card border, radius, and positioning in both states. `ConnectCard` takes two optional overrides used by the referral QR screen: `showBack={false}` hides the back button row entirely, and `doneLabel`/`onDone` replace the mode toggle with a single Done pill the size of the toggle.
- Ticket vault: blurred active-ticket art fills the screen behind a `ScreenHeader` and a snapping horizontal carousel (card 78% of width capped at 360, gap 16).
- Chat thread: `ChatHeader`, inverted message list with a date `Chip` at the top, `MessageBar` in normal flow under the list inside a `KeyboardAvoidingView`.
- Event details: full-bleed hero with the Bebas title and a like button at its foot, floating `ScreenHeader` with a share button, then description, host and venue, date and time, interest tags, gift and Buy ticket actions. The screen loads the real event by `id` from `GET /events/{id}` (pushed from the explore cards); when pushed without an id (the Awards "Attend" action) it falls back to the top recommended pick. The ticket screen (`app/ticket.tsx`) fetches the same event by id, so its art, title, date, venue, and price all come from the backend.

## Push notifications

All of the plumbing lives in `lib/push.ts`; no call site touches expo-notifications directly.

- `configureNotifications` (called once in `app/_layout.tsx`) sets the handler so pushes show as banners while the app is foregrounded, eagerly creates the Android channels `messages` and `referrals` (Android silently drops a notification whose channel is missing), and registers the `referrals` category whose Accept/Decline actions the OS renders on the banner.
- `requestNotificationPermission` checks, then asks for, permission (Android channels first) and logs `[push] permission status:`.
- `registerForPushNotifications` (called after login) asks for permission, then registers an Expo push token only when an EAS `projectId` exists; Expo Go builds log `[push] no EAS projectId; remote push unavailable in this build` and skip it. Local notifications do not need EAS at all.
- `scheduleReferralNotification(senderName, targetName, referralId, senderAvatarUrl)` fires the referral as a real OS banner on this device (`title` sender name, body "wants to refer you to {target}", `data.url` `/notifications`, immediate `channelId` trigger). It is not called from the Send Request flow (in-app only); the banner's Accept/Decline actions call `respondReferral` through the single response listener in `_layout.tsx`. On iOS the sender's avatar is downloaded to the cache (`expo-file-system`) and attached to the banner; Android's `expo-notifications` JS API has no notification-image support, so the Android banner is text-only.
