import { useCallback, useState } from 'react';
import { Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { ProfileGrid, ProfileHero } from '@/components/profile';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TagSection } from '@/components/TagSection';
import { accountFor } from '@/constants/accounts';
import { badgeImageForAward } from '@/constants/awards-data';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiGet, apiGetUserAwards, apiGetUserQuests, type ApiAwardRead, type ApiPost, type ApiQuest, type ApiUser } from '@/lib/api';

const GRID_GAP = 2;

const AWARD_ORDER = [
  'Daily Login',
  'Social Network',
  'Purchase Ticket',
  'Complete Profile',
  'Ticket Sharing',
];

interface EarnedAward {
  name: string;
  image: ImageSourcePropType;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [photos, setPhotos] = useState<ApiPost[]>([]);
  const [awards, setAwards] = useState<ApiAwardRead[]>([]);
  const [quests, setQuests] = useState<ApiQuest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const userId = Number(id);
      const [user, posts, awardList, questData] = await Promise.all([
        apiGet<ApiUser>(`/users/${id}`),
        apiGet<ApiPost[]>(`/feed/profile/${id}`),
        apiGetUserAwards(userId),
        apiGetUserQuests(userId),
      ]);
      setProfile(user);
      setPhotos(posts);
      setAwards(awardList);
      setQuests(questData.quests);
    } catch {
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!profile) {
    return null;
  }

  const earnedAwards: EarnedAward[] = [];
  const purchaseDone = awards.some((a) => a.award_type === 'ticket_purchase');
  const profileDone = awards.some((a) => a.award_type === 'profile_complete');
  if (purchaseDone) {
    const image = badgeImageForAward(awards, 'Purchase Ticket');
    if (image) earnedAwards.push({ name: 'Purchase Ticket', image });
  }
  if (profileDone) {
    const image = badgeImageForAward(awards, 'Complete Profile');
    if (image) earnedAwards.push({ name: 'Complete Profile', image });
  }
  for (const quest of quests) {
    if (quest.active_subtask === null) {
      const image = badgeImageForAward(awards, quest.name);
      if (image) earnedAwards.push({ name: quest.name, image });
    }
  }
  earnedAwards.sort((a, b) => AWARD_ORDER.indexOf(a.name) - AWARD_ORDER.indexOf(b.name));

  const heroHeight = Math.min(Math.round(width * 1.3), 540);
  const gridItemSize = Math.floor((width - GRID_GAP * 2) / 3);
  const name = profile.display_name ?? profile.username;

  return (
    <Screen
      scroll
      padded={false}
      style={{ paddingTop: 0 }}
      overlay={
        // Floats over the hero. box-none so the hero underneath still scrolls.
        <View pointerEvents="box-none" className="absolute left-0 right-0" style={{ top: wuzyLayout.top, paddingHorizontal: wuzyLayout.side }}>
          <ScreenHeader title="" />
        </View>
      }>
      <ProfileHero
        background={accountFor(profile.username).backgroundImage}
        name={name}
        awardsCount={earnedAwards.length}
        awards={earnedAwards}
        bio={profile.bio}
        height={heroHeight}
      />

      <View style={{ paddingHorizontal: wuzyLayout.side, gap: wuzyLayout.gap, paddingTop: wuzyLayout.gap }}>
        <TagSection tags={profile.hobbies ?? []} />
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.section, color: wuzyColors.yellow, textAlign: 'center' }}>Timeline</Text>
      </View>

      <ProfileGrid posts={photos} loading={loading} gridItemSize={gridItemSize} gap={GRID_GAP} />
    </Screen>
  );
}