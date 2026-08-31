import { useMemo, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

import { CategoryPill } from '@/components/CategoryFilter';
import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { SearchBar } from '@/components/SearchBar';
import { interestOptions } from '@/constants/onboarding-data';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { useOnboarding } from './_layout';

export default function InterestsScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { data, setField } = useOnboarding();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? interestOptions.filter((i) => i.toLowerCase().includes(query)) : interestOptions;
  }, [search]);

  const toggle = (interest: string) => {
    const selected = data.interests.includes(interest);
    setField(
      'interests',
      selected ? data.interests.filter((i) => i !== interest) : [...data.interests, interest]
    );
  };

  return (
    <OnboardingBackdrop title="Select Your Interest">
      <View style={{ width: Math.round(screenWidth * 0.835), gap: Math.round(screenWidth * 0.04) }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search" />
        <Text
          style={{
            color: '#FFEDA5',
            fontFamily: wuzyFonts.body,
            fontSize: Math.round(screenWidth * 0.039),
            letterSpacing: 0.14,
          }}>
          select your interest
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {visible.map((interest) => (
            <CategoryPill
              key={interest}
              label={interest}
              selected={data.interests.includes(interest)}
              onPress={() => toggle(interest)}
            />
          ))}
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <PillButton label="Next" onPress={() => router.replace('/(tabs)')} />
    </OnboardingBackdrop>
  );
}
