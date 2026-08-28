import { Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { wuzyFonts } from '@/constants/wuzy-theme';

export default function WelcomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  return (
    <OnboardingBackdrop background={require('@/assets/images/welcome-bg.jpg')} showBack={false}>
      <View style={{ flex: 1 }} />
      <Text
        style={{
          textAlign: 'center',
          color: '#FFFAE4',
          fontFamily: wuzyFonts.medium,
          fontSize: Math.round(screenWidth * 0.044),
          letterSpacing: 0.16,
        }}>
        Every connection has a story
      </Text>
      <View style={{ gap: Math.round(screenWidth * 0.05), alignItems: 'center' }}>
        <PillButton
          label="Get Started"
          width={Math.round(screenWidth * 0.6)}
          onPress={() => router.push('/onboarding')}
        />
        <PillButton
          label="Login"
          variant="dark"
          width={Math.round(screenWidth * 0.6)}
          onPress={() => router.push('/login')}
        />
      </View>
    </OnboardingBackdrop>
  );
}
