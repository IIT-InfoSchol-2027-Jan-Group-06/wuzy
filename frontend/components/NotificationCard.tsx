import { Image, ImageSourcePropType, Pressable, Text, View } from 'react-native';

import { LiquidGlass } from '@/components/LiquidGlass';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export interface NotificationCardProps {
  avatar: ImageSourcePropType;
  /** Gray kind label above the sentence: Referral, Connection, Group, Like. */
  label: string;
  /** The full sentence, already worded by the backend. */
  text: string;
  timestamp?: string;
  /** Set when I already accepted a referral and am waiting on the other recipient;
   * renders a yellow "Waiting for ..." note instead of the Accept/Decline pills. */
  waitingName?: string;
  /** Wired Accept/Decline pills; both must be set for the buttons to render. */
  onAccept?: () => void;
  onDecline?: () => void;
  /** Tap on the row itself, used to deep-link into the thing that happened. */
  onPress?: () => void;
}

/** One entry in the Notifications list: 48 avatar, gray kind label (`caption`)
 * above the sentence (`small`, up to two lines), gray timestamp, then either
 * Accept/Decline liquid-glass pills or the yellow waiting note for referrals.
 * Text stays at the caption/small scale so the block matches `UserRow`. */
export function NotificationCard({
  avatar,
  label,
  text,
  timestamp,
  waitingName,
  onAccept,
  onDecline,
  onPress,
}: NotificationCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className="flex-row items-center"
      style={{ gap: wuzyLayout.itemGap }}>
      <Image source={avatar} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />
      <View className="flex-1" style={{ gap: 2 }}>
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.caption, color: wuzyColors.gray }}>
          {label}
        </Text>
        <Text numberOfLines={2} style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.white }}>
          {text}
        </Text>
        {timestamp ? (
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.gray }}>
            {timestamp}
          </Text>
        ) : null}
        {waitingName ? (
          <Text
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: wuzyType.small,
              color: wuzyColors.yellow,
              marginTop: 8,
            }}>
            Waiting for {waitingName}&apos;s response
          </Text>
        ) : onAccept && onDecline ? (
          <View className="flex-row" style={{ gap: wuzyLayout.itemGap, marginTop: 8 }}>
            <Pressable onPress={onAccept} accessibilityRole="button" accessibilityLabel="Accept referral" style={{ flex: 1 }}>
              <LiquidGlass tint={0.3} style={{ height: wuzyLayout.control }}>
                <View className="flex-1 items-center justify-center">
                  <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                    Accept
                  </Text>
                </View>
              </LiquidGlass>
            </Pressable>
            <Pressable onPress={onDecline} accessibilityRole="button" accessibilityLabel="Decline referral" style={{ flex: 1 }}>
              <LiquidGlass tint={0.1} style={{ height: wuzyLayout.control }}>
                <View className="flex-1 items-center justify-center">
                  <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                    Decline
                  </Text>
                </View>
              </LiquidGlass>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
