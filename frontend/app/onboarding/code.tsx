import { useRouter } from 'expo-router';

import { FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { useOnboarding } from './_layout';

export default function CodeScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();

  return (
    <OnboardingBackdrop title="Enter the confirmation code" subtitle="We sent a code to your email">
      <FormInput
        placeholder="Confirmation code"
        value={data.code}
        onChangeText={(text) => setField('code', text)}
        keyboardType="number-pad"
      />
      <PillButton label="Next" onPress={() => data.code.trim() && router.push('/onboarding/name')} />
      <PillButton label="I didn't get the code" variant="outline" onPress={() => {}} />
    </OnboardingBackdrop>
  );
}
