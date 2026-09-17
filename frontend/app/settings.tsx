import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';

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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-between py-[12px] active:opacity-70"
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}>
      <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
        <Ionicons name={icon} size={22} color={wuzyColors.white} />
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.white }}>{label}</Text>
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
  return (
    <View className="flex-row items-center justify-between py-[12px]">
      <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap }}>
        <Ionicons name={icon} size={22} color={wuzyColors.white} />
        <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.white }}>{label}</Text>
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
  return (
    <View>
      <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

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
        <SettingRow
          icon="log-out-outline"
          label="Log out"
          showChevron={false}
          onPress={() => setShowLogoutModal(true)}
        />
      </Section>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log out of your account?</Text>

            <Pressable
              onPress={handleLogout}
              accessibilityRole="button"
              style={styles.logoutButton}
              className="active:opacity-70"
            >
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowLogoutModal(false)}
              accessibilityRole="button"
              style={styles.cancelButton}
              className="active:opacity-70"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wuzyLayout.side,
    paddingVertical: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '100%',
    backgroundColor: wuzyColors.surface,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
  },
  modalTitle: {
    fontSize: wuzyType.section,
    color: wuzyColors.white,
    textAlign: 'center',
    marginBottom: wuzyLayout.gap,
    fontFamily: wuzyFonts.semibold,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: wuzyType.body,
    color: '#E74C3C',
    fontFamily: wuzyFonts.semibold,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: wuzyType.small,
    color: wuzyColors.white,
    fontFamily: wuzyFonts.medium,
  },
});