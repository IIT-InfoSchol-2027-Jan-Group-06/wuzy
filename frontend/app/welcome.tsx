import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingBackdrop background={require('@/assets/images/welcome-bg.jpg')} showBack={false} paddingBottom={108}>
      <View style={{ flex: 1 }} />
      <Text
        style={{
          textAlign: 'center',
          color: '#FFFAE4',
          fontFamily: wuzyFonts.medium,
          fontSize: wuzyType.body,
          letterSpacing: 0.16,
        }}>
        Every connection has a story
      </Text>
      <View style={{ gap: wuzyLayout.gap, alignItems: 'center' }}>
        <PillButton label="Get Started" width={250} height={55} onPress={() => router.push('/onboarding')} />
        <PillButton label="Login" variant="dark" width={250} height={55} onPress={() => router.push('/login')} />
      </View>
    </OnboardingBackdrop>
  );
}
