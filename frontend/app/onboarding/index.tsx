import { useRouter } from 'expo-router';

import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import type { Experience } from '@/constants/onboarding-data';
import { useOnboarding } from './_layout';

const experiences: { id: Experience; label: string }[] = [
  { id: 'individual', label: 'Individual' },
  { id: 'organization', label: 'Organization' },
];

export default function ChooseExperienceScreen() {
  const { setField } = useOnboarding();
  const router = useRouter();

  const pick = (experience: Experience) => {
    setField('experience', experience);
    router.push('/onboarding/email');
  };

  return (
    <OnboardingBackdrop title={'Choose your Wuzy\nexperience'}>
      {experiences.map(({ id, label }) => (
        <PillButton key={id} label={label} variant="outline" onPress={() => pick(id)} />
      ))}
    </OnboardingBackdrop>
  );
}
