import { FlatList, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { TicketCard } from '@/components/TicketCard';
import { tickets } from '@/constants/ticket-data';
import { wuzyColors } from '@/constants/wuzy-theme';

export default function TicketVaultScreen() {
  const { width: screenWidth } = useWindowDimensions();

  const cardGap = 16;
  const cardWidth = Math.round(screenWidth * 0.78);
  const sidePadding = Math.round((screenWidth - cardWidth) / 2);

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
        {/* Fixed header: glass back button on the left, yellow TICKETS centered */}
        <ScreenHeader title="TICKETS" />

        {/* Centered carousel with next-card peek on the right edge */}
        <View className="flex-1 justify-center">
          <FlatList
            horizontal
            data={tickets}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + cardGap}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: sidePadding,
              gap: cardGap,
              alignItems: 'center',
              paddingBottom: 24,
            }}
            renderItem={({ item }) => (
              <TicketCard ticket={item} width={cardWidth} />
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
