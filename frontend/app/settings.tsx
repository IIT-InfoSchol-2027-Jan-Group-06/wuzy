import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView as RNASafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts, wuzyColors } from '@/constants/wuzy-theme';

function SettingRow({ icon, label, onPress, showChevron = true, iconColor = wuzyColors.white, labelColor = wuzyColors.white }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  iconColor?: string;
  labelColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-between py-3.5"
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={22} color={iconColor} className="mr-4" />
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: 15, color: labelColor }}>{label}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={18} color="#8A919A" />}
    </Pressable>
  );
}

function ToggleRow({ icon, label, value, onValueChange, iconColor = wuzyColors.white }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-3.5">
      <View className="flex-row items-center gap-4">
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: 15, color: wuzyColors.white }}>{label}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        className={`w-12 h-6 rounded-full flex-row items-center px-1 ${
          value ? 'bg-[#F0CD6D] justify-end' : 'bg-[#3A3F47] justify-start'
        }`}
      >
        <View className="w-4 h-4 rounded-full bg-white" />
      </TouchableOpacity>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontFamily: wuzyFonts.semibold,
        fontSize: 14,
        color: '#F0CD6D',
      }}
      className="mb-3"
    >
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <View style={styles.container}>
      <RNASafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Container */}
          <View className="flex-1">
            {/* Header Section - Using GlassNavButton per DESIGN.md */}
            <View className="flex-row items-center mb-8 mt-2 px-6">
              <GlassNavButton
                icon="arrow-back"
                onPress={() => router.back()}
                className=""
              />
              <Text
                style={{
                  fontFamily: wuzyFonts.display,
                  fontSize: Math.round(375 * 0.061),
                  color: '#F0CD6D',
                }}
                className="flex-1 text-center"
              >
                Settings
              </Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Section 1: Account Center */}
            <View className="mb-6 px-6">
              <SectionHeader title="Account Center" />
              <SettingRow
                icon="person-circle-outline"
                label="Personal Information"
                onPress={() => console.log('Personal Information pressed')}
              />
              <SettingRow
                icon="videocam-outline"
                label="Subscriptions"
                onPress={() => console.log('Subscriptions pressed')}
              />
              <SettingRow
                icon="shield-outline"
                label="Security"
                onPress={() => console.log('Security pressed')}
              />
            </View>

            {/* Section 2: Notifications & Preferences */}
            <View className="mt-6 mb-6 px-6">
              <SectionHeader title="Notifications & Preferences" />
              <ToggleRow
                icon="notifications-outline"
                label="Push Notifications"
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
              <ToggleRow
                icon="mail-outline"
                label="Email Updates"
                value={emailUpdates}
                onValueChange={setEmailUpdates}
              />
            </View>
          </View>

          {/* Bottom Container - Account Section */}
          <View className="pb-6 px-6">
            <SectionHeader title="Account" />
            <SettingRow
              icon="log-out-outline"
              label="Logout"
              showChevron={false}
              iconColor={wuzyColors.white}
              labelColor={wuzyColors.white}
              onPress={() => console.log('Logout pressed')}
            />
          </View>
        </ScrollView>
      </RNASafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
});