import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { wuzyColors } from '@/constants/wuzy-theme';
import { useOnboarding } from './_layout';

const SIZE = 120;

export default function PhotoScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();

  const pick = async () => {
    const result = await launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setField('avatarUri', result.assets[0].uri);
  };

  return (
    <OnboardingBackdrop title="Add a profile picture" subtitle="You can change this later">
      <Pressable
        onPress={pick}
        accessibilityRole="button"
        accessibilityLabel="Choose a profile picture"
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: wuzyColors.yellow,
          backgroundColor: 'rgba(179, 175, 160, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {data.avatarUri ? (
          <Image source={{ uri: data.avatarUri }} contentFit="cover" style={{ width: SIZE, height: SIZE }} />
        ) : (
          <Ionicons name="camera-outline" size={40} color={wuzyColors.yellow} />
        )}
      </Pressable>
      <PillButton label={data.avatarUri ? 'Change photo' : 'Choose a photo'} variant="outline" onPress={pick} />
      <View style={{ flex: 1 }} />
      <PillButton label={data.avatarUri ? 'Next' : 'Skip for now'} onPress={() => router.push('/onboarding/interests')} />
    </OnboardingBackdrop>
  );
}
