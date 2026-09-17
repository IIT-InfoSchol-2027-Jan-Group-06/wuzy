import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { VoiceNoteBubble } from '@/components/chat/VoiceNoteBubble';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { assetUrl } from '@/lib/api';
import type { TicketMessage } from '@/lib/ws';

const RADIUS = 16;
const NICK = 2;
// Standard image-message radius, slightly tighter than the bubble's.
const IMAGE_RADIUS = Math.round(RADIUS * 0.75);
const fallbackArt = require('@/assets/images/event1.jpg');

/** The gifted-ticket frame: the event square (picture, title, time, location)
 *  with the gift line attached underneath as a reply-style block. The top
 *  corners copy the bubble chrome's (rounded on the sender's left, the
 *  receiver's right), so the opaque art never pokes square tips past it. */
function TicketCard({
  ticket,
  text,
  topCorners,
}: {
  ticket: TicketMessage;
  text: string;
  topCorners: { borderTopLeftRadius: number; borderTopRightRadius: number };
}) {
  const when = new Date(ticket.start_time).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const where = [ticket.venue, ticket.location].filter(Boolean).join(', ');
  return (
    <View>
      <Image
        source={ticket.image_url ? { uri: assetUrl(ticket.image_url) } : fallbackArt}
        style={{ width: '100%', height: 120, ...topCorners }}
        contentFit="cover"
      />
      <View style={{ padding: 10, gap: 3 }}>
        <Text className="uppercase text-wuzy-yellow" numberOfLines={1} style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title }}>
          {ticket.title}
        </Text>
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.white }}>{when}</Text>
        {where ? (
          <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.caption, color: wuzyColors.gray }}>
            {where}
          </Text>
        ) : null}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.12)', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: 10 }}>
        <Text numberOfLines={3} style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.caption, color: wuzyColors.white }}>
          {text}
        </Text>
      </View>
    </View>
  );
}

/** The bubble's content (name, voice, image, ticket, text) without its frosted chrome.
 *  Shared by ChatBubble and the reply preview blocks. */
export const BubbleContent = memo(function BubbleContent({
  text,
  outgoing,
  name,
  mediaUrl,
  audioUrl,
  durationMs,
  squareTop,
  ticket,
  ticketTopCorners,
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
  /** Gifted ticket, rendered as its event card with the gift line attached. */
  ticket?: TicketMessage | null;
  /** Top corner radii for the ticket art, copied from the bubble chrome. */
  ticketTopCorners?: { borderTopLeftRadius: number; borderTopRightRadius: number };
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
            paddingTop: mediaUrl || audioUrl || ticket ? 12 : 0,
            ...pad,
          }}>
          {name}
        </Text>
      ) : null}
      {ticket ? (
        <TicketCard
          ticket={ticket}
          text={text}
          topCorners={ticketTopCorners ?? { borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        />
      ) : (
        <>
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
      )}
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
  ticket,
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
  /** Gifted ticket, rendered as its event card with the gift line attached. */
  ticket?: TicketMessage | null;
}) {
  const isTicket = !!ticket;
  const bubbleStyle = isTicket
    ? {
        backgroundColor: wuzyColors.surface,
        borderWidth: 1,
        borderColor: wuzyColors.glassBorder,
      }
    : outgoing
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
          ...(stretch ? {} : { maxWidth: isTicket ? '85%' : '75%' }),
          paddingVertical: mediaUrl || audioUrl || isTicket ? 0 : 12,
          paddingHorizontal: mediaUrl || audioUrl || isTicket ? 0 : 16,
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
          ticket={ticket}
          ticketTopCorners={{ borderTopLeftRadius: topRadius, borderTopRightRadius: topRightRadius }}
        />
      </View>
    </GestureDetector>
  );
});