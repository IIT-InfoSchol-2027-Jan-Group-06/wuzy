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

### GlassSurface
The glass layer stack behind `GlassNavButton` and `PillButton` (filled), exported as **`GlassSurface`** (`{ radius }`): blur 40 dark, olive + yellow tints, diagonal and top-sheen gradients, white/30 outer border with white/50 top and black/30 bottom edges. Render it as the first child of any absolutely-sized rounded container that needs the glass look; never re-implement these layers inline.

---

## CategoryFilter Component

### When to Use
Use **`CategoryFilter`** for any horizontal pill-based category selector with built-in filtering. Do not create custom filter chips or horizontal scrollable category lists.

The pill itself is exported standalone as **`CategoryPill`** (`{ label, selected, onPress }`) for layouts CategoryFilter does not cover: wrapping grids or multi-select, e.g. the onboarding interests screen. Same visual spec as below.

### Import
```tsx
import { CategoryFilter } from '@/components/CategoryFilter';
import type { CategoryFilterOption } from '@/components/CategoryFilter';
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `CategoryFilterOption[]` | Yes | Array of `{ id, label }` for filter pills |
| `selectedId` | `string \| number` | Yes | Currently active category ID |
| `onSelect` | `(id: string \| number) => void` | Yes | Selection change handler |
| `containerStyle` | `ViewStyle` | No | Custom styling for scroll container |
| `data` | `T[]` | No | Data array to filter (optional) |
| `categoryKey` | `keyof T` | No | Property name to filter by (e.g., `"category"`) |
| `renderItem` | `(item: T, index: number) => ReactNode` | No | Render function for filtered items |

### Visual Specs (Fixed - Do Not Override)
- **Container**: Horizontal `ScrollView`, hidden scrollbar, `px-4` padding, `gap-2.5`
- **Pill Padding**: `px-5 py-2` (self-adjusting width)
- **Shape**: `rounded-full`
- **Active State**: `bg-[#FFE285]` solid yellow, `text-black`, `border-transparent`
- **Inactive State**: `bg-[#2A2B20]/60` translucent olive, `border-[#FFE285]/40`, `text-[#FFE285]`
- **Typography**: `font-semibold text-sm`
- **Press Feedback**: `active:opacity-75`

### Usage Examples

**Standalone Filter (controlled externally):**
```tsx
const categories: CategoryFilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'sports', label: 'Sports' },
  { id: 'movie', label: 'Movie' },
];
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
The screen lives at `app/notifications.tsx` (outside tabs, pushed over the tab bar). Entry point: bell button in the home header.

### Header
`<ScreenHeader title="Notifications" />` (shared component, below).

---

## ScreenHeader Component

### When to Use
Use **`ScreenHeader`** at the top of any pushed (non-tab) screen: back button on the left, centered title. Do not rebuild back+title headers per screen.

### Import
```tsx
import { ScreenHeader } from '@/components/ScreenHeader';
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | Yes | Screen title |

### Visual Specs (Fixed - Do Not Override)
- Back button: `GlassNavButton` with `icon="arrow-back"`, `size={(42 / 375) * screenWidth}`, calls `router.back()`
- Title: `BebasNeue_400Regular`, ratio `0.061`, color `primary` (`#FFE783`), centered against the back button with an equal-width spacer
- Padding: `px-[32px] pt-[49px]` (matches tab screens; place inside a top-edge `SafeAreaView`)

### Filters
`CategoryFilter` with All / Events / Requests, `containerStyle={{ marginTop: 16, marginHorizontal: 16 }}`. The 16px margin plus the component's internal 16px padding puts the first pill on the screen's 32px left edge, aligned with the back button, section headers, and avatars.

### Sections and rows
| Element | Spec |
|---------|------|
| Section header ("New", "Past") | `Poppins_600SemiBold`, ratio `0.041`, `#FFE783`, `12px` bottom margin |
| Section gap | `24px` |
| Gap between rows | `10px` |

Rows are rendered with the shared `UserRow` component (below). Dummy data lives in `constants/notification-data.ts` (`Notification` interface).

---

## UserRow Component

### When to Use
Use **`UserRow`** for any compact user list row: avatar + name + optional gray label and timestamp. Notification rows use it now; chat list rows should reuse it. Do not rebuild lookalike rows.

### Import
```tsx
import { UserRow } from '@/components/UserRow';
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `avatar` | `ImageSourcePropType` | Yes | User photo, rendered as a `48px` circle |
| `name` | `string` | Yes | White, `Poppins_500Medium`, `15px` |
| `label` | `string` | No | Gray (`#999999`) prefix before the name, same font/size |
| `timestamp` | `string` | No | `Poppins_500Medium`, `12px`, `#858585`, under the label line |

### Visual Specs (Fixed - Do Not Override)
- Avatar: `48px` circle, `resizeMode="cover"`
- Gap avatar to text: `13px`
- No press handling; wrap in a `Pressable` at the call site when a screen needs it

### Home header bell
- `40x40` round `Pressable`, `active:opacity-75`, right side of the `Wuzy` header row
- Icon: `assets/icons/bell.svg` (outline bell extracted from Figma, no fill), rendered at `17.5x20` via `expo-image` with `contentFit="contain"`
- Icon SVGs extracted from Figma live in `assets/icons/`
## SearchBar Component

### When to Use
Use **`SearchBar`** for any inline search input on a screen. Do not build custom search inputs.

### Import
```tsx
import { SearchBar } from '@/components/SearchBar';
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Controlled search text |
| `onChangeText` | `(text: string) => void` | Yes | Called on every keystroke |
| `placeholder` | `string` | No | Defaults to `Search` |
| `onSearchSubmit` | `() => void` | No | Called on keyboard search action |
| `onClear` | `() => void` | No | Called when the clear button is pressed |
| `className` | `string` | No | Extra NativeWind classes on the wrapper |

### Visual Specs (Fixed - Do Not Override)
- Pill: `41px` tall, `20px` radius, background `wuzyColors.yellowDim` (`rgba(255, 231, 131, 0.2)`)
- Icon: `search-outline` `18px`, `#CDC6B2`, `8px` gap to the input
- Input: `Poppins_400Regular` `14px`, white text, placeholder `#CDC6B2`
- Clear button (`close-circle-outline`) appears only while there is text

## Onboarding Components

The signup question flow (`app/onboarding/`) shares one template. All sizes are `screenWidth * ratio` on a 360 base.

### OnboardingBackdrop
Full-screen shell for every onboarding and auth page: photo background under a `rgba(0,0,0,0.78)` overlay, `GlassNavButton` back arrow top-left, centered WUZY logo (Bebas, ratio `0.133`), optional yellow title (Poppins Bold, ratio `0.055`), optional muted subtitle (`#AFA991`, Poppins Regular, ratio `0.039`). Children render centered below with a `0.083` gap. Optional props: `background` (defaults to `assets/images/onboarding-bg.jpg`; welcome and login pass their own photos), `showBack` (default true; welcome hides it). The welcome (`app/welcome.tsx`) and login (`app/login.tsx`) screens reuse this shell with custom children.

```tsx
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
<OnboardingBackdrop title="Enter your email?" subtitle="We'll send a code">...</OnboardingBackdrop>
```

### FormInput
The outlined onboarding text field: `0.825 x 0.125`, radius `0.028`, border `wuzyColors.yellow`, bg `rgba(179,175,160,0.1)`, centered Poppins Medium text, placeholder `#C0BDB2`. Accepts all TextInput props.

### PillButton
The `0.66 x 0.125` pill, radius `0.056`, Poppins Bold ratio `0.042`. Variants: `filled` (default, glass surface + white text, used for Next; the same `GlassSurface` treatment as `GlassNavButton`), `outline` (yellow border + yellow text), `solid` (solid yellow + black text, the selected state on the gender screen), `dark` (the filled glass with a stronger black scrim + white text, the welcome screen's Login).
- Route: `app/(tabs)/home/ticket-vault.tsx`
- Header: `ScreenHeader` with title `TICKETS`
- Carousel: Horizontal `FlatList` with `snapToInterval={cardWidth + cardGap}`, `decelerationRate="fast"`, and active card centered (`(screenWidth - cardWidth) / 2` padding)
