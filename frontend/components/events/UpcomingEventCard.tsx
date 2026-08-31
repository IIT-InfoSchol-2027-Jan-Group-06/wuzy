import { Pressable, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

export interface UpcomingEventCardProps {
  title: string;
  hostName: string;
  hostAvatar: ImageSourcePropType;
  dateDay: string;
  dateMonth: string;
  imageUri: ImageSourcePropType;
  onPress?: () => void;
}

export function UpcomingEventCard({
  title,
  hostName,
  hostAvatar,
  dateDay,
  dateMonth,
  imageUri,
  onPress,
}: UpcomingEventCardProps) {
  const { screenWidth, fontSize, spacing } = useResponsive();

  // Card dimensions (responsive ratios from design tokens)
  const cardHeight = spacing('lg') * 4.5; // ~155px on 375px
  const borderRadius = spacing('md'); // ~16px
  const horizontalPadding = spacing('sm'); // ~8px
  const verticalPadding = spacing('md'); // ~8px
  const cardMarginBottom = spacing('sm'); // ~8px
  const contentGap = spacing('md'); // ~8px
  const titleMarginBottom = spacing('xs'); // ~4px
  const avatarGap = spacing('xs') * 0.65; // ~2.6px

  // Content sizing
  const titleFontSize = fontSize('sectionTitle'); // ~18px
  const avatarSize = spacing('md') * 1.5; // ~40px on 375px
  const hostFontSize = fontSize('tag'); // ~12px

  // Date badge sizing (white square) - INCREASE SIZE HERE
  const dateBadgeSize = spacing('xl') * 1.85; // ~74px on 375px (was 1.6 -> ~64px)
  const dateBadgeRadius = spacing('sm') * 2.1; // ~21px rounded corners (was 1.8 -> ~18px)
  const dateBadgePadding = spacing('xs') * 0.4; // ~1.5px
  const dateDayFontSize = fontSize('title') * 0.7; // ~26px (was 0.6 -> ~22px)
  const dateMonthFontSize = fontSize('tiny'); // ~8px
  const dateMonthMarginTop = spacing('xs') * 0.05; // ~0.2px

  // Badge right offset: positive = more right, negative = more left
  const badgeRightOffset = spacing('sm') * 0.5; // ~4px extra right push

  return (
    // Outer container: Pressable with active feedback
    <Pressable
      onPress={onPress}
      style={{
        width: '100%',
        height: cardHeight,
        borderRadius,
        marginBottom: cardMarginBottom,
        backgroundColor: '#12161F',
        overflow: 'hidden',
      }}
    >
      {/* Background image - absolute fill with cover */}
      <ExpoImage
        source={imageUri}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        contentFit="cover"
        transition={200}
      />

      {/* Side gradient overlay for text readability - dark on sides, transparent in center */}
      <LinearGradient
        colors={['rgba(10,15,23,0.9)', 'transparent', 'rgba(10,15,23,0.9)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Content layer (z-index above gradient) - text content */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', paddingHorizontal: horizontalPadding, paddingVertical: verticalPadding, flexDirection: 'row', alignItems: 'flex-end', zIndex: 10 }}>
        {/* LEFT SECTION: Event metadata */}
        <View style={{ flex: 1, justifyContent: 'flex-end', marginRight: contentGap }}>
          {/* Title */}
          <Text style={{ color: '#FFFFFF', fontSize: titleFontSize, fontWeight: 'bold', lineHeight: titleFontSize * 1.2, marginBottom: titleMarginBottom }}>{title}</Text>

          {/* Host profile row */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Avatar with yellow border */}
            <ExpoImage
              source={hostAvatar}
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                marginRight: avatarGap,
                borderWidth: 1.5,
                borderColor: '#FFE285',
              }}
              contentFit="cover"
            />
            {/* Host name */}
            <Text style={{ color: '#FFFFFF', fontSize: hostFontSize, fontWeight: '600' }}>{hostName}</Text>
          </View>
        </View>
      </View>

      {/* RIGHT SECTION: Date badge (white square) - vertically centered on card, right edge with gap */}
      {/* badgeRightGap: base padding (horizontalPadding) + extra gap from right edge */}
      <View style={{ position: 'absolute', right: horizontalPadding + 5, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            width: dateBadgeSize,
            height: dateBadgeSize,
            borderRadius: dateBadgeRadius,
            padding: dateBadgePadding,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* Day number */}
          <Text style={{ color: '#030B45', fontSize: dateDayFontSize, fontWeight: '900', lineHeight: dateDayFontSize, letterSpacing: -0.5 }}>{dateDay}</Text>
          {/* Month label */}
          <Text style={{ color: '#030B45', fontSize: dateMonthFontSize, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: dateMonthMarginTop }}>{dateMonth}</Text>
        </View>
      </View>
    </Pressable>
  );
}
