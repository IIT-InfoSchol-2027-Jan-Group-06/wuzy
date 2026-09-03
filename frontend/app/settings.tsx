import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/settings/SectionHeader';
import { SettingRow } from '@/components/settings/SettingRow';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { wuzyFonts, wuzyColors } from '@/constants/wuzy-theme';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1">
            <ScreenHeader title="Settings" />

            {/* Section 1: Account Center */}
            <View className="mb-6 px-[32px] mt-6">
              <SectionHeader title="Account Center" />
              <SettingRow
                icon="person-circle-outline"
                label="Personal Information"
              />
              <SettingRow
                icon="videocam-outline"
                label="Subscriptions"
              />
              <SettingRow
                icon="shield-outline"
                label="Security"
              />
            </View>

            {/* Section 2: Notifications & Preferences */}
            <View className="mt-6 mb-6 px-[32px]">
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
          <View className="pb-6 px-[32px]">
            <SectionHeader title="Account" />
            <SettingRow
              icon="log-out-outline"
              label="Logout"
              showChevron={false}
              iconColor="#E74C3C"
              labelColor="#E74C3C"
              onPress={() => setShowLogoutModal(true)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={5} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalBackdrop} />

          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { fontFamily: wuzyFonts.semibold }]}>
              Log out of your account?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowLogoutModal(false)}
              style={styles.logoutButton}
            >
              <Text style={[styles.logoutText, { fontFamily: wuzyFonts.semibold }]}>
Logout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowLogoutModal(false)}
              style={styles.cancelButton}
            >
              <Text style={[styles.cancelText, { fontFamily: wuzyFonts.medium }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: wuzyColors.bg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: wuzyColors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalCard: {
    width: '80%',
    backgroundColor: 'rgba(23, 30, 40, 0.95)',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    color: wuzyColors.white,
    textAlign: 'center',
    marginBottom: 28,
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
    fontSize: 16,
    color: '#E74C3C',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: wuzyColors.white,
  },
});