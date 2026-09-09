import { useCallback, useState } from 'react';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { ProfileGrid, ProfileHero } from '@/components/profile';
import { Screen } from '@/components/Screen';
import { TagSection } from '@/components/TagSection';
import { accountFor } from '@/constants/accounts';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { apiGet, type ApiPost } from '@/lib/api';

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
      <ProfileHero
        background={extra.backgroundImage}
        name={user.display_name ?? user.username}
        awardsCount={extra.awardsCount}
        bio={user.bio}
        height={heroHeight}
        actions={
          <>
            <GlassNavButton icon="people" accessibilityLabel="Connect" onPress={() => router.push('/connect')} />
            <GlassNavButton icon="settings-outline" accessibilityLabel="Settings" onPress={() => router.push('/settings')} />
          </>
        }
      />

      <View style={{ paddingHorizontal: wuzyLayout.side, gap: wuzyLayout.gap, paddingTop: wuzyLayout.gap }}>
        <TagSection tags={user.hobbies ?? []} />

        <View style={{ flexDirection: 'row', gap: wuzyLayout.itemGap }}>
          {pillButton('Edit profile', () => router.push('/edit-profile'))}
          {pillButton('Connections', () => router.push('/connections'))}
        </View>

        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow, textAlign: 'center' }}>Timeline</Text>
      </View>

      <ProfileGrid posts={photos} loading={loadingPosts} gridItemSize={gridItemSize} gap={GRID_GAP} onEmptyPress={() => router.push('/upload')} />
    </Screen>
  );
}