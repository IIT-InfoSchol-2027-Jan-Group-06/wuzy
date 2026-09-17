import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FormError, FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';

// Figma login frame: 250 x 55 fields, wider than the signup pages' full-width 45.
const field = { width: 250, height: 55 };

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const nextEmail = email.trim();
    if (!nextEmail || !password || busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(nextEmail, password);
      router.replace('/(tabs)/home');
    } catch {
      setError('Invalid email or password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingBackdrop background={require('@/assets/images/login-bg.jpg')} paddingBottom={124}>
      <Text
        style={{
          alignSelf: 'flex-start',
          color: wuzyColors.yellow,
          fontFamily: wuzyFonts.semibold,
          fontSize: wuzyType.display,
          lineHeight: wuzyType.display,
          letterSpacing: 0.4,
        }}>
        {'Hey,\nWelcome\nBack'}
      </Text>
      <View style={{ gap: 16 }}>
        <FormInput
          style={field}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
        <FormInput
          style={field}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </View>
      <Pressable onPress={() => {}} accessibilityRole="button">
        <Text style={{ color: '#AFA991', fontFamily: wuzyFonts.body, fontSize: wuzyType.body, letterSpacing: 0.16 }}>
          forgot password?
        </Text>
      </Pressable>
      <FormError message={error} />
      <PillButton label="Login" width={250} height={55} onPress={submit} busy={busy} disabled={!email.trim() || !password} />
      <Pressable onPress={() => router.push('/onboarding')} accessibilityRole="link">
        <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: '#AFA991' }}>
          New here? <Text style={{ fontFamily: wuzyFonts.semibold, color: wuzyColors.yellow }}>Create an account</Text>
        </Text>
      </Pressable>
    </OnboardingBackdrop>
  );
}
