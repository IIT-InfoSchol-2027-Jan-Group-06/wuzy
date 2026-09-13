import { Image, ImageSourcePropType, Pressable, Text, View } from 'react-native';

import { LiquidGlass } from '@/components/LiquidGlass';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export interface ReferralNotificationCardProps {
  avatar: ImageSourcePropType;
  senderName: string;
  targetName: string;
  timestamp?: string;
  /** Wired Accept/Decline pills; both must be set for the buttons to render. */
  onAccept?: () => void;
  onDecline?: () => void;
}

/** Notification entry for a referral: sender avatar, gray "Referral" label
 * above the sentence, timestamp, then Accept/Decline liquid-glass pills. Text
 * stays at the caption/small scale so the block matches the other entries. */
export function ReferralNotificationCard({
  avatar,
  senderName,
  targetName,
  timestamp,
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
          {senderName} wants to refer you to {targetName}
        </Text>
        {timestamp ? (
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.gray }}>
            {timestamp}
          </Text>
        ) : null}
        {handleAccept && handleDecline ? (
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