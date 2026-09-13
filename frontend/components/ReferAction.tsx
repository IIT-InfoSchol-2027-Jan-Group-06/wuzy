import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

interface ReferActionProps {
  /** The user being referred; named in the sent-request note. */
  name: string;
  /** A pending request already exists for this card, so the button stays locked. */
  pending: boolean;
  /** The most recent referral for this card was accepted or declined. */
  outcome: 'approved' | 'declined' | null;
  /** True while the card is collapsing to compressed size; show the Send Request pill. */
  collapsing: boolean;
  onSend?: () => void;
  /** Approved flow: opens the referral QR screen for the approving user. */
  onQr?: () => void;
  /** Declined flow: fired once the 1s "Referral Denied!" flash completes. */
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
 * pending note, the approved note with its QR-code button, or the declined flash. */
export function ReferAction({
  name,
  pending,
  outcome,
  collapsing,
  onSend,
  onQr,
  onAutoCollapse,
}: ReferActionProps) {
  // Keep the latest collapse callback in a ref so a parent re-render (e.g. a
  // live response refreshing the list) cannot restart the 1s denied flash.
  const onAutoCollapseRef = useRef(onAutoCollapse);
  useEffect(() => {
    onAutoCollapseRef.current = onAutoCollapse;
  }, [onAutoCollapse]);

  // A declined card flashes its note for 1 second, then collapses itself. The
  // effect only restarts when the state actually changes.
  useEffect(() => {
    if (outcome !== 'declined' || collapsing) return;
    const timer = setTimeout(() => onAutoCollapseRef.current?.(), 1000);
    return () => clearTimeout(timer);
  }, [outcome, collapsing]);

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

  if (collapsing) {
    return <View style={{ marginTop: 35, alignItems: 'center' }}>{sendPill}</View>;
  }

  if (pending) {
    return (
      <View style={{ marginTop: 35, alignItems: 'center' }}>
        <Text numberOfLines={2} style={outcomeTextStyle.outcome}>
          Request sent to {name}, Awaiting Response
        </Text>
      </View>
    );
  }

  if (outcome === 'approved') {
    return (
      <View style={{ marginTop: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wuzyLayout.itemGap }}>
        <Text numberOfLines={2} style={outcomeTextStyle.outcome}>
          The referral was approved!
        </Text>
        <GlassNavButton
          icon="qr-code"
          onPress={onQr ?? (() => {})}
          accessibilityLabel="Open the approved referral QR code"
        />
      </View>
    );
  }

  if (outcome === 'declined') {
    return (
      <View style={{ marginTop: 35, alignItems: 'center' }}>
        <Text numberOfLines={2} style={outcomeTextStyle.outcome}>
          Referral Denied!
        </Text>
      </View>
    );
  }

  return <View style={{ marginTop: 35, alignItems: 'center' }}>{sendPill}</View>;
}