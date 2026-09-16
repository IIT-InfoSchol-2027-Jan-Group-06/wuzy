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
  squareTop,
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
  /** Sits under a quoted reply block: square the touching top corners. */
  squareTop?: boolean;
}) {
  const pad = mediaUrl ? { paddingHorizontal: 16 } : {};

  // A bare picture keeps the standard image radius on all four corners. A
  // picture with a caption gets a square top and sharp bottom corners so the
  // caption block connects cleanly underneath it. Sent pictures round both top
  // corners (top-right matches top-left); received ones keep the tight tail
  // corner. Under a reply block both cases zero the top corners so the
  // picture sits flush on the quoted block.
  const mediaRadius =
    mediaUrl && text
      ? {
          borderTopLeftRadius: squareTop ? 0 : outgoing ? RADIUS : NICK,
          borderTopRightRadius: squareTop ? 0 : RADIUS,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }
      : squareTop
        ? {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: IMAGE_RADIUS,
            borderBottomRightRadius: IMAGE_RADIUS,
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
  onReply,
  squareTop,
  stretch,
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
  /** Swipe right to reply: own message replies to self, a received one to its sender. */
  onReply?: () => void;
  /** Sits under a quoted reply block: square the touching top corners. */
  squareTop?: boolean;
  /** Fill the reply stack's width instead of sizing to its own content. */
  stretch?: boolean;
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

  // A rightward swipe (24dp) triggers a reply on both sent and received
  // messages. Vertical swipes leave the list scroll alone.
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-24, 24])
        .onEnd((e) => {
          if (e.translationX > 0) onReply?.();
        }),
    [onReply],
  );

  // The bubble's top corners follow the image's own corners on picture
  // messages, so the chrome never peeks past the photo (the corner "tips").
  const topRadius = squareTop
    ? 0
    : mediaUrl
      ? text
        ? outgoing
          ? RADIUS
          : NICK
        : IMAGE_RADIUS
      : outgoing
        ? RADIUS
        : NICK;
  const topRightRadius = squareTop
    ? 0
    : mediaUrl
      ? text
        ? RADIUS
        : IMAGE_RADIUS
      : outgoing
        ? NICK
        : RADIUS;

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{
          alignSelf: stretch ? 'stretch' : outgoing ? 'flex-end' : 'flex-start',
          ...(stretch ? {} : { maxWidth: '75%' }),
          paddingVertical: mediaUrl || audioUrl ? 0 : 12,
          paddingHorizontal: mediaUrl || audioUrl ? 0 : 16,
          borderTopLeftRadius: topRadius,
          borderTopRightRadius: topRightRadius,
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
          squareTop={squareTop}
        />
      </View>
    </GestureDetector>
  );
});