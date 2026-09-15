import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Alert, ImageSourcePropType, Text, View, Animated } from 'react-native';

import { Screen } from '@/components/Screen';
import { TabHeader } from '@/components/TabHeader';
import { QuestsSection } from '@/components/awards/QuestsSection';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { deckImages } from '@/constants/awards-data';
import { apiCompleteProfile, apiGetAwards, apiGetMyDeck, apiGetQuests, apiGetTickets, apiPurchaseTicket, apiRecordDailyLogin, type ApiAwardRead, type ApiQuest, type ApiTicketRead } from '@/lib/api';

const MAX_XP = 600;

// Identity deck shown while the persisted deck is loading.
const FALLBACK_DECK = Array.from({ length: 15 }, (_, i) => i + 1);

export default function AwardsScreen() {
  const [deck, setDeck] = useState<number[] | null>(null);
  const boardImages = useMemo(() => deckImages(deck ?? FALLBACK_DECK), [deck]);

  const [quests, setQuests] = useState<ApiQuest[]>([]);
  const [awards, setAwards] = useState<ApiAwardRead[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [displayIndex, setDisplayIndex] = useState(1);
  const [leaveAnim] = useState(new Animated.Value(0));
  const [enterAnim] = useState(new Animated.Value(1));
  const [enterY] = useState(new Animated.Value(0));
  const [glowOpacity] = useState(new Animated.Value(0.4));
  const [barProgress] = useState(new Animated.Value(0));
  const [tickets, setTickets] = useState<ApiTicketRead[]>([]);
  const [boardImage, setBoardImage] = useState<ImageSourcePropType>(boardImages[0]);
  const hasAnimated = useRef(false);

  const purchaseDone =
    completedTasks.has('Purchase Ticket') || awards.some((a) => a.award_type === 'ticket_purchase');
  const profileDone =
    completedTasks.has('Complete Profile') || awards.some((a) => a.award_type === 'profile_complete');
  // Every claimed subtask advances the board; purchase and profile are each
  // single-step tasks. Progress is per-user, so each user fills their own bar.
  const questsReady = quests.length > 0 && deck != null;
  const doneSteps = questsReady
    ? quests.reduce((sum, q) => sum + q.claimed_steps, 0) + (purchaseDone ? 1 : 0) + (profileDone ? 1 : 0)
    : 0;
  const totalSteps = questsReady
    ? quests.reduce((sum, q) => sum + q.subtask_total, 0) + 2
    : 1;
  const earnedXp = Math.round((doneSteps / totalSteps) * MAX_XP);
  const barPct = Math.min(100, Math.round((doneSteps / totalSteps) * 100));
  const maxRank = questsReady && doneSteps >= totalSteps;
  const targetIndex = Math.min(
    boardImages.length,
    1 + Math.round((doneSteps / totalSteps) * (boardImages.length - 1)),
  );

  // Snap to the current rank once real quest data is in, and never animate
  // that initial jump. Only completions made after this screen is open play
  // the enter/exit sequence.
  useEffect(() => {
    if (!questsReady) return;
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      setDisplayIndex(targetIndex);
      setBoardImage(boardImages[targetIndex - 1]);
      return;
    }
    if (targetIndex <= displayIndex) return;
    let cancelled = false;
    const stepThrough = (step: number) => {
      if (cancelled || step > targetIndex) return;
      leaveAnim.setValue(1);
      enterAnim.setValue(0);
      enterY.setValue(60);
      Animated.timing(leaveAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(() => {
        if (cancelled) return;
        setBoardImage(boardImages[step - 1]);
        Animated.parallel([
          Animated.timing(enterAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.spring(enterY, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
        ]).start(() => {
          if (cancelled) return;
          if (step < targetIndex) stepThrough(step + 1);
          else setDisplayIndex(targetIndex);
        });
      });
    };
    stepThrough(displayIndex + 1);
    return () => {
      cancelled = true;
    };
  }, [targetIndex, displayIndex, questsReady, leaveAnim, enterAnim, enterY, boardImages]);

  // The XP bar eases to its new width instead of snapping.
  useEffect(() => {
    Animated.timing(barProgress, {
      toValue: barPct,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [barPct, barProgress]);

  useEffect(() => {
    if (!maxRank) {
      glowOpacity.setValue(0.4);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.55, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [maxRank, glowOpacity]);

  const loadQuests = useCallback(() => {
    apiRecordDailyLogin()
      .then(() => apiGetQuests())
      .then((data) => setQuests(data.quests))
      .catch(() => setQuests([]));
  }, []);

  const loadDeck = useCallback(() => {
    apiGetMyDeck()
      .then(setDeck)
      .catch(() => setDeck(FALLBACK_DECK));
  }, []);

  const loadAwards = useCallback(() => {
    apiGetAwards()
      .then((data) => setAwards(data))
      .catch(() => setAwards([]));
  }, []);

  const loadTickets = useCallback(() => {
    apiGetTickets()
      .then((data) => setTickets(data))
      .catch(() => setTickets([]));
  }, []);

  const markTaskComplete = useCallback((name: string) => {
    setCompletedTasks((prev) => new Set(prev).add(name));
  }, []);

  const handleQuestClaimed = useCallback(() => {
    loadQuests();
  }, [loadQuests]);

  const handlePurchaseTicket = async () => {
    setProcessing('ticket');
    try {
      await apiPurchaseTicket();
      Alert.alert('Award', 'Ticket purchased! +100 XP earned');
      markTaskComplete('Purchase Ticket');
      loadQuests();
      loadAwards();
      loadTickets();
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
      loadDeck();
      loadTickets();
    }, [loadQuests, loadAwards, loadDeck, loadTickets]),
  );

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
          <View style={{ width: 260, height: 260, alignItems: 'center', justifyContent: 'center' }}>
            {maxRank && (
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: wuzyColors.yellow,
                  opacity: glowOpacity,
                }}
              />
            )}
            <Animated.Image
              source={boardImage}
              style={{ position: 'absolute', width: 260, height: 260, resizeMode: 'contain', opacity: leaveAnim }}
            />
            <Animated.Image
              source={boardImage}
              style={{
                position: 'absolute',
                width: 260,
                height: 260,
                resizeMode: 'contain',
                opacity: enterAnim,
                transform: [{ translateY: enterY }],
              }}
            />
          </View>
          <View style={{ marginTop: 16, alignItems: 'center', gap: 8 }}>
            <View style={{ width: 200, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <Animated.View
                style={{
                  height: '100%',
                  width: barProgress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                  backgroundColor: wuzyColors.yellow,
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
              {maxRank ? `${MAX_XP} XP — Max rank` : `${earnedXp} XP — ${MAX_XP - earnedXp} XP to max rank`}
            </Text>
          </View>
        </View>

        <QuestsSection quests={quests} onClaimed={handleQuestClaimed} completedTasks={completedTasks} onClaimTask={onClaimTask} ticketCount={tickets.length} />
      </View>
    </Screen>
  );
}