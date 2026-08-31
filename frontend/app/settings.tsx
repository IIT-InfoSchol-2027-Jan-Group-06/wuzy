import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts, wuzyColors } from '@/constants/wuzy-theme';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  iconColor?: string;
  labelColor?: string;
  rightElement?: React.ReactNode;
}

function SettingsItem({ icon, label, onPress, showChevron = true, iconColor = wuzyColors.yellow, labelColor = '#FFFFFF', rightElement }: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.itemContainer}
      android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
    >
      <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
      <Text style={[styles.itemLabel, { color: labelColor }]}>{label}</Text>
      {rightElement ? (
        rightElement
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={20} color="#666666" />
      ) : null}
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  const { width: screenWidth } = useWindowDimensions();
  return (
    <Text
      style={[
        styles.sectionHeader,
        {
          fontSize: Math.round(screenWidth * 0.041),
          color: wuzyColors.yellow,
        },
      ]}
    >
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const backButtonSize = Math.round((42 / 375) * Math.min(screenWidth, 375));
  const headerFontSize = Math.round(Math.min(screenWidth, 375) * 0.061);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button and title */}
          <View style={[
            styles.header,
            { paddingTop: 49, paddingHorizontal: 32 },
          ]}>
            <GlassNavButton
              icon="arrow-back"
              size={backButtonSize}
              onPress={() => router.back()}
            />
            <Text
              style={[
                styles.headerTitle,
                { fontSize: headerFontSize },
              ]}>
              Settings
            </Text>
            <View style={{ width: backButtonSize }} />
          </View>

          {/* Section 1: Account Center */}
          <View style={styles.section}>
            <SectionHeader title="Account Center" />
            <View style={styles.sectionList}>
              <SettingsItem
                icon="person-outline"
                label="Personal Information"
                onPress={() => console.log('Personal Information pressed')}
              />
              <SettingsItem
                icon="card-outline"
                label="Subscriptions"
                onPress={() => console.log('Subscriptions pressed')}
              />
              <SettingsItem
                icon="shield-outline"
                label="Security"
                onPress={() => console.log('Security pressed')}
              />
            </View>
          </View>

          {/* Section 2: How you use WUZY */}
          <View style={styles.section}>
            <SectionHeader title="How you use WUZY" />
            <View style={styles.sectionList}>
              <SettingsItem
                icon="notifications-outline"
                label="Push Notifications"
                showChevron={false}
                rightElement={
                  <Switch
                    value={pushNotifications}
                    onValueChange={setPushNotifications}
                    trackColor={{ false: '#333333', true: wuzyColors.yellow }}
                    thumbColor={pushNotifications ? '#0A0F17' : '#FFFFFF'}
                    accessibilityLabel="Push Notifications"
                  />
                }
              />
              <SettingsItem
                icon="mail-outline"
                label="Email Updates"
                showChevron={false}
                rightElement={
                  <Switch
                    value={emailUpdates}
                    onValueChange={setEmailUpdates}
                    trackColor={{ false: '#333333', true: wuzyColors.yellow }}
                    thumbColor={emailUpdates ? '#0A0F17' : '#FFFFFF'}
                    accessibilityLabel="Email Updates"
                  />
                }
              />
            </View>
          </View>

          {/* Section 3: Account Actions */}
          <View style={styles.section}>
            <View style={styles.sectionList}>
              <SettingsItem
                icon="log-out-outline"
                label="Logout"
                showChevron={false}
                iconColor="#FFFFFF"
                labelColor="#FFFFFF"
                onPress={() => console.log('Logout pressed')}
              />
              <SettingsItem
                icon="trash-outline"
                label="Delete Account"
                showChevron={false}
                iconColor="#FF6B6B"
                labelColor="#FF6B6B"
                onPress={() => console.log('Delete Account pressed')}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F17',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F17',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: wuzyFonts.display,
    color: wuzyColors.yellow,
    flex: 1,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: wuzyFonts.bold,
    marginBottom: 12,
  },
  sectionList: {
    marginTop: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2B3545',
  },
  icon: {
    marginRight: 16,
  },
  itemLabel: {
    fontFamily: wuzyFonts.medium,
    fontSize: 15,
    flex: 1,
  },
});