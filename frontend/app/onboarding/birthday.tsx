import { useState } from 'react';
import { Platform, Pressable, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';
import { useOnboarding } from './_layout';

const pad = (n: number) => String(n).padStart(2, '0');

function formatDate(date: Date) {
  return `${pad(date.getDate())} / ${pad(date.getMonth() + 1)} / ${date.getFullYear()}`;
}

function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function BirthdayScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { data, setField } = useOnboarding();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);

  const onChange = (_event: DateTimePickerEvent, date?: Date) => {
    setPickerOpen(false);
    if (date) setField('birthday', date);
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: data.birthday ?? new Date(2004, 0, 1),
        mode: 'date',
        maximumDate: new Date(),
        onChange,
      });
    } else {
      setPickerOpen(true);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <OnboardingBackdrop title="When is your birthday?">
        <input
          type="date"
          value={data.birthday ? toISODate(data.birthday) : ''}
          max={toISODate(new Date())}
          onChange={(e: { target: { value: string } }) =>
            setField('birthday', e.target.value ? new Date(`${e.target.value}T00:00:00`) : null)
          }
          style={{
            width: Math.round(screenWidth * 0.825),
            height: Math.round(screenWidth * 0.125),
            borderRadius: Math.round(screenWidth * 0.028),
            border: `1px solid ${wuzyColors.yellow}`,
            backgroundColor: 'rgba(179, 175, 160, 0.1)',
            color: wuzyColors.white,
            fontFamily: wuzyFonts.body,
            fontSize: Math.round(screenWidth * 0.039),
            textAlign: 'center',
            colorScheme: 'dark',
          }}
        />
        <PillButton label="Next" onPress={() => data.birthday && router.push('/onboarding/gender')} />
      </OnboardingBackdrop>
    );
  }

  return (
    <OnboardingBackdrop title="When is your birthday?">
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        style={{
          width: Math.round(screenWidth * 0.825),
          height: Math.round(screenWidth * 0.125),
          borderRadius: Math.round(screenWidth * 0.028),
          borderWidth: 1,
          borderColor: wuzyColors.yellow,
          backgroundColor: 'rgba(179, 175, 160, 0.1)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Math.round(screenWidth * 0.045),
        }}>
        <Ionicons name="calendar-outline" size={Math.round(screenWidth * 0.055)} color={wuzyColors.yellow} />
        <Text
          style={{
            fontFamily: wuzyFonts.body,
            fontSize: Math.round(screenWidth * 0.039),
            color: data.birthday ? wuzyColors.white : '#696969',
          }}>
          {data.birthday ? formatDate(data.birthday) : 'DD / MM / YYYY'}
        </Text>
        <Ionicons name="chevron-down" size={Math.round(screenWidth * 0.04)} color={wuzyColors.yellow} />
      </Pressable>

      {pickerOpen && (
        <DateTimePicker
          value={data.birthday ?? new Date(2004, 0, 1)}
          mode="date"
          display="spinner"
          themeVariant="dark"
          maximumDate={new Date()}
          onChange={onChange}
        />
      )}

      <PillButton label="Next" onPress={() => data.birthday && router.push('/onboarding/gender')} />
    </OnboardingBackdrop>
  );
}
