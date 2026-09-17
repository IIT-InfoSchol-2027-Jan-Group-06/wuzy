import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import { OnboardingBackdrop } from '@/components/onboarding/OnboardingBackdrop';
import { PillButton } from '@/components/onboarding/PillButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useOnboarding } from './_layout';

const pad = (n: number) => String(n).padStart(2, '0');
const DEFAULT = new Date(2004, 0, 1);

export function toISODate(date: Date) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// The FormInput box, as a row for the picker trigger.
const field = {
  width: '100%' as const,
  height: wuzyLayout.control,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: wuzyColors.yellow,
  backgroundColor: 'rgba(179, 175, 160, 0.1)',
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  paddingHorizontal: 16,
};

export default function BirthdayScreen() {
  const { data, setField } = useOnboarding();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const today = new Date();

  const onChange = (_e: DateTimePickerEvent, date?: Date) => {
    setPickerOpen(false);
    if (date) setField('birthday', date);
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: data.birthday ?? DEFAULT, mode: 'date', maximumDate: today, onChange });
    } else {
      setPickerOpen(true);
    }
  };

  const label = data.birthday
    ? `${pad(data.birthday.getDate())} / ${pad(data.birthday.getMonth() + 1)} / ${data.birthday.getFullYear()}`
    : 'DD / MM / YYYY';

  return (
    <OnboardingBackdrop title="When is your birthday?">
      {Platform.OS === 'web' ? (
        <View style={field}>
          <Ionicons name="calendar-outline" size={20} color={wuzyColors.yellow} />
          <input
            type="date"
            // Uncontrolled: a controlled value would clobber the field while the year is half typed.
            defaultValue={data.birthday ? toISODate(data.birthday) : ''}
            min="1900-01-01"
            max={toISODate(today)}
            // Browsers emit partial years (0002) while typing; only accept a real one.
            onChange={(e) => {
              const v = e.target.value;
              setField('birthday', /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= '1900' ? new Date(`${v}T00:00:00`) : null);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: wuzyColors.white,
              fontFamily: wuzyFonts.medium,
              fontSize: wuzyType.body,
              textAlign: 'center',
              colorScheme: 'dark',
            }}
          />
        </View>
      ) : (
        <Pressable onPress={openPicker} accessibilityRole="button" style={field}>
          <Ionicons name="calendar-outline" size={20} color={wuzyColors.yellow} />
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: data.birthday ? wuzyColors.white : '#C0BDB2' }}>
            {label}
          </Text>
          <Ionicons name="chevron-down" size={16} color={wuzyColors.yellow} />
        </Pressable>
      )}
      {pickerOpen && (
        <DateTimePicker value={data.birthday ?? DEFAULT} mode="date" display="spinner" themeVariant="dark" maximumDate={today} onChange={onChange} />
      )}
      <PillButton label="Next" onPress={() => router.push('/onboarding/gender')} disabled={!data.birthday} />
    </OnboardingBackdrop>
  );
}
