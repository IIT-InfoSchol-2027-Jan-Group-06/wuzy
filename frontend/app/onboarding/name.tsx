import { useRouter } from 'expo-router';

import { FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { useOnboarding } from './_layout';

export default function NameScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();
  const valid = data.name.trim().length > 0;
  const next = () => router.push('/onboarding/username');

  return (
    <OnboardingBackdrop title="Enter your name?" subtitle="This is how you'll appear on Wuzy">
      <FormInput
        placeholder="Full Name"
        value={data.name}
        onChangeText={(t) => setField('name', t)}
        autoCapitalize="words"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => valid && next()}
      />
      <PillButton label="Next" onPress={next} disabled={!valid} />
    </OnboardingBackdrop>
  );
}
