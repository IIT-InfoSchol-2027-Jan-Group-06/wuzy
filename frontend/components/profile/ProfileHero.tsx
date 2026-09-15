import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/** Profile hero: full-width background photo under a fade to bg, with the Bebas name, awards, and bio at its foot. `actions` render at the top right (connect/settings on the owner's profile). */
export function ProfileHero({
  background,
  name,
  awardsCount,
  awards,
  bio,
  height,
  actions,
}: {
  background: ImageSourcePropType;
  name: string;
  awardsCount: number;
  awards?: { name?: string; image: ImageSourcePropType }[];
  bio?: string | null;
  height: number;
  actions?: ReactNode;
}) {
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');

  const hasStickers = awards && awards.length > 0;

  return (
    <ImageBackground source={background} style={{ height }} imageStyle={{ resizeMode: 'cover' }}>
      <LinearGradient
        colors={['transparent', wuzyColors.bg, wuzyColors.bg]}
        locations={[0, 0.6, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {actions && (
        <View className="absolute flex-row items-center" style={{ top: wuzyLayout.top, right: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
          {actions}
        </View>
      )}

      <View className="absolute" style={{ bottom: wuzyLayout.gap, left: wuzyLayout.side, right: wuzyLayout.side, gap: wuzyLayout.itemGap }}>
        <View className="flex-row items-start justify-between">
          <View>
            {firstName && (
              <Text style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.hero, lineHeight: Math.round(wuzyType.hero * 1.1), color: wuzyColors.yellowSoft }}>
                {firstName}
              </Text>
            )}
            {lastName && (
              <Text style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.hero, lineHeight: Math.round(wuzyType.hero * 1.1), color: wuzyColors.yellowSoft }}>
                {lastName}
              </Text>
            )}
          </View>
          {hasStickers ? (
            <View className="items-center" style={{ gap: 2 }}>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                {awards.map((award) => (
                  <Image
                    key={award.name ?? award.image}
                    source={award.image}
                    style={{ width: 32, height: 32, resizeMode: 'contain' }}
                  />
                ))}
              </View>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.caption, color: wuzyColors.yellowSoft }}>awards</Text>
            </View>
          ) : (
            <View className="items-center" style={{ gap: 2 }}>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                {Array.from({ length: awardsCount }, (_, i) => (
                  <Ionicons key={i} name="medal" size={wuzyType.body} color={wuzyColors.yellowSoft} />
                ))}
              </View>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.caption, color: wuzyColors.gray }}>awards</Text>
            </View>
          )}
        </View>
        {bio && (
          <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, lineHeight: Math.round(wuzyType.body * 1.5), color: wuzyColors.white }}>
            {bio}
          </Text>
        )}
      </View>
    </ImageBackground>
  );
}