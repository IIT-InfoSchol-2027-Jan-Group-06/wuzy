import { Image, ImageBackground, Pressable, ScrollView, Text, View, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { wuzyFonts } from '@/constants/wuzy-theme';
import { mockUserProfile, type UserProfile } from '@/constants/profile-data';
import { TagSection } from '@/components/TagSection';
import { GlassNavButton } from '@/components/GlassNavButton';

type ProfileScreenProps = {
  user?: UserProfile | null;
};

export default function ProfileScreen({ user }: ProfileScreenProps) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const gridItemSize = (screenWidth - 4) / 3;
  const btnWidth = Math.round(screenWidth * 0.32);
  const btnHeight = Math.round(screenWidth * 0.092);
  const fontSize = Math.round(screenWidth * 0.022);

  const u = user ?? mockUserProfile;

  const GlassButton = ({ label, onPress }: { label: string; onPress?: () => void }) => (
    <Pressable className="rounded-full overflow-hidden" style={{ width: btnWidth, height: btnHeight }} onPress={onPress}>
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
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>

          {/* 1. Hero Header Section */}
          <View style={{ height: 600, position: 'relative' }}>
            <ImageBackground
              source={u.backgroundImage}
              style={{ flex: 1, width: '100%' }}
              imageStyle={{ resizeMode: 'cover' }}>
              {/* Gradient overlay - angle -45deg */}
              <LinearGradient
                colors={['transparent', '#0A0F17', '#0A0F17']}
                locations={[0, 0.6, 1]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill} />

              {/* Top Right Action - Connect & Settings Buttons */}
              <View className="absolute top-[50px] right-[20px] flex-row items-center gap-2">
                <Pressable
                  onPress={() => router.push('/connect')}
                  className="items-center justify-center rounded-full"
                  style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Ionicons name="people" size={22} color="#FFFFFF" />
                </Pressable>
                <GlassNavButton
                  icon="settings"
                  onPress={() => router.push('/settings')}
                  className=""
                />
              </View>

              {/* Text Overlay Container - Bottom Left */}
              <View className="absolute bottom-[30px] left-[24px] right-[24px]">
                {/* Title + Awards Badge */}
                <View className="flex-row items-start justify-between mb-[8px]">
                  <View>
                    <Text
                      style={{
                        fontFamily: wuzyFonts.display,
                        fontSize: Math.round(screenWidth * 0.1),
                        lineHeight: Math.round(screenWidth * 0.11),
                        color: '#FDF3C0',
                      }}>
                      {u.name.split(' ')[0] || u.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: wuzyFonts.display,
                        fontSize: Math.round(screenWidth * 0.1),
                        lineHeight: Math.round(screenWidth * 0.11),
                        color: '#FDF3C0',
                      }}>
                      {u.name.split(' ').slice(1).join(' ') || ''}
                    </Text>
                  </View>
                  {/* Awards Badge */}
                  <View className="items-center">
                    <View className="flex-row items-center gap-[4px]">
                      {Array.from({ length: u.awardsCount || 4 }, (_, i) => (
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
                    fontSize: Math.round(screenWidth * 0.022),
                    lineHeight: Math.round(screenWidth * 0.05),
                    color: '#FFFFFF',
                  }}>
                  {u.bio}
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* 2. Tags Section */}
          <TagSection tags={u.tags} />

          {/* 3. Action Buttons - Glassmorphism */}
          <View className="flex-row items-center justify-center px-[24px] my-[20px]" style={{ gap: 12 }}>
            <GlassButton label="Edit profile" />
            <GlassButton label="Connections" onPress={() => router.push('/home/connections')} />
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
              {u.photos.map((img, index) => (
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