import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavBar } from '@/components/nav-bar';

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-slate-100">
      <View className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-fuchsia-300/70" />
      <View className="absolute -left-20 top-52 h-56 w-56 rounded-full bg-amber-300/70" />
      <View className="absolute -right-10 bottom-24 h-48 w-48 rounded-full bg-teal-300/70" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-6">
          <Text className="text-3xl font-bold text-slate-900">Explore</Text>
        </View>
      </SafeAreaView>
      <NavBar active="events" />
    </View>
  );
}