import { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';

import { TicketCard } from '@/components/TicketCard';
import { tickets, type Ticket } from '@/constants/ticket-data';

interface TicketCarouselProps {
  cardWidth: number;
  screenWidth: number;
  onIndexChange: (index: number) => void;
}

export function TicketCarousel({ cardWidth, screenWidth, onIndexChange }: TicketCarouselProps) {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardGap = 18;

  const itemTotalWidth = cardWidth + cardGap;
  const sidePadding = Math.max(0, (screenWidth - cardWidth) / 2);

  // Track which ticket is centered so the background can follow the active card.
  const commitIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, tickets.length - 1));
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
      onIndexChange(clamped);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / itemTotalWidth);
    if (index >= 0 && index < tickets.length) {
      onIndexChange(index);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / itemTotalWidth);
    commitIndex(index);
  };

  return (
    <View className="flex-1 justify-center py-[6px]">
      <FlatList
        ref={flatListRef}
        data={tickets}
        keyExtractor={(item: Ticket) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemTotalWidth}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          alignItems: 'center',
        }}
        ItemSeparatorComponent={() => <View style={{ width: cardGap }} />}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: itemTotalWidth,
          offset: itemTotalWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <TicketCard ticket={item} width={cardWidth} />
        )}
      />
    </View>
  );
}
