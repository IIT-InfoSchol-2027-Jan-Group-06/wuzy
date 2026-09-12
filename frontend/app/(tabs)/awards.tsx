import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { Alert, Image, Pressable, Text, View, Animated } from 'react-native';

import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { QuestsSection } from '@/components/awards/QuestsSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiCompleteProfile, apiGetAwards, apiGetQuests, apiGetUserXp, apiPurchaseTicket, apiRecordDailyLogin, type ApiAwardRead, type ApiQuest, type UserXpData } from '@/lib/api';

const stickerBoardImage = require('@/assets/badges/image.png');

const RANKS = [
  { threshold: 0, label: 'Bronze', badge: require('@/assets/badges/img1.png') },
  { threshold: 100, label: 'Silver', badge: require('@/assets/badges/img3.png') },
  { threshold: 250, label: 'Gold', badge: require('@/assets/badges/img6.png') },
  { threshold: 500, label: 'Diamond', badge: require('@/assets/badges/img12.png') },
] as const;

function getRank(totalXp: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalXp >= r.threshold) rank = r;
  }
  return rank;
}

function getProgressData(totalXp: number) {
  const rank = getRank(totalXp);
  const currentThreshold = rank.threshold;
  const nextRank = RANKS.find((r) => r.threshold > currentThreshold);
  const xpInRank = totalXp - currentThreshold;
  const xpToNext = nextRank ? nextRank.threshold - currentThreshold : 0;
  const progressPct = xpToNext > 0 ? Math.min(100, Math.round((xpInRank / xpToNext) * 100)) : 100;
  return { rank, nextRank, progressPct, xpInRank, xpToNext };
}

export default function AwardsScreen() {
  const [quests, setQuests] = useState<ApiQuest[]>([]);
  const [awards, setAwards] = useState<ApiAwardRead[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [xpData, setXpData] = useState<UserXpData | null>(null);
  const [prevRank, setPrevRank] = useState(RANKS[0].label);
  const [animating, setAnimating] = useState(false);
  const [scale, setScale] = useState(new Animated.Value(1));
  const [bounceAnim] = useState(new Animated.Value(1));

  const totalXp = xpData?.total_xp ?? awards.reduce((sum, a) => sum + a.reward_xp, 0);
  const progress = xpData ? { rank: getRank(xpData.total_xp), progressPct: xpData.progress_pct, nextRank: xpData.next_rank, xpInRank: xpData.xp_in_rank, xpToNext: xpData.xp_to_next } : getProgressData(totalXp);

  useEffect(() => {
    const newRank = progress.rank.label;
    if (newRank !== prevRank) {
      setAnimating(true);
      Animated.spring(bounceAnim, {
        toValue: 1.5,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 8,
          tension: 30,
          useNativeDriver: true,
        }).start(() => {
          setAnimating(false);
          setPrevRank(newRank);
        });
      });
    }
  }, [progress.rank.label, prevRank]);

  const loadQuests = useCallback(() => {
    apiRecordDailyLogin()
      .then(() => apiGetQuests())
      .then((data) => setQuests(data.quests))
      .catch(() => setQuests([]));
  }, []);

  const loadAwards = useCallback(() => {
    apiGetAwards()
      .then((data) => setAwards(data))
      .catch(() => setAwards([]));
  }, []);

  const loadXp = useCallback(() => {
    apiGetUserXp()
      .then((data) => setXpData(data))
      .catch(() => setXpData(null));
  }, []);

  const markTaskComplete = useCallback((name: string) => {
    setCompletedTasks((prev) => new Set(prev).add(name));
  }, []);

  const handlePurchaseTicket = async () => {
    setProcessing('ticket');
    try {
      await apiPurchaseTicket();
      Alert.alert('Award', 'Ticket purchased! +50 XP earned');
      markTaskComplete('Purchase Ticket');
      loadQuests();
      loadAwards();
      loadXp();
    } catch {
      Alert.alert('Error', 'Failed to purchase ticket');
    } finally {
      setProcessing(null);
    }
  };

  const handleCompleteProfile = async () => {
    setProcessing('profile');
    try {
      await apiCompleteProfile();
      Alert.alert('Award', 'Profile complete! +100 XP earned');
      markTaskComplete('Complete Profile');
      loadAwards();
      loadXp();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('already claimed')) {
        Alert.alert('Award', 'Profile completion award already claimed');
      } else {
        Alert.alert('Error', 'Failed to complete profile');
      }
    } finally {
      setProcessing(null);
    }
  };

  const onClaimTask = useCallback((name: string) => {
    return async () => {
      if (name === 'Purchase Ticket') {
        await handlePurchaseTicket();
      } else if (name === 'Complete Profile') {
        await handleCompleteProfile();
      }
    };
  }, [handlePurchaseTicket, handleCompleteProfile]);

  useFocusEffect(
    useCallback(() => {
      loadQuests();
      loadAwards();
      loadXp();
    }, [loadQuests, loadAwards, loadXp]),
  );

  const rankBadge = RANKS.find((r) => r.label === progress.rank.label) ?? RANKS[0];

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap, paddingBottom: 96 }}>
      <TabHeader title="Awards" />
      <View>
        <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
          Tasks and Sticker Board
        </Text>
        <View style={{ marginTop: 6, alignItems: 'center' }}>
          <Text
            className="text-center"
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: 13,
              color: wuzyColors.yellowMuted,
              paddingVertical: 6,
            }}>
            Complete a task to earn its badge
          </Text>
          <Image
            source={stickerBoardImage}
            style={{ width: 260, height: 260, resizeMode: 'contain' }}
          />
          <View style={{ marginTop: 16, alignItems: 'center', gap: 8 }}>
            <Animated.View style={{ transform: [{ scale: animating ? bounceAnim : scale }] }}>
              <Image source={rankBadge.badge} style={{ width: 72, height: 72, resizeMode: 'contain' }} />
            </Animated.View>
            <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color: wuzyColors.yellow }}>
              {progress.rank.label}
            </Text>
            <View style={{ width: 200, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <Animated.View style={{ height: '100%', width: `${progress.progressPct}%`, backgroundColor: wuzyColors.yellow, borderRadius: 4 }} />
            </View>
            <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
              {totalXp} XP{progress.nextRank ? ` — ${progress.xpToNext - progress.xpInRank} to ${progress.nextRank}` : ' — Max rank'}
            </Text>
          </View>
        </View>

        <QuestsSection quests={quests} onClaimed={loadQuests} completedTasks={completedTasks} onClaimTask={onClaimTask} />
      </View>
    </Screen>
  );
}