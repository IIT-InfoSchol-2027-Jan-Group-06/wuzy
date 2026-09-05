import { Image, Pressable, ScrollView, Text, View, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as SvgImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import { mockEvent } from '@/constants/event-data';

export default function EventDetailsScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [isLiked, setIsLiked] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const e = mockEvent;

  // Responsive sizing
  const heroHeight = Math.round(screenWidth * 0.95);
  const backButtonSize = Math.round((50 / 375) * screenWidth);
  const likeButtonSize = Math.round((58 / 375) * screenWidth);
  const likeIconSize = Math.round(likeButtonSize * 0.48);
  const avatarSize = Math.round(screenWidth * 0.1);
  const avatarBorderWidth = 2;
  const avatarOverlap = Math.round(screenWidth * 0.035);

  // Typography sizes
  const sectionTitleFontSize = Math.round(screenWidth * 0.041);
  const bodyFontSize = Math.round(screenWidth * 0.035);
  const detailFontSize = Math.round(screenWidth * 0.032);
  const buttonFontSize = Math.round(screenWidth * 0.04);

  // Action row: gift pill then Buy Ticket. Figma has them 60x50 and 208x50, 30 apart.
  const actionHeight = Math.round(screenWidth * 0.13);
  const giftWidth = Math.round(actionHeight * 1.2);
  const giftIconSize = Math.round(actionHeight * 0.6);
  const actionGap = Math.round(screenWidth * 0.075);

  const handleLikePress = () => {
    setIsLiked(!isLiked);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  const displayDescription = showMore ? e.description : `${e.description.slice(0, 180)}...`;

  return (
    <View className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section with Cover Image */}
          <View style={{ height: heroHeight, position: 'relative' }}>
            <Image
              source={e.image}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {/* Gradient overlay for text readability - ends with exact wuzy bg color */}
            <LinearGradient
              colors={['transparent', 'rgba(10,15,23,0.4)', 'rgba(10,15,23,0.8)', wuzyColors.bg]}
              locations={[0, 0.3, 0.7, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Like Button - absolutely positioned over cover image at specific coordinates */}
            <Pressable
              onPress={handleLikePress}
              className="rounded-full overflow-hidden active:scale-95"
              style={{
                position: 'absolute',
                left: Math.round((286 / 375) * screenWidth),
                top: Math.round((404 / 531) * heroHeight),
                width: likeButtonSize,
                height: likeButtonSize,
                zIndex: 10,
                elevation: 10,
              }}
            >
              <View className="absolute inset-0" style={{ backgroundColor: isLiked ? wuzyColors.yellow : 'rgba(61, 63, 55, 0.6)' }} />
              <View className="absolute inset-0 rounded-full border border-white/20" />
              <View className="flex-1 items-center justify-center relative z-10">
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={likeIconSize}
                  color={isLiked ? wuzyColors.bg : wuzyColors.white}
                  // Android pads icon fonts by default, which pushes the glyph off centre.
                  style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                />
              </View>
            </Pressable>

            {/* Title - absolutely positioned at bottom-left of hero, layered over cover image */}
            <Text
              className="text-wuzy-yellow"
              style={{
                position: 'absolute',
                bottom: 30,
                left: 32,
                right: 100,
                fontFamily: wuzyFonts.semibold,
                fontSize: 32,
                lineHeight: 36,
                zIndex: 10,
                elevation: 10,
              }}
            >
              {e.title}
            </Text>
          </View>

          {/* Main Content */}
          <View className="px-[32px] pt-[24px] gap-[24px]">
            {/* Description Section */}
            <View className="gap-[12px]">
              <Text
                style={{
                  fontFamily: wuzyFonts.body,
                  fontSize: bodyFontSize,
                  lineHeight: Math.round(bodyFontSize * 1.5),
                  color: wuzyColors.white,
                }}
              >
                {displayDescription}
              </Text>
              <Pressable onPress={handleShowMore} className="mt-[4px]">
                <Text
                  className="text-wuzy-yellow"
                  style={{
                    fontFamily: wuzyFonts.semibold,
                    fontSize: bodyFontSize,
                  }}
                >
                  {showMore ? 'Show less' : 'Show more'}
                </Text>
              </Pressable>
            </View>

            {/* Details Section - Two column layout */}
            <View className="flex-row justify-between items-start gap-[24px]" style={{ marginTop: 8 }}>
              {/* Left column: Avatars + Venue + Location */}
              <View className="flex-1 gap-[12px]">
                {/* Attendees avatar row */}
                <View className="flex-row items-center gap-[8px]">
                  {e.attendees.slice(0, 3).map((attendee, index) => (
                    <Pressable
                      key={attendee.id}
                      style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                        borderWidth: avatarBorderWidth,
                        borderColor: wuzyColors.bg,
                        marginLeft: index === 0 ? 0 : -avatarOverlap,
                        zIndex: 3 - index,
                      }}
                    >
                      <Image
                        source={attendee.avatar}
                        style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                  {e.attendees.length > 3 && (
                    <Pressable
                      style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                        borderWidth: avatarBorderWidth,
                        borderColor: wuzyColors.bg,
                        marginLeft: -avatarOverlap,
                        backgroundColor: 'rgba(255, 231, 131, 0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: wuzyFonts.semibold,
                          fontSize: Math.round(screenWidth * 0.032),
                          color: wuzyColors.yellow,
                        }}
                      >
                        +{e.attendees.length - 3}
                      </Text>
                    </Pressable>
                  )}
                </View>
                {/* Venue */}
                <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: detailFontSize, color: wuzyColors.yellow }}>
                  {e.venue}
                </Text>
                {/* Location */}
                <Text style={{ fontFamily: wuzyFonts.body, fontSize: Math.round(screenWidth * 0.026), color: '#D6C169' }}>
                  {e.location}
                </Text>
              </View>

              {/* Right column: Date + Time */}
              <View className="flex-1 items-end gap-[2px]">
                <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 32, color: wuzyColors.white }}>
                  {e.date}
                </Text>
                <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: 32, color: wuzyColors.white }}>
                  {e.time}
                </Text>
              </View>
            </View>

            {/* Map Section - local image, no maps API key needed */}
            <View className="gap-[12px]" style={{ marginTop: 8 }}>
              <Text
                className="text-wuzy-yellow"
                style={{
                  fontFamily: wuzyFonts.semibold,
                  fontSize: sectionTitleFontSize,
                }}
              >
                Location
              </Text>
              <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Image
                  source={e.mapImage}
                  style={{ width: '100%', height: Math.round(screenWidth * 0.6) }}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Gift + Buy Ticket */}
            <View className="flex-row items-center pt-[8px] pb-[20px]" style={{ gap: actionGap }}>
              <Pressable
                onPress={() => {}}
                accessibilityRole="button"
                accessibilityLabel="Gift a ticket"
                className="items-center justify-center rounded-full overflow-hidden active:opacity-80"
                style={{
                  width: giftWidth,
                  height: actionHeight,
                  backgroundColor: wuzyColors.yellowDim,
                }}
              >
                <SvgImage
                  source={require('@/assets/icons/gift.svg')}
                  style={{ width: giftIconSize, height: giftIconSize }}
                  contentFit="contain"
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  router.push('/ticket');
                }}
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: actionHeight }}
              >
                <View style={StyleSheet.absoluteFill} className="bg-wuzy-yellow" />
                <View className="flex-1 items-center justify-center relative z-10">
                  <Text
                    style={{
                      fontFamily: wuzyFonts.semibold,
                      fontSize: buttonFontSize,
                      color: wuzyColors.bg,
                    }}
                  >
                    Buy Ticket
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Top Bar: floats over the scrolling content, box-none so the strip still scrolls */}
        <View
          pointerEvents="box-none"
          className="absolute top-0 left-0 right-0 z-10 flex-row justify-between px-[32px] pt-[49px]">
          {/* Back button - circular glass */}
          <GlassNavButton icon="arrow-back" size={backButtonSize} onPress={handleBackPress} />
          <GlassNavButton icon="share-outline" size={backButtonSize} onPress={() => {}} />
        </View>
      </SafeAreaView>
    </View>
  );
}