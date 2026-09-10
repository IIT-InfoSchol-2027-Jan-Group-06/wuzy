import { memo } from 'react';
import { Text, View } from 'react-native';

import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';

const RADIUS = 16;
const NICK = 2;

export const ChatBubble = memo(function ChatBubble({
  text,
  outgoing,
  name,
}: {
  text: string;
  outgoing: boolean;
  /** Sender name, shown above incoming group messages. */
  name?: string;
}) {
  return (
    <View
      style={{
        alignSelf: outgoing ? 'flex-end' : 'flex-start',
        maxWidth: '75%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopLeftRadius: outgoing ? RADIUS : NICK,
        borderTopRightRadius: outgoing ? NICK : RADIUS,
        borderBottomLeftRadius: RADIUS,
        borderBottomRightRadius: RADIUS,
        ...(outgoing
          ? {
              backgroundColor: wuzyColors.yellowMuted,
              shadowColor: wuzyColors.yellowMuted,
              shadowOpacity: 0.1,
              shadowRadius: 7.5,
              shadowOffset: { width: 0, height: 0 },
            }
          : {
              backgroundColor: wuzyColors.glassFill,
              borderWidth: 1,
              borderColor: wuzyColors.glassBorder,
            }),
      }}>
      {name && !outgoing ? (
        <Text
          style={{
            fontFamily: wuzyFonts.semibold,
            fontSize: wuzyType.small,
            color: wuzyColors.yellow,
            marginBottom: 4,
          }}>
          {name}
        </Text>
      ) : null}
      <Text
        style={{
          fontFamily: wuzyFonts.body,
          fontSize: wuzyType.body,
          lineHeight: Math.round(wuzyType.body * 1.5),
          color: outgoing ? wuzyColors.bg : wuzyColors.white,
        }}>
        {text}
      </Text>
    </View>
  );
});
