import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export type ReferCardState = {
  /** The latest referral's overall state for this card pair. */
  overall: 'pending' | 'accepted' | 'declined' | 'idle';
  /** First recipient's reply status, or null when no referral exists yet. */
  aStatus: 'pending' | 'accepted' | 'declined' | null;
  /** Second recipient's reply status, or null when no referral exists yet. */
  bStatus: 'pending' | 'accepted' | 'declined' | null;
};

interface ReferActionProps {
  /** The first recipient's full name (the person whose card was expanded). */
  name: string;
  /** The second recipient's full name (this card). */
  otherName: string;
  /** Latest referral state for this card pair. */
  state: ReferCardState;
  onSend?: () => void;
  /** Fired once the 1s outcome flash (Connection made / Referral Denied) completes. */
  onAutoCollapse?: () => void;
}

const outcomeTextStyle = StyleSheet.create({
  outcome: {
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.small,
    color: wuzyColors.yellow,
    textAlign: 'center',
  },
});

/** Expanded-card action on the refer screen: the Send Request pill, the yellow
 * awaiting note (both or whichever recipient has not responded yet), or the
 * 1s outcome flash (Connection made / Referral Denied). */
export function ReferAction({
  name,
  otherName,
  state,
  onSend,
  onAutoCollapse,
}: ReferActionProps) {
  // Keep the latest collapse callback in a ref so a parent re-render (e.g. a
  // live response refreshing the list) cannot restart the 1s outcome flash.
  const onAutoCollapseRef = useRef(onAutoCollapse);
  useEffect(() => {
    onAutoCollapseRef.current = onAutoCollapse;
  }, [onAutoCollapse]);

  // A resolved card flashes its outcome for 1 second, then closes itself.
  // The effect only restarts when the overall state actually changes.
  const resolved = state.overall === 'accepted' || state.overall === 'declined';
  useEffect(() => {
    if (!resolved) return;
    const timer = setTimeout(() => onAutoCollapseRef.current?.(), 1000);
    return () => clearTimeout(timer);
  }, [resolved]);

  const sendPill = (
    <GlassNavButton
      onPress={onSend ?? (() => {})}
      accessibilityLabel={`Send request to ${name}`}
      style={{ width: 200, height: wuzyLayout.control, alignSelf: 'center' }}>
      <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
        Send Request
      </Text>
    </GlassNavButton>
  );

  let note = '';
  if (state.overall === 'accepted') {
    note = 'Connection made!';
  } else if (state.overall === 'declined') {
    note = 'Referral Denied!';
  } else {
    // One accepted already; name whoever is still deciding.
    if (state.aStatus === 'accepted') {
      note = `Awaiting for ${otherName}'s response!`;
    } else if (state.bStatus === 'accepted') {
      note = `Awaiting for ${name}'s response!`;
    } else {
      note = `Awaiting for ${name}'s & ${otherName}'s response!`;
    }
  }

  if (state.overall === 'idle') {
    return <View style={{ marginTop: 35, alignItems: 'center' }}>{sendPill}</View>;
  }

  return (
    <View style={{ marginTop: 35, alignItems: 'center' }}>
      <Text numberOfLines={2} style={outcomeTextStyle.outcome}>
        {note}
      </Text>
    </View>
  );
}