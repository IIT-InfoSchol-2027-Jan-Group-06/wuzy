import { Image, ImageSourcePropType, Pressable, Text, View } from 'react-native';

import { LiquidGlass } from '@/components/LiquidGlass';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export interface ReferralNotificationCardProps {
  avatar: ImageSourcePropType;
  senderName: string;
  /** The other recipient's full name; "you" is referred to this person. */
  otherName: string;
  timestamp?: string;
  /** Set when I already accepted and am waiting on the other recipient; renders
   * a yellow "Waiting for ..." note instead of the Accept/Decline pills. */
  waitingName?: string;
  /** Wired Accept/Decline pills; both must be set for the buttons to render. */
  onAccept?: () => void;
  onDecline?: () => void;
}

/** Notification entry for a referral: sender avatar, gray "Referral" label
 * above the sentence, timestamp, then Accept/Decline liquid-glass pills (or
 * the yellow waiting note once I have accepted). Text stays at the
 * caption/small scale so the block matches the other entries. */
export function ReferralNotificationCard({
  avatar,
  senderName,
  otherName,
  timestamp,
  waitingName,
  onAccept,
  onDecline,
}: ReferralNotificationCardProps) {
  const handleAccept = onAccept;
  const handleDecline = onDecline;
  return (
    <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
      <Image source={avatar} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />
      <View className="flex-1" style={{ gap: 2 }}>
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.caption, color: wuzyColors.gray }}>
          Referral
        </Text>
        <Text numberOfLines={2} style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.white }}>
          {senderName} wants to refer you to {otherName}
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
        ) : handleAccept && handleDecline ? (
          <View className="flex-row" style={{ gap: wuzyLayout.itemGap, marginTop: 8 }}>
            <Pressable
              onPress={handleAccept}
              accessibilityRole="button"
              accessibilityLabel={`Accept referral from ${senderName}`}
              style={{ flex: 1 }}>
              <LiquidGlass tint={0.3} style={{ height: wuzyLayout.control }}>
                <View className="flex-1 items-center justify-center">
                  <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                    Accept
                  </Text>
                </View>
              </LiquidGlass>
            </Pressable>
            <Pressable
              onPress={handleDecline}
              accessibilityRole="button"
              accessibilityLabel={`Decline referral from ${senderName}`}
              style={{ flex: 1 }}>
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
    </View>
  );
}