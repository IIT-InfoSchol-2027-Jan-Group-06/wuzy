import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts } from '@/constants/wuzy-theme';

export default function TestButtonScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView className="flex-1">
        <GlassNavButton
          icon="arrow-back"
          onPress={() => router.back()}
          className="absolute top-6 left-6 z-50"
        />
        <View className="flex-1 items-center justify-center">
          <Text
            className="text-[24px] text-wuzy-yellow"
            style={{ fontFamily: wuzyFonts.display }}>
            Button Works!
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}