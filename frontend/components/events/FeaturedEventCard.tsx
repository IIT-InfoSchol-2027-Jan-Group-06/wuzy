import { ImageBackground, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';
import { VisitButton } from './VisitButton';
import { StatusBadge } from './StatusBadge';
import { useResponsive } from '@/hooks/useResponsive';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export interface FeaturedEventCardProps {
  title: string;
  time: string;
  location: string;
  price: string;
  imageUri: ImageSourcePropType;
  tagLabel: string;
  onVisit?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function FeaturedEventCard({
  title,
  time,
  location,
  price,
  imageUri,
  tagLabel,
  onVisit,
  onFavorite,
  isFavorite = false,
}: FeaturedEventCardProps) {
  const { screenWidth, fontSize, spacing } = useResponsive();

  // Card dimensions (responsive ratios)
  const cardWidth = Math.round(screenWidth * 0.75);
  const cardHeight = Math.round(screenWidth * 1.05);
  const borderRadius = spacing('md');
  const horizontalPadding = spacing('sm');
  const verticalPadding = spacing('md');

  // Top bar sizing
  const favBtnSize = spacing('lg'); // matches GlassNavButton
  const favIconSize = Math.round(favBtnSize * 0.48);

  // Bottom content sizing
  const timeFontSize = fontSize('tiny');
  const titleFontSize = fontSize('title') * 0.52; // ~0.052 ratio
  const locationIconSize = fontSize('tag');
  const locationFontSize = fontSize('caption');

  const priceLabelFontSize = fontSize('tiny');
  const priceFontSize = fontSize('title') * 0.48; // ~0.048 ratio

  return (
    // Outer container: Pressable for full-card tap + clips rounded corners
    <Pressable
      onPress={onVisit}
      style={{
        width: cardWidth,
        height: cardHeight,
        borderRadius,
        overflow: 'hidden',
      }}
    >
      {/* Full-bleed background image */}
      <ImageBackground
        source={imageUri}
        style={{ width: '100%', height: '100%' }}
        imageStyle={{ resizeMode: 'cover' }}
      >
        {/* Absolute-fill layer for gradient + content */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Bottom gradient overlay for text readability */}
          <LinearGradient
            colors={['transparent', 'rgba(10,15,23,0.7)', 'rgba(10,15,23,0.95)', 'rgba(10,15,23,0.99)']}
            locations={[0, 0.2, 0.6, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%' }}
          />

          {/* Content container with top/bottom sections */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'space-between',
              paddingHorizontal: horizontalPadding,
              paddingVertical: verticalPadding,
            }}
          >
            {/* TOP BAR: status badge (left) + favorite button (right) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              {/* Status pill badge (e.g. "Selling Fast") - reusable component */}
              <StatusBadge label={tagLabel} />

              {/* Favorite button - same size as GlassNavButton */}
              <Pressable
                onPress={(e) => { e.stopPropagation(); onFavorite?.(); }}
                style={{
                  width: favBtnSize,
                  height: favBtnSize,
                  borderRadius: favBtnSize / 2,
                  backgroundColor: 'rgba(61, 63, 55, 0.6)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={favIconSize} color={wuzyColors.white} />
              </Pressable>
            </View>

            {/* BOTTOM CONTENT: event info + price/visit row */}
            <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: horizontalPadding, paddingBottom: verticalPadding }}>
              <View style={{ zIndex: 10 }}>
                {/* Time label (yellow, uppercase) */}
                <Text style={{ color: wuzyColors.yellow, fontSize: timeFontSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing('xs') / 2, fontFamily: wuzyFonts.semibold }}>{time}</Text>

                {/* Event title (large, bold) */}
                <Text style={{ color: wuzyColors.white, fontSize: titleFontSize, fontWeight: '800', lineHeight: titleFontSize * 1.15, marginBottom: spacing('xs'), fontFamily: wuzyFonts.bold }}>{title}</Text>

                {/* Location row with map pin icon */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing('sm') }}>
                  <Ionicons name="location-outline" size={locationIconSize} color={wuzyColors.bronze} style={{ marginRight: spacing('xs') / 3 }} />
                  <Text style={{ color: wuzyColors.bronze, fontSize: locationFontSize, fontWeight: '500', flex: 1, fontFamily: wuzyFonts.medium }}>{location}</Text>
                </View>

                {/* Footer: price (left) + visit button (right) */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.1)',
                    paddingTop: spacing('sm'),
                  }}
                >
                  {/* Price block */}
                  <View>
                    <Text style={{ color: wuzyColors.gray, fontSize: priceLabelFontSize, fontWeight: '500', fontFamily: wuzyFonts.medium }}>Starting from</Text>
                    <Text style={{ color: wuzyColors.yellow, fontSize: priceFontSize, fontWeight: 'bold', marginTop: spacing('xs') / 4, fontFamily: wuzyFonts.bold }}>{price}</Text>
                  </View>

                  {/* Visit action button (reusable component) */}
                  <VisitButton onPress={(e) => { e.stopPropagation(); onVisit?.(); }} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}