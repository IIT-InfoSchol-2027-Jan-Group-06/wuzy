import { useRouter } from 'expo-router';

import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';

export default function ChooseExperienceScreen() {
  const router = useRouter();
  return (
    <OnboardingBackdrop title={'Choose your Wuzy\nexperience'} subtitle="Organizer accounts are coming soon">
      <PillButton label="Individual" variant="outline" onPress={() => router.push('/onboarding/email')} />
      <PillButton label="Organization" variant="outline" onPress={() => {}} disabled />
    </OnboardingBackdrop>
  );
}
