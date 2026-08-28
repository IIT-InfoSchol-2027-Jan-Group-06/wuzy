import { useState } from 'react';
import { Pressable, Text, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

import { FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export default function LoginScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <OnboardingBackdrop background={require('@/assets/images/login-bg.jpg')}>
      <Text
        style={{
          alignSelf: 'flex-start',
          marginLeft: Math.round(screenWidth * 0.07),
          color: wuzyColors.yellow,
          fontFamily: wuzyFonts.semibold,
          fontSize: Math.round(screenWidth * 0.111),
          lineHeight: Math.round(screenWidth * 0.111),
          letterSpacing: 0.4,
        }}>
        {'Hey,\nWelcome\nBack'}
      </Text>
      <FormInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <Pressable onPress={() => {}}>
        <Text
          style={{
            color: '#AFA991',
            fontFamily: wuzyFonts.body,
            fontSize: Math.round(screenWidth * 0.044),
            letterSpacing: 0.16,
          }}>
          forgot password?
        </Text>
      </Pressable>
      <PillButton
        label="Login"
        onPress={() => email.trim() && password.trim() && router.replace('/(tabs)')}
      />
    </OnboardingBackdrop>
  );
}
