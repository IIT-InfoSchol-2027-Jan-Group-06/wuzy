import { View } from 'react-native';

import { NavBar } from '@/components/nav-bar';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#000811]">
      <NavBar active="home" />
    </View>
  );
}
