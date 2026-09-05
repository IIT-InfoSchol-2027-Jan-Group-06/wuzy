import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { wuzyColors } from '@/constants/wuzy-theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Montserrat_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-wuzy-bg">
        <ActivityIndicator color={wuzyColors.yellow} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, backgroundColor: '#0A0F17' }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="event-details" options={{ headerShown: false }} />
            <Stack.Screen name="connect" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="ticket" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}