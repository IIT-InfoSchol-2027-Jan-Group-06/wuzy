import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Chip } from '@/components/Chip';
import { FormError } from '@/components/onboarding/FormInput';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { SearchBar } from '@/components/SearchBar';
import { interestOptions } from '@/constants/onboarding-data';
import { wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { apiSignup } from '@/lib/api';
import { toISODate } from './birthday';
import { useOnboarding } from './_layout';

export default function InterestsScreen() {
  const { data, setField } = useOnboarding();
  const { login } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const query = search.trim().toLowerCase();
  const visible = query ? interestOptions.filter((i) => i.toLowerCase().includes(query)) : interestOptions;

  const toggle = (interest: string) => {
    const on = data.interests.includes(interest);
    setField('interests', on ? data.interests.filter((i) => i !== interest) : [...data.interests, interest]);
  };

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiSignup({
        email: data.email.trim(),
        username: data.username,
        password: data.password,
        display_name: data.name.trim(),
        gender: data.gender,
        birthday: data.birthday ? toISODate(data.birthday) : null,
        hobbies: data.interests,
      });
      await login(data.email.trim(), data.password);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(false);
    }
  };

  return (
    <OnboardingBackdrop title="Select Your Interest">
      <View style={{ flex: 1, width: '100%', gap: wuzyLayout.itemGap }}>
        <SearchBar value={search} onChangeText={setSearch} />
        <Text style={{ color: '#FFEDA5', fontFamily: wuzyFonts.body, fontSize: wuzyType.small, letterSpacing: 0.14 }}>
          select your interest
        </Text>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {visible.map((interest) => (
              <Chip key={interest} label={interest} selected={data.interests.includes(interest)} onPress={() => toggle(interest)} />
            ))}
          </View>
        </ScrollView>
      </View>
      <FormError message={error} />
      <PillButton label="Finish" onPress={finish} busy={busy} />
    </OnboardingBackdrop>
  );
}
