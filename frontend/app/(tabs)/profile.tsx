import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { Screen } from '@/components/Screen';
import { TagSection } from '@/components/TagSection';
import { accountFor } from '@/constants/accounts';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { apiGet, assetUrl, type ApiPost } from '@/lib/api';

const GRID_GAP = 2;

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const extra = accountFor(user?.username);

  const [photos, setPhotos] = useState<ApiPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const loadPhotos = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingPosts(true);
      setPhotos(await apiGet<ApiPost[]>(`/feed/profile/${user.id}`));
    } catch {
      setPhotos([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );

  if (!user) return null;

  // Yoga narrows an aspectRatio box when maxHeight clamps it, so the hero takes an explicit capped height.
  const heroHeight = Math.min(Math.round(width * 1.3), 540);
  const gridItemSize = Math.floor((width - GRID_GAP * 2) / 3);
  const [firstName, ...rest] = (user.display_name ?? user.username).split(' ');
  const lastName = rest.join(' ');

  // The pre-token look: quiet dark glass with a faint yellow tint, not the highlighted GlassNavButton chrome.
  const pillButton = (label: string, onPress?: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="rounded-full overflow-hidden"
      style={{ flex: 1, maxWidth: 160, height: wuzyLayout.control }}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(244, 196, 0, 0.1)' }} />
      <View className="absolute inset-0 rounded-full border border-white/20" />
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.white }}>{label}</Text>
      </View>
    </Pressable>
  );

  return (
    <Screen scroll padded={false} style={{ paddingTop: 0 }}>
      <ImageBackground source={extra.backgroundImage} style={{ height: heroHeight }} imageStyle={{ resizeMode: 'cover' }}>
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
            <View className="items-center" style={{ gap: 2 }}>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                {Array.from({ length: extra.awardsCount }, (_, i) => (
                  <Ionicons key={i} name="medal" size={wuzyType.body} color={wuzyColors.yellowSoft} />
                ))}
              </View>
              <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.caption, color: wuzyColors.gray }}>awards</Text>
            </View>
          </View>
          {user.bio && (
            <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, lineHeight: Math.round(wuzyType.body * 1.5), color: wuzyColors.white }}>
              {user.bio}
            </Text>
          )}
        </View>
      </ImageBackground>

      <View style={{ paddingHorizontal: wuzyLayout.side, gap: wuzyLayout.gap, paddingTop: wuzyLayout.gap }}>
        <TagSection tags={user.hobbies ?? []} />

        <View className="flex-row items-center justify-center" style={{ gap: wuzyLayout.itemGap }}>
          {pillButton('Edit profile')}
          {pillButton('Connections', () => router.push('/connections'))}
        </View>

        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow, textAlign: 'center' }}>Timeline</Text>
      </View>

      {loadingPosts ? (
        <ActivityIndicator size="small" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
      ) : (
        <View className="flex-row flex-wrap" style={{ gap: GRID_GAP, marginTop: wuzyLayout.itemGap }}>
          {photos.map((post) => (
            <Image
              key={post.id}
              source={{ uri: assetUrl(post.media_url) }}
              style={{ width: gridItemSize, height: gridItemSize }}
              resizeMode="cover"
            />
          ))}
          {photos.length === 0 && (
            <Pressable onPress={() => router.push('/upload')} className="items-center self-center" style={{ paddingVertical: wuzyLayout.gap }}>
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.gray }}>
                No posts yet, share your first one
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Screen>
  );
}