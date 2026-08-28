import { useRouter } from 'expo-router';

import { FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { useOnboarding } from './_layout';

export default function UsernameScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();

  return (
    <OnboardingBackdrop title="Create a username" subtitle="You can change this later">
      <FormInput
        placeholder="username"
        value={data.username}
        onChangeText={(text) => setField('username', text)}
        autoCapitalize="none"
      />
      <PillButton label="Next" onPress={() => data.username.trim() && router.push('/onboarding/birthday')} />
    </OnboardingBackdrop>
  );
}
