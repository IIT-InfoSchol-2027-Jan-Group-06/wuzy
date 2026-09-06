import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

export function MessageBar({ onSend }: { onSend?: (text: string) => void }) {
  const { screenWidth } = useResponsive();
  const scale = screenWidth / 375;

  const iconSize = Math.round(20 * scale);
  const gap = Math.round(12 * scale);
  const sendSize = Math.round(36 * scale);

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

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap,
        height: Math.round(55 * scale),
        paddingHorizontal: Math.round(18 * scale),
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
          fontSize: Math.round(screenWidth * wuzyType.body),
          color: wuzyColors.white,
          fontFamily: wuzyFonts.bold,
          letterSpacing: 0.15,
          paddingVertical: 0,
        }}
      />
      <Animated.View
        style={[{ flexDirection: 'row', alignItems: 'center', gap, overflow: 'hidden' }, iconsStyle]}>
        <Ionicons name="attach-outline" size={iconSize} color={wuzyColors.white} />
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
  );
}
