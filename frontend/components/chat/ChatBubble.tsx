import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { VoiceNoteBubble } from '@/components/chat/VoiceNoteBubble';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { assetUrl } from '@/lib/api';

const RADIUS = 16;
const NICK = 2;
// Standard image-message radius, slightly tighter than the bubble's.
const IMAGE_RADIUS = Math.round(RADIUS * 0.75);

/** The bubble's content (name, voice, image, text) without its frosted chrome.
 *  Shared by ChatBubble and the reply preview blocks. */
export const BubbleContent = memo(function BubbleContent({
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
  const pad = mediaUrl ? { paddingHorizontal: 16 } : {};

  // A bare picture keeps the standard image radius on all four corners. A
  // picture with a caption gets a square top and sharp bottom corners so the
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
    <>
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
    </>
  );
});

export const ChatBubble = memo(function ChatBubble({
  text,
  outgoing,
  name,
  mediaUrl,
  audioUrl,
  durationMs,
  onSwipeLeft,
  onSwipeRight,
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
  /** Swipe right on an outgoing message: reply to self. */
  onSwipeRight?: () => void;
  /** Swipe left on an incoming message: reply to the sender. */
  onSwipeLeft?: () => void;
}) {
  const bubbleStyle = outgoing
    ? {
        backgroundColor: wuzyColors.yellow,
        shadowColor: wuzyColors.yellow,
        shadowOpacity: 0.1,
        shadowRadius: 7.5,
        shadowOffset: { width: 0, height: 0 },
      }
    : {
        backgroundColor: wuzyColors.glassFill,
        borderWidth: 1,
        borderColor: wuzyColors.glassBorder,
      };

  // A horizontal swipe (24dp) on the existing side triggers a reply: right
  // swipes reply to your own outgoing message, left swipes reply to a received
  // one. Vertical swipes leave the list scroll alone.
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-24, 24])
        .onEnd((e) => {
          if (outgoing && e.translationX > 0) onSwipeRight?.();
          else if (!outgoing && e.translationX < 0) onSwipeLeft?.();
        }),
    [outgoing, onSwipeLeft, onSwipeRight],
  );

  return (
    <GestureDetector gesture={gesture}>
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
        <BubbleContent
          text={text}
          outgoing={outgoing}
          name={name}
          mediaUrl={mediaUrl}
          audioUrl={audioUrl}
          durationMs={durationMs}
        />
      </View>
    </GestureDetector>
  );
});