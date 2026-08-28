import { useRouter } from 'expo-router';

import { FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { useOnboarding } from './_layout';

export default function NameScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();

  return (
    <OnboardingBackdrop title="Enter your name?" subtitle="This is how you'll appear on Wuzy">
      <FormInput placeholder="Full Name" value={data.name} onChangeText={(text) => setField('name', text)} />
      <PillButton label="Next" onPress={() => data.name.trim() && router.push('/onboarding/username')} />
    </OnboardingBackdrop>
  );
}
