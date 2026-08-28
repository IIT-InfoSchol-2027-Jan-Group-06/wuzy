import { useRouter } from 'expo-router';

import { FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { useOnboarding } from './_layout';

export default function PasswordScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();

  const finish = () => {
    if (!data.password.trim()) return;
    if (data.experience === 'individual') router.push('/onboarding/interests');
    else router.replace('/(tabs)');
  };

  return (
    <OnboardingBackdrop title="Create a password">
      <FormInput
        placeholder="Password"
        value={data.password}
        onChangeText={(text) => setField('password', text)}
        secureTextEntry
        autoCapitalize="none"
      />
      <PillButton label="Next" onPress={finish} />
    </OnboardingBackdrop>
  );
}
