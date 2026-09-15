import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import type { ThreadKind } from '@/lib/chat-db';

export function MessageBar({
  onSend,
  threadId,
  threadKind,
  otherUserId,
  attachOpen,
  onAttachOpenChange,
  onOpenGallery,
}: {
  onSend?: (text: string) => void;
  /** The thread this bar is attached to; the camera flow sends back into it. */
  threadId: number;
  threadKind: ThreadKind;
  /** DM recipient, needed so the camera flow can address the message. */
  otherUserId?: number;
  /** Controlled attach-sheet visibility: the chat route owns it so it can keep
   * the sheet open under the gallery overlay and close both together. */
  attachOpen: boolean;
  onAttachOpenChange: (open: boolean) => void;
  /** The Gallery attachment opens a full-screen photo overlay above the sheet. */
  onOpenGallery: () => void;
}) {
  const router = useRouter();
  const iconSize = 20;
  const gap = wuzyLayout.itemGap;
  const sendSize = 32;

  const [text, setText] = React.useState('');
  const hasText = text.length > 0;

  // 0 = only attach and mic, 1 = send button revealed at their right
  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withTiming(hasText ? 1 : 0, {
      duration: 220,
      easing: Easing.inOut(Easing.ease),
    });
  }, [hasText, progress]);

  // 0 = sheet hidden, 1 = risen above the bar
  const sheet = useSharedValue(0);
  React.useEffect(() => {
    sheet.value = withTiming(attachOpen ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [attachOpen, sheet]);

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: sheet.value,
    transform: [{ translateY: (1 - sheet.value) * 64 }],
  }));

  // attach and mic collapse away as the send door slides in, so the
  // partially revealed send never overlaps them; negative margins cancel
  // the row gaps while either side is collapsed
  const attachMicWidth = iconSize * 2 + gap;
  const iconsStyle = useAnimatedStyle(() => ({
    width: (1 - progress.value) * attachMicWidth,
    opacity: 1 - progress.value,
    marginLeft: interpolate(progress.value, [0, 1], [0, -gap]),
  }));
  const sendStyle = useAnimatedStyle(() => ({
    width: progress.value * sendSize,
    marginLeft: interpolate(progress.value, [0, 1], [-gap, 0]),
  }));

  const openCamera = () => {
    onAttachOpenChange(false);
    router.push({
      pathname: '/camera',
      params: {
        id: String(threadId),
        kind: threadKind,
        otherUserId: otherUserId != null ? String(otherUserId) : '',
      },
    });
  };

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View
        pointerEvents={attachOpen ? 'auto' : 'none'}
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: wuzyLayout.control + 10,
            alignItems: 'center',
          },
          sheetStyle,
        ]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            width: '100%',
            backgroundColor: wuzyColors.surface,
            borderColor: wuzyColors.surfaceBorder,
            borderWidth: 1,
            borderRadius: 24,
            padding: wuzyLayout.itemGap,
          }}>
          <GlassNavButton icon="camera-outline" tintColor={wuzyColors.yellowDim} onPress={openCamera} accessibilityLabel="Camera" />
          <GlassNavButton icon="images-outline" tintColor={wuzyColors.yellowDim} onPress={onOpenGallery} accessibilityLabel="Gallery" />
          <GlassNavButton
            icon="location-outline"
            tintColor={wuzyColors.yellowDim}
            onPress={() => onAttachOpenChange(false)}
            accessibilityLabel="Location"
          />
          <GlassNavButton
            icon="calendar-outline"
            tintColor={wuzyColors.yellowDim}
            onPress={() => onAttachOpenChange(false)}
            accessibilityLabel="Calendar"
          />
        </View>
      </Animated.View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap,
          height: wuzyLayout.control,
          paddingHorizontal: 16,
          backgroundColor: '#3B3A2D',
          borderRadius: 9999,
        }}>
        <Ionicons name="happy-outline" size={iconSize} color={wuzyColors.white} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={wuzyColors.gray}
          style={{
            flex: 1,
            minWidth: 0,
            alignSelf: 'stretch',
            textAlignVertical: 'center',
            fontSize: wuzyType.body,
            color: wuzyColors.white,
            fontFamily: wuzyFonts.bold,
            letterSpacing: 0.15,
            paddingVertical: 0,
          }}
        />
        <Animated.View
          style={[{ flexDirection: 'row', alignItems: 'center', gap, overflow: 'hidden' }, iconsStyle]}>
          <Pressable
            onPress={() => onAttachOpenChange(!attachOpen)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Attach"
            style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="attach-outline" size={iconSize} color={wuzyColors.white} />
          </Pressable>
          <Ionicons name="mic-outline" size={iconSize} color={wuzyColors.white} />
        </Animated.View>
        <Animated.View style={[{ alignItems: 'flex-end', overflow: 'hidden' }, sendStyle]}>
          <Pressable
            onPress={() => {
              const trimmed = text.trim();
              if (trimmed) onSend?.(trimmed);
              setText('');
            }}
            accessibilityRole="button"
            accessibilityLabel="Send"
            style={{
              width: sendSize,
              height: sendSize,
              borderRadius: sendSize / 2,
              backgroundColor: wuzyColors.yellowMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="send" size={Math.round(sendSize * 0.5)} color={wuzyColors.bg} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}