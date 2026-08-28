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

---

## GlassNavButton Component

### When to Use
Use **`GlassNavButton`** for any circular glassmorphism action button across the app. Do not create custom circular buttons with similar styling.

### Import
```tsx
import { GlassNavButton } from '@/components/GlassNavButton';
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `ReactNode \| keyof Ionicons.glyphMap` | Yes | Icon name (e.g., `"add"`, `"arrow-back"`) or custom ReactNode |
| `onPress` | `() => void` | Yes | Press handler (e.g., `router.push('/path')` or `router.back()`) |
| `className` | `string` | No | Tailwind classes for positioning (e.g., `"absolute bottom-20 right-6 z-50"`) |
| `size` | `number` | No | Diameter override in px. Omit for the default responsive size; when overriding, derive from screen width (e.g. `(42 / 375) * screenWidth`), never a hardcoded constant |

### Visual Specs (Fixed - Do Not Override)
- **Size**: Responsive `50/375 * screenWidth` (matches Navbar item size)
- **Icon Size**: `48%` of button diameter
- **Blur**: `intensity={40}`, `tint="dark"`
- **Base Layer**: `rgba(84, 82, 56, 0.35)` (dark olive)
- **Yellow Tint**: `rgba(244, 196, 0, 0.1)` (matches Navbar `#F4C400/10`)
- **Gradients**: Diagonal white→transparent→dark + top highlight
- **Borders**: Outer `white/30`, top `white/50`, bottom `black/30`
- **Press Feedback**: `active:scale-95`

### Usage Examples

**Home FAB (bottom-right, above navbar):**
```tsx
<GlassNavButton
  icon="add"
  onPress={() => router.push('/create')}
  className="absolute bottom-20 right-6 z-50"
/>
```

**Back Button (top-left):**
```tsx
<GlassNavButton
  icon="arrow-back"
  onPress={() => router.back()}
  className="absolute top-6 left-6 z-50"
/>
```

**Custom Icon:**
```tsx
<GlassNavButton
  icon={<CustomSvgIcon />}
  onPress={handleAction}
  className="absolute bottom-20 right-6 z-50"
/>
```

### Placement Guidelines
- **FAB positions**: `bottom-20 right-6` (clears navbar by ~20pt)
- **Back buttons**: `top-6 left-6` (safe area handled by screen)
- **Z-index**: Use `z-50` to sit above scroll content
- **Never** hardcode pixel sizes - component handles responsive scaling

---

## CategoryFilter Component

### When to Use
Use **`CategoryFilter`** for any horizontal pill-based category selector with built-in filtering. Do not create custom filter chips or horizontal scrollable category lists.

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

<CategoryFilter
  options={categories}
  selectedId={selectedCategory}
  onSelect={setSelectedCategory}
  containerStyle={{ marginTop: 16, marginHorizontal: -16 }}
/>
```

**With Built-in Filtering:**
```tsx
<CategoryFilter<Event>
  options={categories}
  selectedId={selectedCategory}
  onSelect={setSelectedCategory}
  data={events}
  categoryKey="category"
  renderItem={(event) => (
    <PostCard key={event.id} post={{...}} />
  )}
/>
```

### Placement Guidelines
- **Below section headers**: `marginTop: 16` (16pt from previous content)
- **Full-width alignment**: Use `marginHorizontal: -16` to offset parent padding
- **Content gap**: Add `mt-6` (24pt) between filter and filtered content
- **Never** hardcode pill widths - they auto-size to text content

---

## TagSection Component

### When to Use
Use **`TagSection`** for any horizontal scrollable tag/pill list (user interests, skills, categories, filters). Do not create custom horizontal tag lists with ScrollView.

### Import
```tsx
import { TagSection } from '@/components/TagSection';
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tags` | `string[]` | Yes | Array of tag labels to display |
| `onTagPress` | `(tag: string) => void` | No | Press handler for tag interaction |
| `containerStyle` | `ViewStyle` | No | Custom styling for outer container |
| `contentContainerStyle` | `ViewStyle` | No | Custom styling for ScrollView content |
| `tagStyle` | `ViewStyle` | No | Custom styling for individual tag pill |
| `textStyle` | `TextStyle` | No | Custom styling for tag text |
| `renderTag` | `(tag: string, index: number) => ReactNode` | No | Custom render function for tag content |

### Visual Specs (Fixed - Do Not Override)
- **Container**: `paddingHorizontal: 10`, `marginTop: 4`
- **ScrollView**: Horizontal, hidden scrollbar, `gap: 8`, `paddingBottom: 4`
- **Pill**: `rounded-full`, `px-[16px] py-[8px]`
- **Background**: `bg-[#171E28]` (surface)
- **Border**: `border-[#2B3545]` (surfaceBorder), width 1
- **Text**: `font-semibold`, responsive size `screenWidth * 0.022`, `text-white`
- **Font Family**: `Poppins_600SemiBold` (matches `tag` token)

### Usage Examples

**Simple Tags:**
```tsx
<TagSection tags={['Music', 'Reading', 'Movie', 'Tech']} />
```

**With Press Handler:**
```tsx
<TagSection
  tags={user.tags}
  onTagPress={(tag) => console.log('Selected:', tag)}
/>
```

**Custom Styling:**
```tsx
<TagSection
  tags={tags}
  containerStyle={{ marginTop: 24, marginHorizontal: 24 }}
  contentContainerStyle={{ paddingHorizontal: 16 }}
  tagStyle={{ backgroundColor: '#2A2B20', borderColor: '#FFE285' }}
  textStyle={{ color: '#FFE285' }}
/>
```

**Custom Render (e.g., with icons):**
```tsx
<TagSection
  tags={tags}
  renderTag={(tag) => (
    <View className="flex-row items-center gap-2">
      <Icon name={tag} size={14} color="#FFE285" />
      <Text style={{ fontFamily: wuzyFonts.semibold, color: '#FFFFFF' }}>
        {tag}
      </Text>
    </View>
  )}
/>
```

### Placement Guidelines
- **Below hero/profile header**: `marginTop: 4` (4pt from content above)
- **Horizontal padding**: Default `paddingHorizontal: 10` (override via `containerStyle`)
- **Tag gap**: `8pt` between pills (override via `contentContainerStyle`)
- **Responsive text**: Font size auto-scales with `screenWidth * 0.022`
- **Never** hardcode pill widths - they auto-size to text content via `px-[16px]`

---

## Notification Screen

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
