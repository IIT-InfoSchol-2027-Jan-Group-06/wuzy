import { Stack } from 'expo-router';
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import type { Experience } from '@/constants/onboarding-data';

export interface OnboardingData {
  experience: Experience;
  email: string;
  code: string;
  name: string;
  username: string;
  birthday: Date | null;
  gender: string;
  password: string;
  interests: string[];
}

const emptyData: OnboardingData = {
  experience: 'individual',
  email: '',
  code: '',
  name: '',
  username: '',
  birthday: null,
  gender: '',
  password: '',
  interests: [],
};

const OnboardingContext = createContext<{
  data: OnboardingData;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
} | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside /onboarding');
  return ctx;
}

function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(emptyData);
  const setField: ReturnType<typeof useOnboarding>['setField'] = (key, value) =>
    setData((prev) => ({ ...prev, [key]: value }));

  return <OnboardingContext.Provider value={{ data, setField }}>{children}</OnboardingContext.Provider>;
}

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0F17' } }} />
    </OnboardingProvider>
  );
}
