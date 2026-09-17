import { useCallback, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { GlassPillButton } from '@/components/GlassPillButton';
import { ProfileGrid, ProfileHero } from '@/components/profile';
import { PostViewerPopup } from '@/components/postcard/PostViewerPopup';
import { Screen } from '@/components/Screen';
import { TagSection } from '@/components/TagSection';
import { earnedStickers } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { apiGet, apiGetAwards, assetUrl, type ApiAwardRead, type ApiPost } from '@/lib/api';

const GRID_GAP = 2;

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [photos, setPhotos] = useState<ApiPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [awards, setAwards] = useState<ApiAwardRead[]>([]);
  const [awardsLoaded, setAwardsLoaded] = useState(false);
  const [openPost, setOpenPost] = useState<ApiPost | null>(null);

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

  const loadAwardsInfo = useCallback(async () => {
    if (!user) return;
    try {
      setAwards(await apiGetAwards());
    } catch {
      setAwards([]);
    } finally {
      setAwardsLoaded(true);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
      loadAwardsInfo();
    }, [loadPhotos, loadAwardsInfo]),
  );

  const earnedAwards = earnedStickers(awards);

  if (!user) return null;

  // Yoga narrows an aspectRatio box when maxHeight clamps it, so the hero takes an explicit capped height.
  const heroHeight = Math.min(Math.round(width * 1.3), 540);
  const gridItemSize = Math.floor((width - GRID_GAP * 2) / 3);

  return (
    <Screen
      scroll
      padded={false}
      style={{ paddingTop: 0 }}
      overlay={
        <PostViewerPopup
          post={openPost}
          onClose={() => setOpenPost(null)}
        />
      }>
      <ProfileHero
        background={user.avatar_url ? { uri: assetUrl(user.avatar_url) } : require('@/assets/images/profile.jpg')}
        name={user.display_name ?? user.username}
        awardsCount={awardsLoaded ? earnedAwards.length : 0}
        awards={awardsLoaded ? earnedAwards : undefined}
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
          <GlassPillButton label="Edit profile" onPress={() => router.push('/edit-profile')} style={{ flex: 1, maxWidth: 160 }} />
          <GlassPillButton label="Connections" onPress={() => router.push('/connections')} style={{ flex: 1, maxWidth: 160 }} />
        </View>

        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow, textAlign: 'center' }}>Timeline</Text>
      </View>

      <ProfileGrid posts={photos} loading={loadingPosts} gridItemSize={gridItemSize} gap={GRID_GAP} onEmptyPress={() => router.push('/upload')} onPostPress={setOpenPost} />
    </Screen>
  );
}