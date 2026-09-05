import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyColors, wuzyFonts, wuzyLayout } from '@/constants/wuzy-theme';
import { useResponsive } from '@/hooks/useResponsive';

function SettingRow({
  icon,
  label,
  onPress,
  showChevron = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  const { fontSize } = useResponsive();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-between py-[12px] active:opacity-70"
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}>
      <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
        <Ionicons name={icon} size={22} color={wuzyColors.white} />
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('body'), color: wuzyColors.white }}>{label}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={18} color={wuzyColors.gray} />}
    </Pressable>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { fontSize } = useResponsive();
  return (
    <View className="flex-row items-center justify-between py-[12px]">
      <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
        <Ionicons name={icon} size={22} color={wuzyColors.white} />
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: fontSize('body'), color: wuzyColors.white }}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: wuzyColors.surface, true: wuzyColors.yellowDim }}
        thumbColor={value ? wuzyColors.yellow : wuzyColors.gray}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { fontSize } = useResponsive();
  return (
    <View>
      <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: fontSize('small'), color: wuzyColors.yellow }}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <Screen scroll style={{ flexGrow: 1, justifyContent: 'space-between', gap: wuzyLayout.gap }}>
      <View style={{ gap: wuzyLayout.gap }}>
        <ScreenHeader title="Settings" />

        <Section title="Account center">
          <SettingRow icon="person-circle-outline" label="Personal information" />
          <SettingRow icon="videocam-outline" label="Subscriptions" />
          <SettingRow icon="shield-outline" label="Security" />
        </Section>

        <Section title="Notifications and preferences">
          <ToggleRow icon="notifications-outline" label="Push notifications" value={pushNotifications} onValueChange={setPushNotifications} />
          <ToggleRow icon="mail-outline" label="Email updates" value={emailUpdates} onValueChange={setEmailUpdates} />
        </Section>
      </View>

      <Section title="Account">
        <SettingRow icon="log-out-outline" label="Log out" showChevron={false} />
      </Section>
    </Screen>
  );
}
