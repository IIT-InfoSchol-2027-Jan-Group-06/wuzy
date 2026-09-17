import { useState } from 'react';
import { useRouter } from 'expo-router';

import { FormError, FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { apiAvailability } from '@/lib/api';
import { useOnboarding } from './_layout';

// Mirrors the backend UserCreate.username rule.
const USERNAME = /^[a-z0-9_.]{3,20}$/;

export default function UsernameScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const valid = USERNAME.test(data.username);

  const next = async () => {
    setBusy(true);
    setError(null);
    try {
      const free = await apiAvailability({ username: data.username });
      if (!free.username) return setError('Username already taken');
      router.push('/onboarding/birthday');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingBackdrop title="Create a username" subtitle="You can change this later">
      <FormInput
        placeholder="username"
        value={data.username}
        onChangeText={(t) => setField('username', t.toLowerCase().trim())}
        autoCapitalize="none"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => valid && next()}
      />
      <FormError message={error} />
      <PillButton label="Next" onPress={next} disabled={!valid} busy={busy} />
    </OnboardingBackdrop>
  );
}
