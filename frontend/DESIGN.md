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

### NotificationCard
- One entry in the Notifications list: 48 avatar (the actor's, else the default), gray kind label (`caption`: Referral, Connection, Group, Like) above the backend-worded sentence (`small`, up to two lines) in white, gray timestamp (`small`) below. Tapping a row deep-links to `payload.url` (a profile or a chat thread). Pending referral rows add Accept/Decline liquid-glass pills (`LiquidGlass`, `control` tall, flex row, `itemGap` 12): Accept tint 0.3, Decline 0.1, both with `small` semibold yellow text. Tapping either opens a `ConfirmDialog` ("Accept Referral?"/"Decline Referral?") and confirming resolves the referral server-side; the row then reads as plain text. Once I have accepted but the other recipient has not, the pills are replaced by a `small` semibold yellow "Waiting for {name}'s response" note at the same spot. Same spacing and fonts as `UserRow`.

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
- Bubble: `body` text, radius 16 with a 2 nick. Outgoing `yellowMuted` with bg text; incoming `glassFill` with `glassBorder`. A voice note (bubble carrying `audio_url`) renders `VoiceNoteBubble` instead of text or media.
- MessageBar: `control` tall pill in `#3B3A2D` (opaque blend of `yellowDim` over `bg`), bold `body` input, send circle slides in when there is text. `onSend(text)` fires on the send button.
- Attach popup: a rounded `surface` sheet that rises from below the same row, exactly matching the bar's width, `bottom` = `control` + 10 (a 10px gap, `wuzyLayout.control + 10`), the four glass buttons (Camera, Gallery, Location, Calendar) spaced `space-evenly` so they stay evenly distributed and centered as the bar grows. It toggles only via the attach icon, and the chat route closes it on focus return (from the camera flow or anywhere else) so it never shadows the bar after navigating away and back. The Camera button closes the sheet and pushes `/camera` carrying `id`/`kind`/`otherUserId`, the parameters of the thread the sheet sits on. The Gallery button keeps the sheet open underneath and lifts the `GalleryPopup` overlay instead. The sheet's visibility is controlled by the chat route (`attachOpen`, passed into `MessageBar`), so it can stay raised under the overlay and be dismissed together with it.
- Voice notes in MessageBar (`components/chat/MessageBar.tsx`, `components/chat/Waveform.tsx`): the mic button next to attach swaps the whole bar row for the voice flow, phases `idle` -> `recording` -> `preview`. Recording shows a trash `Pressable` (yellow `trash-outline`, 44 hit target), the live `Waveform` fed by `recordingLevels(elapsedMs, metering)` (22 bars yellow up to the fill line), a `m:ss` timer (`formatVoiceTime`), and a yellow Send pill (bg label + arrow). Recording needs `expo-audio` mic permission, requested and awaited on first tap after `setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })`; a denied request never enters the recording phase, a `ConfirmDialog` ("Microphone access needed") is the fallback instead. Recorder options merge `RecordingPresets.HIGH_QUALITY` with `isMeteringEnabled: true` and `directory: 'document'`. Starting a recording closes the attach sheet and drops the keyboard. The first Send tap just stops and finalizes the local file, then opens preview: the same trash and Send pill around a playable waveform using `staticLevels(22, durationMs)` whose yellow fill tracks `currentTime / duration`, with playback via `useAudioPlayer`/`useAudioPlayerStatus` from `expo-audio` and `playVoiceNote`/`releaseVoiceNote` (see `lib/voice-player.ts`) keeping one note playing app-wide, the same singleton the chat `VoiceNoteBubble` uses. Trash in either phase asks via the shared `ConfirmDialog` ("Do you want to delete voice note?") with Yes / No: while recording the note is paused first so No returns to recording via `record()`, while Yes stops, deletes the local file (new `expo-file-system` `File` API), and returns the bar to idle; in preview Yes discards and returns to idle, No leaves the preview untouched. The second Send tap uploads as `uploadImage('audio', uri)` and hands the returned URL plus duration to the route (`onSendVoiceNote`), which appends the bubble optimistically. The bar returns to idle after a success or a discard.
- VoiceNoteBubble (`components/chat/VoiceNoteBubble.tsx`): rendered by ChatBubble when `audio_url` is present (in place of media and any caption image), a 36 yellow play/pause circle over a 22-bar static waveform with a `m:ss` label; outgoing notes use `bg` accents on the `yellowMuted` bubble, incoming use `wuzy-yellow` on `glassFill`. On finish the note seeks back to 0 and releases itself so a later tap replays. Voice note frames over the socket are the WS `voice_note` type carrying `audio_url` + `duration_ms`; files upload through `/upload/audio` and are fetchable from the public `/uploads` mount. The local DB stores both columns (chat-db v5) and the chat list preview reads "Voice note".

### CameraHeader, CameraCapture, and the chat camera flow
- CameraHeader: the shared head for the chat photo frames. The title (Poppins semibold `section` in `wuzy-yellow`, one step up from the connection-name style it matches in every way but size) defaults to `CAMERA` and takes a `title` prop so the gallery send frame renders `GALLERY` with the same look. It is vertically centered on the same row as the back button (`position: absolute`, `alignSelf: 'stretch'`, `justifyContent: 'center'`), with an optional back `GlassNavButton` on the left and a caller-provided `right` node on the right. `showBack={false}` swaps the back button for an empty slot of the same size; the photo-confirm frame uses it so retake below the photo is the only way back. The header stays identical-looking across live capture, photo confirm, capture send, and gallery send while each frame supplies its own action.
- CameraCapture: the shared live-camera surface, `forwardRef` exposing `takePicture()`; wraps `expo-camera`'s `CameraView` with a flip-keyed remount (`key={type}`) so `takePicture` always fires on a camera that is actually ready shirt.
- Flow (all in `Poppins`/Bebas per the design tokens, no gallery picker): `/camera` (live preview at the exact spot of the confirmed picture, circular shutter, 30 between the preview and the controls). Capture sets a pending photo (`lib/media.ts`) and pushes `/camera-preview` (photo confirm with no back button: a retake/checkmark `GlassNavButton` pair 20% larger than the standard 50, centered under the picture 30 below it with a 40 gap between them; retake clears the pending photo and returns to `/camera` armed to shoot again, checkmark pushes `/camera-send`). `/camera-send` and the gallery's `/send-gallery` share `PhotoSendFrame` (below): the photo (same size as the confirm frame) above a `yellowDim` caption pill sized like the chat `MessageBar` input (44 tall, the bar's 16 horizontal padding, its text vertically centered and left-aligned in a single line) with the Send button centered 20 below the pill; the Send pill is 12% larger than the standard share pill (height, min-width, padding, gap, text and icon all scaled 1.12, i.e. the earlier 1.4 shrank by 20%). Send uploads the image (`uploadImage('post', uri)`), sends it into the opening thread via `sendDm`/`sendGroup` (media rides `media_url`, caption rides `text`, one bubble), marks the thread active, then each route pops its own way back: the camera frame `router.dismiss(3)` to the chat with the attach popup closed, the gallery frame a single `router.back()` onto the chat where both popups are already compressed (they close the instant a picture is picked).
- Sent photos in ChatBubble follow the bubble's own corner grammar. A picture with no caption gets the standard image radius (`Math.round(RADIUS * 0.75)` = 12) on all four corners. A picture with a caption keeps the bubble's asymmetric top: the two bottom corners are 0 (the caption block connects directly under it), and the top corners reuse `RADIUS`/`NICK` with the tail side mirroring the direction (top-right compressed for outgoing, top-left for incoming), so picture messages read like their text siblings. Thread history reloads on focus (`useFocusEffect` → `reloadHistory`), so a photo sent in the camera flow appears in the thread on return. The native `ws` backend forwards `media_url` untouched; its push text falls back to "Photo" for media-only messages.
- MessageRow: 48 ringed avatar, name (`body` semibold) over preview (`small` gray), time (`caption`) and unread dot on the right.

### GalleryPopup and the gallery send flow
- GalleryPopup (`components/chat/GalleryPopup.tsx`): a thin wrapper that launches the system photo picker (`expo-image-picker` `launchImageLibraryAsync`) on mount, rendering an opaque `bg` backdrop behind the native UI. No custom grid, no permission gate, no header: the system handles all of that. On pick, it resolves the asset's file URI and calls `onSelect(assetId, uri)`; on cancel it calls `onClose`. Both callbacks collapse the overlay and attach sheet together (via `closeGallery` in the chat route), and the picked photo goes out-of-band (`lib/media.ts`) like the camera path. The flow is: Attach -> Gallery (system picker) -> pick or cancel (both popups compress) -> send -> back, and the picker cannot linger.

### Voice notes in chat (backend + message shape)
- Uploads go to `/upload/audio` (kind `audio`, extensions `m4a`/`mp3`/`webm`), served from the public `/uploads` mount so audio URLs are fetchable without auth. Socket frames of type `voice_note` carry `audio_url` + `duration_ms` with no caption; the WS router accepts only the known types (`message` and `voice_note`) and forwards the extra fields verbatim, so the local queue, optimistic append, and history reload all round-trip the same shape. The chat list preview shows "Voice note" for these (see the chat-db SQL comments), and outbox pushes fall back to a generic new-message text like other media.

### QrCode
- `value`, `size`, `color`, `card`. Card mode is a white rounded container; `card={false}` renders bare modules over dark images.

### QrScanner
- Camera side of the Connect card (`components/QrScanner.tsx`). A square (`aspectRatio: 1`, radius 24) `surface` box holding either a live `CameraView` (QR barcode scan behind a yellow finder frame) or the scan outcome. Parses the scanned URL's `/profile/<username>`, looks the user up (`/users/by-username/{username}`), checks the current user's connections (`/chat/people`, fetched fresh at scan time so it is never stale), and flashes a brief yellow "Connected!" when they are new (establishing the mutual follow via `/users/{id}/connect`) or "Already Connected!" when they are already a Connection. Identical font, color, and placement for both messages, and both return to scanning on their own after 1.5s. The new connection's card appears on the Connections screen (refetched on focus), never in the camera view. An "Allow camera" `Chip` asks for permission when it is missing.

### ProfileHero and ProfileGrid
- ProfileHero: full-width background photo (explicit capped height, same rule as the profile hero) fading to `bg`, with Bebas `hero` name, awards, and `body` bio at its foot. When real earned awards are available via the `awards` prop, the medal icons are replaced by 32px sticker tile images; the medal icon count stays as a fallback on other profiles. `actions` render at the top right (owner only: Connect and Settings glass buttons).
- ProfileGrid: full-bleed three-column photo grid of `ApiPost`s with loading and empty states. `onEmptyPress` turns the empty state into the owner's "share your first one" call to action; without it the empty state is a plain "No posts yet".
- Used by Profile (tab, owner, has edit/connect/connections actions) and the pushed `profile/[id]` route (read-only viewer: floating `ScreenHeader` back button only, lists that user's permanent posts).

### Awards tab (RankCard, StickerGrid, QuestsSection, QuestCard)
- **Data**: one call, `GET /quests/` via `hooks/useQuests.ts`, returns `xp` (total, rank, thresholds), the user's 15-id badge `deck`, and every quest with its tiers. `claim(key)` posts `POST /quests/{key}/claim` and swaps the whole dashboard in one state update; the hook keeps the previous dashboard so the screen animates only what changed and never on first load. Progress is counted server-side by the actions themselves (connect, referral, group, RSVP, tickets, profile edit, daily login from `context/auth.tsx`); the client never bumps a counter.
- **RankCard**: `surface` card, radius 24, padding 16, a centred column at `itemGap`. A 180 box with the rank's badge (`deck[10 + rank_index]`, `resizeMode="contain"`); on a rank-up the old badge fades out (260ms) while the new one fades in and springs up from 40, once, no matter how many ranks were jumped. At Diamond three nested `yellowDim` circles (240 / 200 / 160) pulse slowly behind it. Below, centred at gap 4: rank name (`section` semibold yellow), `{total} XP` (`body` white), an 8 tall full-width `bg-white/10` bar whose yellow fill snaps on mount and eases (500ms) on change, a gray `small` caption "{n} XP to {next}" or "Max rank", then a "Badges {earned} of 15" row (`small` semibold yellow with a 16 chevron) that pushes `/badges`. Ranks: Bronze 0, Silver 250, Gold 600, Diamond 1100.
- **StickerGrid** (on the Badges screen): "{earned} of 15 collected" (`small` gray), then the deck as 5 columns of square `surface` tiles (radius 16, padding 6, gap 8, width from the gutter like `ProfileGrid`). Earned tiles are full colour; locked ones show the art at 0.25 opacity with a 12 lock icon. `earnedSlots` and `slotLabel` in `constants/awards-data.ts` decide: slots 0..9 are earned when a completed quest's `badge_id` matches, 10..13 when the rank is reached, 9 and 14 are "Coming soon". Tapping a tile draws a 1px yellow border and names it in the single gray `small` line under the grid ("Social Network", "Rank reward: Silver").
- **QuestsSection**: one "Quests" title (`section` semibold yellow) with the gray `small` line "Do the thing, claim the reward", then every unfinished quest at `itemGap`, claimable ones first and the rest in catalog order (a finished quest leaves the list; its badge lives on the Badges screen), or a gray `small` "Every quest is done" line when none remain. `ACTIONS` maps a quest key to its pill label and route (Add `/connect`, Refer `/connections`, Group `/new-group`, Explore, Buy `/ticket`, Share `/ticket-vault`, Gift, Edit `/edit-profile`); a quest without one (Daily Streak) shows a disabled "Auto" pill.
- **QuestCard**: `surface` card, radius 24, padding 16. Left column at gap 4: name (`body` semibold white) and a 24 tall `bg-white/10` pill with the yellow fill behind and "{current} / {target} {unit}" centred in `caption` semibold. Right: an outlined yellow action pill (`px 16 py 8`, min width 76, `small` semibold), dimmed to 0.5 when the quest has no action ("Auto"). A claimable quest is a different card: the whole card fills solid `yellow` and is the button. The name sits in `bg`, the second line "Tap to claim · +{xp} XP" (`small` medium) in bg at 70 percent, a 20 `sparkles` icon in `bg` on the right, a `bg` spinner replaces the line while the claim is in flight, and a successful claim nudges the card (spring 1.04 and back) before the `Celebration` overlay opens. A failed claim shows the backend's message as a `caption` note in `bg` under the line for 2s.
- **Celebration** (`components/awards/Celebration.tsx`): a full-screen `Modal` (`transparent`, fade, `statusBarTranslucent`) over a `bg` scrim at 0.96 that plays after a successful claim; the Awards route builds it by diffing the dashboard at tap time against the one the claim returns. Centred column at `gap`, gutter `side`. Stage 1: headline in Bebas `display` yellow (the claimed tier's name in caps, "3 FRIENDS", or "BADGE EARNED" when the quest's final tier was claimed) drops in from 24 (350ms back-ease), then at 150ms the badge (200 box, `contain`) or "+{xp} XP" (Bebas `hero` yellow) springs in from 0.4, with nothing drawn behind it. The quest name (`body` white) sits under it, with the tier name and XP in `small` gray only on the badge variant. A party popper of 72 pieces (rectangles and a few dots) bursts from the centre of the screen between 150 and 1550ms, each with its own random direction, speed and weight: a cubic ease-out gives the shove and drag, a gravity term pulls each down, they spin, and they fade only in the last stretch, all driven by one Reanimated clock. The popper is the one deliberately multi-coloured thing in the app (yellow, pink, purple, orange, cyan, green, white). "Tap to continue" (`small` gray) fades in at 1200ms and pulses. Stage 2, only on a rank change: "RANK UP", the new rank badge, the rank name (`section` semibold yellow) and a second burst. A tap anywhere (or hardware back) advances, then closes. Reduced motion: no confetti, 200ms fades.

---

## Screens

Tab roots (Home, Explore, Awards, Messages, Profile) open with `TabHeader`. Pushed screens open with `ScreenHeader`.

- Profile: edge-to-edge hero photo (1.3 x width, max 540 tall) with connect and settings glass buttons at the top right and the name, awards, and bio at its foot; then tags, two `control` tall flat glass pills (dark blur, 10% yellow tint, 20% white border, Poppins semibold `small`) that fill the row up to 160 each, a centered Timeline title, and a full-bleed three-column grid that fills the width.

- Connections: `ScreenHeader`, then a `ConnectionList` (a shared component): `SearchBar`, a live count from the backend (`/chat/people`), then a `Wheel` of `ConnectionCard`s (slot 132, gap 12) filling the rest of the screen. Refetches on focus, so a QR scan on the Connect screen appears as a new connection with an incremented count. Only one card expands at a time; a press anywhere outside it (the screen is wrapped in a collapse `Pressable`) closes it. The wheel keeps scrolling while a card is expanded; the expanded card stays painted above the rest.
- Refer to a friend (`app/refer-friend.tsx`): pushed from the Connections screen's "Refer to a friend" button with the first recipient's `id` and full `name` as params. Same `ScreenHeader` (back returns to Connections) and the same `ConnectionList`, minus the connections count, listing every connection except the referred user and anyone the referred user is already connected to (their mutual follows, refetched on focus via `GET /users/{id}/connections`). Expanding a card here shows a centered "Send Request" pill (a `GlassNavButton`, the same frosted style as the back button, `wuzy-yellow` text) 35 below the tags. Tapping it creates a backend `ReferralRequest` (`POST /referrals` with `{ first_user_id, second_user_id }`, idempotent only while a pending row exists for that sender-pair) introducing the expanded user and this card's user to each other, and the card locks to a `wuzy-yellow` awaiting note: "Awaiting for {first}'s & {second}'s response!" while both are deciding, dropping to "Awaiting for {name}'s response!" (just the one still deciding) once the other has accepted. The lock is driven by the sender's outgoing referrals (`GET /referrals/outgoing`, refetched on focus via `useOutgoingReferrals`); only cards with a pending request show the note. Once both accept the card flashes "Connection made!" for 1 second; a decline flashes "Referral Denied!" for 1 second. Both resolved outcomes are `small` semibold yellow and auto-compress the card after the flash, marking the referral `consumed` server-side (`POST /referrals/{id}/consume`) and remembering it for the session, so the card returns to the "Send Request" pill permanently and can be used to refer the same pair again. Right after the flash the card switches back to the pill and shrinks via `heightFor` = 132, staying on this screen.
- Referral QR (`app/referral-qr.tsx`): legacy, no longer reached. Accepted referrals used to push this screen (the approving user's QR plus a Done pill that consumed the request); the accepted flow now auto-compresses with a 1s "Connection made!" flash, so this route sits unused. `ConnectCard` keeps the `showBack={false}` and `doneLabel`/`onDone` overrides it depended on.
- Notifications (`app/notifications.tsx`): every row is a persisted backend `Notification` (`GET /notifications`, newest first) written by `notify()` in `ws.py`: `referral` (both recipients, with Accept/Decline), `referral_response` (the sender, on each reply), `connection` (a QR scan, or both recipients when a referral fully accepts), `referral_declined` (both recipients), `group` (each member added to a new group) and `like` (the post's author). Nobody is notified about their own action. Each row reaches an open socket as a `type: "notification"` frame (`subscribeNotifications` in `lib/ws.ts`, consumed by `useNotifications` and by the refer screen for `referral_response`); an away device gets an OS push instead. Unread chat rows still come from the local cache (`getUnreadNotifications`) as `UserRow`s. The screen groups rows into New (unread when this visit began) and Past, filters by Messages / Requests / Activity, and marks everything read on focus (`POST /notifications/read`). The Home bell shows the unread count as a `GlassNavButton` badge, refreshed on focus. Fully accepted referrals become a real connection: the backend creates the mutual follow between the two recipients, so both connection lists and counts include each other.
- Connect: full-bleed blurred profile photo behind a frosted card. Back `GlassNavButton` on the left of the top row. A centered glass pill (`ModeToggle` in `ConnectCard.tsx`, built on `LiquidGlass`): `glass` wide halves at `control` tall with a yellow 1px vertical divider down the middle. The active half is solid `wuzy-yellow` with a `wuzy-bg` icon; the inactive half is translucent with a `#282F36` icon. It sits 40 above the card and flips the single frosted card (blur, glass tint, hairline border, "Connect" title) between the owner's QR and the scanner. Same card border, radius, and positioning in both states. `ConnectCard` takes two optional overrides used by the referral QR screen: `showBack={false}` hides the back button row entirely, and `doneLabel`/`onDone` replace the mode toggle with a single Done pill the size of the toggle.
- Awards (`app/(tabs)/awards.tsx`): `TabHeader`, then `RankCard` and `QuestsSection` at `gap`, both fed by `useQuests`; a yellow spinner until the first dashboard lands.
- Badges (`app/badges.tsx`): pushed from the rank card's Badges row. `ScreenHeader`, a gray `small` intro line, then the `StickerGrid`; same `useQuests` fetch on focus.
- Edit profile (`app/edit-profile.tsx`): pushed from the Profile tab's "Edit profile" pill and the Complete Profile quest. `ScreenHeader`, a centred 96 avatar that opens the system picker (square crop) with a yellow `small` "Change photo" caption, a name input (the `SearchBar` pill minus the icon: `control` tall, `yellowDim`, Poppins `body`), a bio input (same fill, radius 16, min height 96, multiline), the hobbies from `constants/hobbies.ts` as wrapped `Chip`s, and a solid yellow `control` tall "Save changes" pill with a spinner. Save uploads a new avatar (`uploadImage('avatar')`), `PATCH /users/me`, refreshes the auth user and goes back; errors show under the button in yellow `small`.
- Gift a ticket (`app/gift-ticket.tsx`): pushed from the Gift button on Event details with the event `id`. `ScreenHeader`, then the shared `ConnectionList` without its count; an expanded card shows a 200 wide "Send ticket" `GlassNavButton` pill 35 below the tags, a `ConfirmDialog` ("Gift a ticket?") confirms, `POST /tickets/gift` sends it, the card flashes "Gifted!" for 1s and the screen closes. The recipient gets the ticket in their vault and a Gift row on Notifications.
- Ticket vault: the user's real tickets (`GET /tickets/`, each with its event slice) as `TicketCard`s in a snapping horizontal carousel (card 78% of width capped at 360, gap 16) over the active ticket's blurred art; a gray `body` line when there are none. Tapping a card opens the share sheet and counts a share (`POST /tickets/{id}/share`) only once the sheet reports it was shared.
- Chat thread: `ChatHeader`, inverted message list with a date `Chip` at the top, `MessageBar` in normal flow under the list inside a `KeyboardAvoidingView`.
- Event details: full-bleed hero with the Bebas title and a like button at its foot, floating `ScreenHeader` with a share button, then description, host and venue, date and time, interest tags, gift and Buy ticket actions. The screen loads the real event by `id` from `GET /events/{id}` (pushed from the explore cards); when pushed without an id it falls back to the top recommended pick. The ticket screen (`app/ticket.tsx`) fetches the same event by id, so its art, title, date, venue, and price all come from the backend.

## Push notifications

All of the plumbing lives in `lib/push.ts`; no call site touches expo-notifications directly.

- `configureNotifications` (called once in `app/_layout.tsx`) sets the handler so pushes show as banners while the app is foregrounded, eagerly creates the Android channels `messages` and `referrals` (Android silently drops a notification whose channel is missing), and registers the `referrals` category whose Accept/Decline actions the OS renders on the banner.
- `requestNotificationPermission` checks, then asks for, permission (Android channels first) and logs `[push] permission status:`.
- `registerForPushNotifications` (called after login) asks for permission, then registers an Expo push token only when an EAS `projectId` exists; Expo Go builds log `[push] no EAS projectId; remote push unavailable in this build` and skip it. Local notifications do not need EAS at all.
- Remote pushes are sent by the backend (`send_push` in `core/push.py`) with `channelId` and `categoryId` set per notification type, so a referral push lands on the `referrals` channel with Accept/Decline actions; those call `respondReferral` through the single response listener in `_layout.tsx`, and every push deep-links via `data.url`.
