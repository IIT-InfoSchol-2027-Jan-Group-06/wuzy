import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { TagSection } from '@/components/TagSection';
import { mockUserProfile } from '@/constants/profile-data';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

const GRID_GAP = 2;

export default function ProfileScreen() {
  const router = useRouter();
  const { screenWidth, fontSize } = useResponsive();
  const u = mockUserProfile;

  const heroHeight = Math.round(screenWidth * 1.3);
  const gridItemSize = (screenWidth - GRID_GAP * 2) / 3;
  const [firstName, ...rest] = u.name.split(' ');
  const lastName = rest.join(' ');

  const pillButton = (label: string, onPress?: () => void) => (
    <GlassNavButton
      onPress={onPress ?? (() => {})}
      accessibilityLabel={label}
      style={{ width: Math.round(screenWidth * 0.36), height: 44 }}>
      <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('small'), color: wuzyColors.white }}>{label}</Text>
    </GlassNavButton>
  );

  return (
    <Screen scroll padded={false} style={{ paddingTop: 0 }}>
      <ImageBackground source={u.backgroundImage} style={{ height: heroHeight }} imageStyle={{ resizeMode: 'cover' }}>
        <LinearGradient
          colors={['transparent', wuzyColors.bg, wuzyColors.bg]}
          locations={[0, 0.6, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View className="absolute flex-row items-center" style={{ top: wuzyLayout.top, right: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
          <GlassNavButton icon="people" accessibilityLabel="Connect" onPress={() => router.push('/connect')} />
          <GlassNavButton icon="settings-outline" accessibilityLabel="Settings" onPress={() => router.push('/settings')} />
        </View>

        <View className="absolute" style={{ bottom: wuzyLayout.gap, left: wuzyLayout.side, right: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
          <View className="flex-row items-start justify-between">
            <View>
              <Text style={{ fontFamily: wuzyFonts.display, fontSize: fontSize('display'), lineHeight: Math.round(fontSize('display') * 1.05), color: wuzyColors.yellowSoft }}>
                {firstName}
              </Text>
              {lastName ? (
                <Text style={{ fontFamily: wuzyFonts.display, fontSize: fontSize('display'), lineHeight: Math.round(fontSize('display') * 1.05), color: wuzyColors.yellowSoft }}>
                  {lastName}
                </Text>
              ) : null}
            </View>
            <View className="items-center" style={{ gap: 2 }}>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                {Array.from({ length: u.awardsCount }, (_, i) => (
                  <Ionicons key={i} name="medal" size={fontSize('body')} color={wuzyColors.yellowSoft} />
                ))}
              </View>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('caption'), color: wuzyColors.gray }}>awards</Text>
            </View>
          </View>
          <Text style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('body'), lineHeight: Math.round(fontSize('body') * 1.5), color: wuzyColors.white }}>
            {u.bio}
          </Text>
        </View>
      </ImageBackground>

      <View style={{ paddingHorizontal: wuzyLayout.side, gap: wuzyLayout.gap, paddingTop: wuzyLayout.gap }}>
        <TagSection tags={u.tags} />

        <View className="flex-row items-center justify-center" style={{ gap: wuzyLayout.itemGap }}>
          {pillButton('Edit profile')}
          {pillButton('Connections', () => router.push('/connections'))}
        </View>

        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('section'), color: wuzyColors.yellow }}>Timeline</Text>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: GRID_GAP, marginTop: wuzyLayout.itemGap }}>
        {u.photos.map((img, index) => (
          <Image key={index} source={img} style={{ width: gridItemSize, height: gridItemSize }} resizeMode="cover" />
        ))}
      </View>
    </Screen>
  );
}
