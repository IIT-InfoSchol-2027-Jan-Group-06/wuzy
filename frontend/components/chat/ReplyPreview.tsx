import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { formatVoiceTime } from '@/components/chat/Waveform';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { assetUrl } from '@/lib/api';
import type { ReplyContext } from '@/lib/ws';

const RADIUS = 16;
const RECEIVER_BUBBLE = 'rgba(84, 82, 56, 0.35)';
const THUMB = 53;

/** Shared layout for both the composing preview and the sent-message quoted
 *  snippet. White-tinted row: 3dp left accent bar, label, truncated text,
 *  mic + duration for voice replies, or a square image thumbnail. `onClose`
 *  shows the X close button (composing only; omit for sent state). */
function ReplyBlock({
  reply,
  outgoing,
  label,
  onClose,
}: {
  reply: ReplyContext;
  outgoing: boolean;
  label: string;
  onClose?: () => void;
}) {
  const isMedia = !!reply.media_url;
  const isVoice = !!reply.audio_url;
  const previewText = reply.text || 'Photo';

  return (
    <View
      style={{
        borderRadius: RADIUS,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
      }}>
      <View style={{ flexDirection: 'row' }}>
        <View
          style={{
            width: 3,
            backgroundColor: outgoing ? wuzyColors.yellow : RECEIVER_BUBBLE,
            borderRadius: 1.5,
          }}
        />
        <View style={{ flexShrink: 1, paddingLeft: 10, paddingRight: 5, paddingVertical: 10 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: wuzyType.small,
              color: wuzyColors.yellow,
            }}>
            {label}
          </Text>
          {isVoice ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Ionicons name="mic-outline" size={14} color={wuzyColors.white} />
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: wuzyFonts.body,
                  fontSize: wuzyType.caption,
                  color: wuzyColors.white,
                }}>
                Voice message ({formatVoiceTime(reply.duration_ms ?? 0)})
              </Text>
            </View>
          ) : (
            !isMedia && (
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: wuzyFonts.body,
                  fontSize: wuzyType.caption,
                  color: wuzyColors.white,
                  marginTop: 2,
                }}>
                {previewText}
              </Text>
            )
          )}
        </View>
        {isMedia && (
          <Image
            source={{ uri: assetUrl(reply.media_url!) }}
            style={{ width: THUMB, aspectRatio: 1 }}
            contentFit="cover"
          />
        )}
        {onClose && (
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              alignSelf: 'flex-start',
              marginTop: 10,
              marginRight: 10,
              marginLeft: 'auto',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="close" size={14} color={wuzyColors.white} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Quoted snippet attached to the top of a sent message. Identical layout to
 *  the composing preview (same white-tinted row, accent bar, label, truncated
 *  text or 53dp square thumbnail) but without the X close button. */
export function ReplyBubble({
  reply,
  outgoing,
  label,
}: {
  reply: ReplyContext;
  outgoing: boolean;
  label: string;
}) {
  return <ReplyBlock reply={reply} outgoing={outgoing} label={label} />;
}

/** Reply preview pinned above the typing bar. Same layout as the sent-message
 *  snippet but with an X close button to cancel the reply. Width matches the
 *  typing bar (marginHorizontal 16). */
export function ReplyPreview({
  reply,
  outgoing,
  label,
  onClose,
}: {
  reply: ReplyContext;
  outgoing: boolean;
  label: string;
  onClose: () => void;
}) {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 5 }}>
      <ReplyBlock reply={reply} outgoing={outgoing} label={label} onClose={onClose} />
    </View>
  );
}
