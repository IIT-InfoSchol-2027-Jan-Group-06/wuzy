import { useState, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { TicketCard } from '@/components/TicketCard';
import { tickets, type Ticket } from '@/constants/ticket-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export default function TicketVaultScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const isWebDesktop = Platform.OS === 'web' && windowWidth > 480;
  const screenWidth = isWebDesktop ? 412 : windowWidth;
  const screenHeight = isWebDesktop ? Math.min(windowHeight * 0.94, 880) : windowHeight;

  const cardWidth = Math.round(screenWidth * 0.78);
  const cardGap = 18;
  const sidePadding = (screenWidth - cardWidth) / 2;
  const backButtonSize = Math.round((42 / 375) * screenWidth);

  const activeTicket = tickets[activeIndex] ?? tickets[0];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const itemTotalWidth = cardWidth + cardGap;
    const index = Math.round(offsetX / itemTotalWidth);
    if (index >= 0 && index < tickets.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const itemTotalWidth = cardWidth + cardGap;
    const index = Math.round(offsetX / itemTotalWidth);
    const clampedIndex = Math.max(0, Math.min(index, tickets.length - 1));
    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  };

  const desktopFrameStyle = isWebDesktop
    ? {
        borderRadius: 48,
        borderWidth: 3,
        borderColor: '#1F242D',
        ...(Platform.OS === 'web'
          ? ({
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 231, 131, 0.04)',
            } as any)
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.9,
              shadowRadius: 30,
              elevation: 25,
            }),
      }
    : {};

  // Web renders CSS backdrop-filter (BlurView's web blur is unreliable here);
  // native uses BlurView. Layer order blurs the image behind it.
  const backgroundBlur = Platform.OS === 'web'
    ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', pointerEvents: 'none' } as any,
          ]}
        />
      )
    : (
        <BlurView
          intensity={85}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFillObject}
        />
      );

  const screenContent = (
    <View
      style={[
        {
          width: screenWidth,
          height: isWebDesktop ? screenHeight : '100%',
          backgroundColor: '#0A0D12',
          overflow: 'hidden',
          position: 'relative',
        },
        desktopFrameStyle,
      ]}
    >
      {/* Dynamic Full-Screen Background Image matching active ticket */}
      <Image
        key={activeTicket.id}
        source={activeTicket.image}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={300}
      />

      {/* Heavily Blurred Full-Screen Layer */}
      {backgroundBlur}


      {/* Darkened Semi-Transparent Overlay Layer */}
      <LinearGradient
        colors={['rgba(8, 12, 18, 0.72)', 'rgba(5, 8, 14, 0.82)', 'rgba(3, 5, 8, 0.92)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Subtle Warm Accent Glow in center-top */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: screenHeight * 0.04,
          left: (screenWidth - 280) / 2,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: 'rgba(255, 231, 131, 0.04)',
        }}
      />

      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        {/* Top Header: Gold/Yellow Bold Uppercase Header with Back Button on Left */}
        <View className="flex-row items-center px-[24px] pt-[20px] pb-[16px]">
          {/* Circular Glassmorphism Back Button */}
          <GlassNavButton
            icon="arrow-back"
            size={backButtonSize}
            onPress={() => router.back()}
          />

          {/* Centered Gold/Yellow Bold Uppercase Header */}
          <Text
            className="flex-1 text-center select-none font-bold uppercase"
            style={{
              fontFamily: 'Montserrat_700Bold',
              fontSize: Math.round(screenWidth * 0.056),
              letterSpacing: 4,
              color: wuzyColors.yellow,
            }}
          >
            TICKETS
          </Text>

          {/* Symmetrical Right Spacer for Perfect Centering */}
          <View style={{ width: backButtonSize }} />
        </View>

        {/* Central Element: Horizontal Carousel with Centered Active Card */}
        <View className="flex-1 justify-center py-[6px]">
          <FlatList
            ref={flatListRef}
            data={tickets}
            keyExtractor={(item: Ticket) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + cardGap}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: sidePadding,
              alignItems: 'center',
            }}
            ItemSeparatorComponent={() => <View style={{ width: cardGap }} />}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: cardWidth + cardGap,
              offset: (cardWidth + cardGap) * index,
              index,
            })}
            renderItem={({ item }) => (
              <TicketCard ticket={item} width={cardWidth} />
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  );

  if (isWebDesktop) {
    return (
      <View
        style={{
          minHeight: '100vh' as any,
          backgroundColor: '#05070A',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 24,
        }}
      >
        <Text
          style={{
            fontFamily: wuzyFonts.medium,
            fontSize: 14,
            letterSpacing: 2,
            color: '#3F4857',
            marginBottom: 16,
            textTransform: 'lowercase',
          }}
        >
          ticket_vault
        </Text>
        {screenContent}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#05070A' }}>
      {screenContent}
    </View>
  );
}
