import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import type { PressableProps } from 'react-native';

export interface VisitButtonProps extends Omit<PressableProps, 'onPress' | 'style' | 'children'> {
  label?: string;
  onPress?: () => void;
  className?: string;
}

export function VisitButton({ label = 'visit', onPress, className = '', ...props }: VisitButtonProps) {
  const { width: screenWidth } = useWindowDimensions();
  const btnFontSize = Math.round(screenWidth * 0.032);
  const paddingH = Math.round(screenWidth * 0.06);
  const paddingV = Math.round(screenWidth * 0.022);

  return (
    <Pressable
      onPress={onPress}
      className={`bg-[#383A2E] px-6 py-2 rounded-full border border-[#50543B]/60 active:opacity-80 ${className}`}
      style={{
        paddingHorizontal: paddingH,
        paddingVertical: paddingV,
      }}
      {...props}
    >
      <Text style={{ color: '#FFFFFF', fontSize: btnFontSize, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}