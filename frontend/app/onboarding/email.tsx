import { useRouter } from 'expo-router';

import { FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { useOnboarding } from './_layout';

export default function EmailScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();

  return (
    <OnboardingBackdrop title="Enter your email?" subtitle="We'll send a code to verify it's you">
      <FormInput
        placeholder="Email"
        value={data.email}
        onChangeText={(text) => setField('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PillButton label="Next" onPress={() => data.email.trim() && router.push('/onboarding/code')} />
    </OnboardingBackdrop>
  );
}
