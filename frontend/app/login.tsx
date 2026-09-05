import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { accounts } from '@/constants/accounts';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { useResponsive } from '@/hooks/useResponsive';

const AVATAR = 56;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { fontSize } = useResponsive();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e?: string, p?: string) => {
    const nextEmail = (e ?? email).trim();
    if (!nextEmail || !(p ?? password) || busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(nextEmail, p ?? password);
      router.replace('/(tabs)/home');
    } catch {
      setError('Invalid email or password');
    } finally {
      setBusy(false);
    }
  };

  const pickAccount = (a: (typeof accounts)[number]) => {
    setEmail(a.email);
    setPassword(a.password);
    setError(null);
  };

  const inputStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: wuzyLayout.itemGap,
    backgroundColor: wuzyColors.surface,
    borderWidth: 1,
    borderColor: wuzyColors.surfaceBorder,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, gap: wuzyLayout.gap }}>
          <View className="items-center" style={{ marginTop: wuzyLayout.gap * 2, gap: 4 }}>
            <Text style={{ fontFamily: wuzyFonts.display, fontSize: fontSize('display') * 2, color: wuzyColors.yellow }}>WUZY</Text>
            <Text style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('body'), color: wuzyColors.gray }}>log in to your social circle</Text>
          </View>

          <View style={{ gap: wuzyLayout.itemGap }}>
            <View style={inputStyle}>
              <Ionicons name="mail-outline" size={20} color={wuzyColors.gray} />
              <TextInput
                className="flex-1"
                style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('body'), color: wuzyColors.white, paddingVertical: 0 }}
                placeholder="Email"
                placeholderTextColor={wuzyColors.gray}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={inputStyle}>
              <Ionicons name="lock-closed-outline" size={20} color={wuzyColors.gray} />
              <TextInput
                className="flex-1"
                style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('body'), color: wuzyColors.white, paddingVertical: 0 }}
                placeholder="Password"
                placeholderTextColor={wuzyColors.gray}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={() => submit()}
                returnKeyType="go"
              />
            </View>

            {error && (
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('small'), color: wuzyColors.yellow }}>{error}</Text>
            )}

            <Pressable
              onPress={() => submit()}
              disabled={busy}
              accessibilityRole="button"
              className="items-center justify-center rounded-full active:opacity-80"
              style={{ height: 52, backgroundColor: busy ? wuzyColors.yellowDim : wuzyColors.yellow }}>
              {busy ? (
                <ActivityIndicator size="small" color={wuzyColors.bg} />
              ) : (
                <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('body'), color: wuzyColors.bg }}>Log in</Text>
              )}
            </Pressable>
          </View>

          <View style={{ gap: wuzyLayout.itemGap }}>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('section'), color: wuzyColors.yellow }}>Test accounts</Text>
            <Text style={{ fontFamily: wuzyFonts.body, fontSize: fontSize('small'), color: wuzyColors.gray }}>
              Tap an account to fill its credentials, then log in.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: wuzyLayout.gap, alignItems: 'flex-start' }}>
              {accounts.map((a) => (
                <Pressable key={a.username} onPress={() => pickAccount(a)} accessibilityRole="button" className="items-center" style={{ gap: 6 }}>
                  <View style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, borderWidth: 1, borderColor: wuzyColors.yellow, padding: 2 }}>
                    <Image source={a.avatar} style={{ width: '100%', height: '100%', borderRadius: AVATAR / 2 }} />
                  </View>
                  <Text style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('caption'), color: wuzyColors.white }}>{a.username}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}