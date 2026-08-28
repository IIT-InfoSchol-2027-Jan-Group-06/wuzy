import { ImageBackground, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';
import { VisitButton } from './VisitButton';
import { StatusBadge } from './StatusBadge';

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
  const { width: screenWidth } = useWindowDimensions();

  // Card dimensions (responsive ratios)
  const cardWidth = Math.round(screenWidth * 0.75);
  const cardHeight = Math.round(screenWidth * 1.05);
  const borderRadius = Math.round(screenWidth * 0.06);
  const horizontalPadding = Math.round(screenWidth * 0.035);
  const verticalPadding = Math.round(screenWidth * 0.04);

  // Top bar sizing
  const favBtnSize = Math.round((50 / 375) * screenWidth); // matches GlassNavButton
  const favIconSize = Math.round(favBtnSize * 0.48);

  // Bottom content sizing
  const timeFontSize = Math.round(screenWidth * 0.022);
  const titleFontSize = Math.round(screenWidth * 0.058);
  const locationIconSize = Math.round(screenWidth * 0.032);
  const locationFontSize = Math.round(screenWidth * 0.026);

  const priceLabelFontSize = Math.round(screenWidth * 0.02);
  const priceFontSize = Math.round(screenWidth * 0.048);
  const visitBtnFontSize = Math.round(screenWidth * 0.032);

  return (
    // Outer container: clips rounded corners and adds right gap for horizontal scroll
    <View
      style={{
        width: cardWidth,
        height: cardHeight,
        borderRadius,
        marginRight: Math.round(screenWidth * 0.03),
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
                onPress={onFavorite}
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
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={favIconSize} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* BOTTOM CONTENT: event info + price/visit row */}
            <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: horizontalPadding, paddingBottom: verticalPadding }}>
              <View style={{ zIndex: 10 }}>
                {/* Time label (yellow, uppercase) */}
                <Text style={{ color: '#FFE285', fontSize: timeFontSize, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Math.round(screenWidth * 0.005) }}>{time}</Text>

                {/* Event title (large, bold) */}
                <Text style={{ color: '#FFFFFF', fontSize: titleFontSize, fontWeight: '800', lineHeight: titleFontSize * 1.15, marginBottom: Math.round(screenWidth * 0.015) }}>{title}</Text>

                {/* Location row with map pin icon */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Math.round(screenWidth * 0.03) }}>
                  <Ionicons name="location-outline" size={locationIconSize} color="#D0CFA6" style={{ marginRight: Math.round(screenWidth * 0.008) }} />
                  <Text style={{ color: '#D0CFA6', fontSize: locationFontSize, fontWeight: '500', flex: 1 }}>{location}</Text>
                </View>

                {/* Footer: price (left) + visit button (right) */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.1)',
                    paddingTop: Math.round(screenWidth * 0.02),
                  }}
                >
                  {/* Price block */}
                  <View>
                    <Text style={{ color: '#888888', fontSize: priceLabelFontSize, fontWeight: '500' }}>Starting from</Text>
                    <Text style={{ color: '#FFE285', fontSize: priceFontSize, fontWeight: 'bold', marginTop: Math.round(screenWidth * 0.003) }}>{price}</Text>
                  </View>

                  {/* Visit action button (reusable component) */}
                  <VisitButton onPress={onVisit} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}