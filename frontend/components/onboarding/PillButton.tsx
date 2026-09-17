import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  /** filled: glass (Next). dark: heavier glass scrim (welcome Login). outline: yellow border. solid: yellow fill, the selected state. */
  variant?: 'filled' | 'outline' | 'solid' | 'dark';
  width?: number;
  /** 44 on the signup pages; welcome and login use the Figma 250 x 55 pill. */
  height?: number;
  disabled?: boolean;
  busy?: boolean;
}

/** The onboarding pill. filled and dark are a GlassNavButton stretched to a pill, so Next shares the back arrow's glass. */
export function PillButton({ label, onPress, variant = 'filled', width = 238, height = wuzyLayout.control, disabled, busy }: PillButtonProps) {
  const off = disabled || busy;
  const color = variant === 'solid' ? '#000000' : variant === 'outline' ? wuzyColors.yellow : wuzyColors.white;
  const content = busy ? (
    <ActivityIndicator size="small" color={color} />
  ) : (
    <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.body, color }}>{label}</Text>
  );

  if (variant === 'filled' || variant === 'dark') {
    return (
      <View style={{ opacity: off ? 0.5 : 1 }}>
        <GlassNavButton
          onPress={off ? () => {} : onPress}
          accessibilityLabel={label}
          tintColor={variant === 'dark' ? 'rgba(0, 0, 0, 0.72)' : 'rgba(0, 0, 0, 0.4)'}
          style={{ width, height }}>
          {content}
        </GlassNavButton>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off }}
      className="active:scale-95"
      style={{
        width,
        height,
        borderRadius: height / 2,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: off ? 0.5 : 1,
        backgroundColor: variant === 'solid' ? wuzyColors.yellow : 'transparent',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: wuzyColors.yellow,
      }}>
      {content}
    </Pressable>
  );
}
