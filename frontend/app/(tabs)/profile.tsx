import { Image, ImageBackground, Pressable, ScrollView, Text, View, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

const TAGS = ['Music', 'Reading', 'Movie', 'Tech', 'Reading', 'Movie', 'Tech'];
const TIMELINE_IMAGES = [
  require('@/assets/images/post1.png'),
  require('@/assets/images/post2.png'),
  require('@/assets/images/post3.png'),
  require('@/assets/images/post4.png'),
  require('@/assets/images/event1.png'),
  require('@/assets/images/event2.png'),
  require('@/assets/images/event3.png'),
  require('@/assets/images/event4.png'),
  require('@/assets/images/event5.png'),
];

export default function ProfileScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const gridItemSize = (screenWidth - 4) / 3;
  const btnWidth = Math.round(screenWidth * 0.40);
  const btnHeight = Math.round(screenWidth * 0.092);
  const fontSize = Math.round(screenWidth * 0.028);

  const GlassButton = ({ label }: { label: string }) => (
    <Pressable className="rounded-full overflow-hidden" style={{ width: btnWidth, height: btnHeight }}>
      <BlurView
        intensity={80}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { borderRadius: btnHeight / 2, backgroundColor: 'rgba(244, 196, 0, 0.1)' }]} />
      <View className="absolute inset-0 rounded-full border border-white/20" />
      <View className="flex-1 items-center justify-center shadow-lg shadow-black/40">
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize, color: '#FFFFFF' }}>{label}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>

          {/* 1. Hero Header Section */}
          <View style={{ height: 700, position: 'relative' }}>
            <ImageBackground
              source={require('@/assets/images/event1.png')}
              style={{ flex: 1, width: '100%' }}
              imageStyle={{ resizeMode: 'cover' }}>
              {/* Gradient overlay */}
              <LinearGradient
                colors={['transparent', '#0A0F17', '#0A0F17']}
                locations={[0, 0.6, 1]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill} />

              {/* Top Right Action - Link Button */}
              <View className="absolute top-[50px] right-[20px]">
                <Pressable className="items-center justify-center rounded-full"
                  style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Ionicons name="link" size={22} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Text Overlay Container - Bottom Left */}
              <View className="absolute bottom-[30px] left-[24px] right-[24px]">
                {/* Title + Awards Badge */}
                <View className="flex-row items-start justify-between mb-[8px]">
<View>
                    <Text
                      style={{
                        fontFamily: wuzyFonts.display,
                        fontSize: Math.round(screenWidth * 0.12),
                        lineHeight: Math.round(screenWidth * 0.09),
                        color: '#FDF3C0',
                      }}>
                      Ludwig
                    </Text>
                    <Text
                      style={{
                        fontFamily: wuzyFonts.display,
                        fontSize: Math.round(screenWidth * 0.11),
                        lineHeight: Math.round(screenWidth * 0.11),
                        color: '#FDF3C0',
                      }}>
                      Bennet
                    </Text>
                  </View>
                  {/* Awards Badge */}
                  <View className="items-center">
                    <View className="flex-row items-center gap-[4px]">
                      {[1, 2, 3, 4].map((i) => (
                        <Ionicons key={i} name="medal" size={Math.round(screenWidth * 0.035)} color="#FDF3C0" />
                      ))}
                    </View>
                    <Text className="text-[10px] text-gray-400 mt-[2px]">awards</Text>
                  </View>
                </View>

                {/* Bio */}
                <Text
                  style={{
                    fontFamily: wuzyFonts.body,
                    fontSize: Math.round(screenWidth * 0.025),
                    lineHeight: Math.round(screenWidth * 0.03),
                    color: '#FFFFFF',
                  }}>
                  Software engineer building high-performance systems with Go and OpenGL.
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* 2. Tags Section */}
          <View className="px-[10px] mt-[10px]">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {TAGS.map((tag) => (
                <Pressable
                  key={tag}
                  className="items-center justify-center px-[26px] py-[8px] rounded-full"
                  style={{
                    backgroundColor: '#171E28',
                    borderWidth: 1,
                    borderColor: '#2B3545',
                  }}>
                  <Text
                    style={{
                      fontFamily: wuzyFonts.semibold,
                      fontSize: Math.round(screenWidth * 0.022),
                      color: '#FFFFFF',
                    }}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* 3. Action Buttons - Glassmorphism */}
          <View className="flex-row items-center justify-center px-[24px] my-[20px]" style={{ gap: 12 }}>
            <GlassButton label="Edit profile" />
            <GlassButton label="Connections" />
          </View>

          {/* 4. Timeline Section */}
          <View className="px-0">
            <Text
              className="text-center mb-[16px] px-[24px]"
              style={{
                fontFamily: wuzyFonts.bold,
                fontSize: Math.round(screenWidth * 0.045),
                color: '#FDF3C0',
              }}>
              Timeline
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 2,
                marginHorizontal: -2,
              }}>
              {TIMELINE_IMAGES.map((img, index) => (
                <Image
                  key={index}
                  source={img}
                  style={{
                    width: gridItemSize,
                    height: gridItemSize,
                    aspectRatio: 1,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}