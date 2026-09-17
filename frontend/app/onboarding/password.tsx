import { useRouter } from 'expo-router';

import { FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { useOnboarding } from './_layout';

export default function PasswordScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();
  const valid = data.password.length >= 8;
  const next = () => router.push('/onboarding/interests');

  return (
    <OnboardingBackdrop title="Create a password" subtitle="At least 8 characters">
      <FormInput
        placeholder="Password"
        value={data.password}
        onChangeText={(t) => setField('password', t)}
        secureTextEntry
        autoCapitalize="none"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => valid && next()}
      />
      <PillButton label="Next" onPress={next} disabled={!valid} />
    </OnboardingBackdrop>
  );
}
