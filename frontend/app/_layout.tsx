import '../global.css';

import { DarkTheme, ThemeProvider } from 'expo-router/react-navigation';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
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

import { AuthProvider, useAuth } from '@/context/auth';
import { ChatUnreadProvider } from '@/context/chat-unread';
import { wuzyColors } from '@/constants/wuzy-theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <View className="flex-1 items-center justify-center bg-wuzy-bg">
        <ActivityIndicator color={wuzyColors.yellow} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0F17' }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="connect" />
          <Stack.Screen name="connections" />
          <Stack.Screen name="create-event" />
          <Stack.Screen name="new-group" />
          <Stack.Screen name="event-details" />
          <Stack.Screen name="post-preview" />
          <Stack.Screen name="profile/[id]" />
          <Stack.Screen name="ticket" />
          <Stack.Screen name="ticket-vault" />
          <Stack.Screen name="upload" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="light" />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
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
      <ThemeProvider value={DarkTheme}>
        <AuthProvider>
          <ChatUnreadProvider>
            <RootNavigator />
          </ChatUnreadProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}