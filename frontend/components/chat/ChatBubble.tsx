import { Image } from 'expo-image';
import { memo } from 'react';
import { Text, View } from 'react-native';

import { VoiceNoteBubble } from '@/components/chat/VoiceNoteBubble';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { assetUrl } from '@/lib/api';

const RADIUS = 16;
const NICK = 2;
// Standard image-message radius, slightly tighter than the bubble's.
const IMAGE_RADIUS = Math.round(RADIUS * 0.75);

export const ChatBubble = memo(function ChatBubble({
  text,
  outgoing,
  name,
  mediaUrl,
  audioUrl,
  durationMs,
}: {
  text: string;
  outgoing: boolean;
  /** Sender name, shown above incoming group messages. */
  name?: string;
  /** Photo URL (server-relative). Rendered above the caption in one bubble. */
  mediaUrl?: string | null;
  /** Voice-note audio URL (server-relative); renders a playable voice bubble. */
  audioUrl?: string | null;
  /** Voice-note length in milliseconds, for the time label. */
  durationMs?: number | null;
}) {
  const bubbleStyle = outgoing
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
      };

  const pad = mediaUrl ? { paddingHorizontal: 16 } : {};

  // A bare picture keeps the standard image radius on all four corners. A
  // picture with a caption gets the bubble's asymmetric tail corner on top
  // (NICK on the outgoing/incoming tail side) and sharp bottom corners so the
  // caption block connects cleanly underneath it.
  const mediaRadius =
    mediaUrl && text
      ? {
          borderTopLeftRadius: outgoing ? RADIUS : NICK,
          borderTopRightRadius: outgoing ? NICK : RADIUS,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }
      : { borderRadius: IMAGE_RADIUS };

  return (
    <View
      style={{
        alignSelf: outgoing ? 'flex-end' : 'flex-start',
        maxWidth: '75%',
        paddingVertical: mediaUrl || audioUrl ? 0 : 12,
        paddingHorizontal: mediaUrl || audioUrl ? 0 : 16,
        borderTopLeftRadius: outgoing ? RADIUS : NICK,
        borderTopRightRadius: outgoing ? NICK : RADIUS,
        borderBottomLeftRadius: RADIUS,
        borderBottomRightRadius: RADIUS,
        ...bubbleStyle,
      }}>
      {name && !outgoing ? (
        <Text
          style={{
            fontFamily: wuzyFonts.semibold,
            fontSize: wuzyType.small,
            color: wuzyColors.yellow,
            marginBottom: 4,
            paddingTop: mediaUrl || audioUrl ? 12 : 0,
            ...pad,
          }}>
          {name}
        </Text>
      ) : null}
      {audioUrl ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <VoiceNoteBubble audioUrl={audioUrl} durationMs={durationMs ?? 0} outgoing={outgoing} />
        </View>
      ) : null}
      {!audioUrl && mediaUrl ? (
        <Image
          source={{ uri: assetUrl(mediaUrl) }}
          style={{
            width: 220,
            maxWidth: '100%',
            aspectRatio: 335 / 418,
            alignSelf: 'center',
            ...mediaRadius,
          }}
          contentFit="cover"
        />
      ) : null}
      {text ? (
        <Text
          style={{
            fontFamily: wuzyFonts.body,
            fontSize: wuzyType.body,
            lineHeight: Math.round(wuzyType.body * 1.5),
            color: outgoing ? wuzyColors.bg : wuzyColors.white,
            paddingTop: mediaUrl ? 12 : 0,
            paddingBottom: mediaUrl ? 12 : 0,
            ...pad,
          }}>
          {text}
        </Text>
      ) : null}
    </View>
  );
});