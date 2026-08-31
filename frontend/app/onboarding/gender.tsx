import { View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { genderOptions } from '@/constants/onboarding-data';
import { useOnboarding } from './_layout';

export default function GenderScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { data, setField } = useOnboarding();
  const router = useRouter();

  return (
    <OnboardingBackdrop title="I am a">
      {genderOptions.map((option) => (
        <PillButton
          key={option}
          label={option}
          variant={data.gender === option ? 'solid' : 'outline'}
          onPress={() => setField('gender', option)}
        />
      ))}
      <View style={{ flex: 1, minHeight: Math.round(screenWidth * 0.05) }} />
      <PillButton label="Next" onPress={() => data.gender && router.push('/onboarding/password')} />
    </OnboardingBackdrop>
  );
}
