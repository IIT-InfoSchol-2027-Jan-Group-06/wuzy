import { useState } from 'react';
import { Text, View } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/** Expanded-card action on the refer screen: a centered "Send Request" glass pill that, once tapped, swaps to the confirmation in Wuzy yellow. Local state only, so collapsing the card resets it. */
export function ReferAction({ name }: { name: string }) {
  const [sent, setSent] = useState(false);

  return (
    <View style={{ marginTop: 25, alignItems: 'center' }}>
      {sent ? (
        <Text
          numberOfLines={2}
          style={{
            fontFamily: wuzyFonts.semibold,
            fontSize: wuzyType.small,
            color: wuzyColors.yellow,
            textAlign: 'center',
          }}>
          Request sent to {name}, Awaiting Response
        </Text>
      ) : (
        <GlassNavButton
          onPress={() => setSent(true)}
          accessibilityLabel={`Send request to ${name}`}
          style={{ width: 200, height: wuzyLayout.control, alignSelf: 'center' }}>
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
            Send Request
          </Text>
        </GlassNavButton>
      )}
    </View>
  );
}