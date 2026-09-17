import { useState } from 'react';
import { useRouter } from 'expo-router';

import { FormError, FormInput } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { apiAvailability } from '@/lib/api';
import { useOnboarding } from './_layout';

export default function EmailScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const email = data.email.trim();
  const valid = /^\S+@\S+\.\S+$/.test(email);

  const next = async () => {
    setBusy(true);
    setError(null);
    try {
      const free = await apiAvailability({ email });
      if (!free.email) return setError('Email already registered');
      router.push('/onboarding/name');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingBackdrop title="Enter your email?" subtitle="You'll log in with it">
      <FormInput
        placeholder="Email"
        value={data.email}
        onChangeText={(t) => setField('email', t)}
        keyboardType="email-address"
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
