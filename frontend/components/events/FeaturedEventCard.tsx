import { ImageBackground, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { Chip } from '@/components/Chip';
import { GlassNavButton } from '@/components/GlassNavButton';
import type { FeaturedEvent } from '@/constants/event-data';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

/** Tall poster card for the Today row: full-bleed image, tag and heart on top, details and price at the bottom. */
export function FeaturedEventCard({ event, onVisit }: { event: FeaturedEvent; onVisit?: () => void }) {
  const { screenWidth, fontSize } = useResponsive();
  const [favorite, setFavorite] = useState(false);

  const cardWidth = Math.round(screenWidth * 0.75);
  const cardHeight = Math.round(screenWidth * 1.05);

  return (
    <Pressable onPress={onVisit} style={{ width: cardWidth, height: cardHeight, borderRadius: 24, overflow: 'hidden' }}>
      <ImageBackground source={event.imageUri} style={{ flex: 1 }} imageStyle={{ resizeMode: 'cover' }}>
        <LinearGradient
          colors={['transparent', 'rgba(10,15,23,0.7)', 'rgba(10,15,23,0.95)', 'rgba(10,15,23,0.99)']}
          locations={[0, 0.2, 0.6, 1]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%' }}
        />

        <View className="flex-1 justify-between" style={{ padding: 16 }}>
          <View className="flex-row items-center justify-between">
            <Chip label={event.tagLabel} />
            <GlassNavButton
              icon={favorite ? 'heart' : 'heart-outline'}
              accessibilityLabel="Favorite"
              onPress={() => setFavorite((f) => !f)}
            />
          </View>

          <View style={{ gap: 4 }}>
            <Text
              className="uppercase"
              style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('caption'), color: wuzyColors.yellow, letterSpacing: 0.5 }}>
              {event.time}
            </Text>
            <Text
              numberOfLines={2}
              style={{ fontFamily: wuzyFonts.bold, fontSize: fontSize('section'), lineHeight: Math.round(fontSize('section') * 1.2), color: wuzyColors.white }}>
              {event.title}
            </Text>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="location-outline" size={fontSize('small')} color={wuzyColors.yellowSoft} />
              <Text
                numberOfLines={1}
                className="flex-1"
                style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('small'), color: wuzyColors.yellowSoft }}>
                {event.location}
              </Text>
            </View>

            <View
              className="flex-row items-end justify-between"
              style={{ borderTopWidth: 1, borderTopColor: wuzyColors.glassBorder, paddingTop: wuzyLayout.itemGap, marginTop: 8 }}>
              <View>
                <Text style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('caption'), color: wuzyColors.gray }}>Starting from</Text>
                <Text style={{ fontFamily: wuzyFonts.bold, fontSize: fontSize('section'), color: wuzyColors.yellow }}>{event.price}</Text>
              </View>
              <Chip label="Visit" selected onPress={onVisit} />
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
