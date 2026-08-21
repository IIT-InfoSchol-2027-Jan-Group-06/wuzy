import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wuzyFonts } from '@/constants/wuzy-theme';

export default function ChatScreen() {
  return (
    <View className="flex-1 bg-[#000811]">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="px-[32px] pt-[49px]">
          <Text
            className="text-[32px] leading-[32px] text-wuzy-yellow"
            style={{ fontFamily: wuzyFonts.display }}>
            Wuzy
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>
          <View className="px-[32px]">
            <Text
              className="mt-[16px] text-[16px] text-wuzy-yellow"
              style={{ fontFamily: wuzyFonts.semibold }}>
              Chat
            </Text>
          </View>

          <View className="mt-[25px] items-center">
            <Text className="text-white" style={{ fontFamily: wuzyFonts.body }}>
              Chat screen coming soon
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}