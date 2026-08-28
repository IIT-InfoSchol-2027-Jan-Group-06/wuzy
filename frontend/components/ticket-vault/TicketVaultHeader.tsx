import { Text, View } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

interface TicketVaultHeaderProps {
  screenWidth: number;
  backButtonSize: number;
  onBack: () => void;
}

export function TicketVaultHeader({
  screenWidth,
  backButtonSize,
  onBack,
}: TicketVaultHeaderProps) {
  return (
    <View className="flex-row items-center px-[24px] pt-[20px] pb-[16px]">
      <GlassNavButton
        icon="arrow-back"
        size={backButtonSize}
        onPress={onBack}
      />
      <Text
        className="flex-1 text-center select-none font-bold uppercase"
        style={{
          fontFamily: wuzyFonts.bold,
          fontSize: Math.round(screenWidth * 0.056),
          letterSpacing: 4,
          color: wuzyColors.yellow,
        }}
      >
        TICKETS
      </Text>
      <View style={{ width: backButtonSize }} />
    </View>
  );
}
