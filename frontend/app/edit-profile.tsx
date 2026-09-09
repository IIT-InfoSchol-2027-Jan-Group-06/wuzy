import React, { useState } from 'react';
import {
  TextInput,
  Text,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';

export default function EditProfile() {
  const router = useRouter();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.display_name ?? user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [bioCount, setBioCount] = useState(0);
  const [bioOverLimit, setBioOverLimit] = useState(false);
  const [interests, setInterests] = useState(user?.hobbies ?? []);
  const [newInterest, setNewInterest] = useState('');
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const BIO_LIMIT = 150;

  const updateBioCount = (text: string) => {
    setBio(text);
    const count = text.length;
    setBioCount(count);
    if (count > BIO_LIMIT) {
      setBioOverLimit(true);
      setTimeout(() => setBioOverLimit(false), 1000);
    }
  };

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed === '') {
      setShowAddInterest(false);
      return;
    }
    setInterests([...interests, trimmed]);
    setNewInterest('');
    setShowAddInterest(false);
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(false);
    router.back();
  };

  const dismissDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const cancelEdit = () => {
    router.back();
  };

  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: wuzyColors.bg }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContainer}>
          {/* Dummy profile image at top - full width, 10% taller than the design, no padding/margin */}
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/avatar1.jpg')}
              style={styles.image}
            />
            <LinearGradient
              colors={['transparent', wuzyColors.bg]}
              locations={[0.8, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={[styles.glassButton, styles.backButton]}
            >
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.glassButtonFill} />
              <View style={styles.glassButtonBorder} />
              <Ionicons name="chevron-back" size={24} color={wuzyColors.white} />
            </Pressable>
            <View style={styles.editGroup}>
              <Text style={styles.editText}>Edit Profile</Text>
              <Pressable
                onPress={() => {}}
                accessibilityRole="button"
                accessibilityLabel="Change photo"
                style={[styles.glassButton, styles.pencilButton]}
              >
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.glassButtonFill} />
                <View style={styles.glassButtonBorder} />
                <Ionicons name="create" size={25} color={wuzyColors.yellow} />
              </Pressable>
            </View>
          </View>

          {/* FULL NAME section with padding */}
          <View style={styles.section}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          {/* BIO section with padding */}
          <View style={styles.section}>
            <Text style={styles.label}>Bio</Text>
            <View style={styles.bioWrapperStyle}>
              <TextInput
                style={styles.bioInputStyle}
                value={bio}
                onChangeText={updateBioCount}
                placeholder="Tell people about yourself..."
                autoCapitalize="sentences"
                multiline
                maxLength={BIO_LIMIT}
              />
              <View style={styles.bioCountStyle}>
                <Text style={[
                  styles.bioCountTextStyle,
                  bioOverLimit && styles.bioCountTextRedStyle,
                ]}>{bioCount}/{BIO_LIMIT}</Text>
              </View>
            </View>
          </View>

          {/* INTERESTS section with padding */}
          <View style={styles.section}>
            <Text style={styles.label}>Interests</Text>
            <View style={styles.interestContainer}>
              {interests.map((interest, index) => (
                <View key={index} style={styles.interestPill}>
                  <Text style={styles.interestPillText}>{interest}</Text>
                  <Pressable
                    onPress={() => removeInterest(interest)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${interest}`}
                  >
                    <Ionicons name="close" size={12} color={wuzyColors.gray} />
                  </Pressable>
                </View>
              ))}
              {showAddInterest ? (
                <TextInput
                  style={styles.addInterestInputStyle}
                  value={newInterest}
                  onChangeText={setNewInterest}
                  placeholder="Add an interest..."
                  autoCapitalize="none"
                  onSubmitEditing={addInterest}
                />
              ) : (
                <Pressable
                  style={styles.addChipButtonStyle}
                  onPress={() => setShowAddInterest(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add interest"
                >
                  <Text style={styles.addChipTextStyle}>+ Add interest</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Bottom buttons - vertically stacked, centered */}
          <View style={styles.buttonGroup}>
            <Pressable
              onPress={router.back}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              style={[styles.glassButton, styles.saveButton]}
            >
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.glassButtonFill} />
              <View style={styles.glassButtonBorder} />
              <Text style={styles.buttonTextStyle}>Save changes</Text>
            </Pressable>
            <Pressable
              onPress={cancelEdit}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={[styles.glassButton, styles.cancelButton]}
            >
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.glassButtonFill} />
              <View style={styles.glassButtonBorder} />
              <Text style={styles.buttonTextStyle}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button" accessibilityLabel="Delete account">
              <Text style={styles.deleteButtonText}>Delete account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={showDeleteConfirmation}
        animationType="fade"
        onRequestClose={dismissDelete}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>Are you sure, you want to Delete this Account?</Text>
            <View style={styles.modalButtonRow}>
              <Pressable style={styles.modalYesButton} onPress={confirmDelete}>
                <Text style={styles.modalYesText}>Yes</Text>
              </Pressable>
              <Pressable style={styles.modalNoButton} onPress={dismissDelete}>
                <Text style={styles.modalNoText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
  },
  mainContainer: {
    flex: 1,
    // No side or top gutter: the image sits flush at the frame edge
  },
  imageContainer: {
    // Full-bleed image at top - 400 wide, 10% taller than the design spec
    width: '100%',
    height: 405.68,
    backgroundColor: 'transparent',
    marginBottom: 0,
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    // Image fills container, full width over the negative margins
    width: '100%',
    height: 405.68,
    resizeMode: 'cover',
  },
  // Liquid glass pill, matches the Edit profile / Connections buttons in profile.tsx
  glassButton: {
    borderRadius: 9999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassButtonFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(244, 196, 0, 0.1)',
  },
  glassButtonBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    // Liquid glass back button over the image, same top/left as the connections page header
    position: 'absolute',
    left: wuzyLayout.side,
    top: wuzyLayout.top + 35,
    width: wuzyLayout.glass,
    height: wuzyLayout.glass,
  },
  editGroup: {
    // Edit Profile title + pencil grouped over the bottom of the image
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editText: {
    fontFamily: wuzyFonts.semibold,
    fontSize: 25,
    color: wuzyColors.yellow,
    letterSpacing: 0.7,
  },
  pencilButton: {
    width: 44,
    height: 44,
  },
  section: {
    marginBottom: wuzyLayout.gap,
    // 16px side gutters for the form content between the image and the buttons
    paddingHorizontal: 16,
  },
  label: {
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.small,
    color: wuzyColors.gray,
    marginBottom: wuzyLayout.itemGap,
  },
  input: {
    height: wuzyLayout.control,
    backgroundColor: wuzyColors.surface,
    borderRadius: wuzyLayout.control / 2,
    paddingHorizontal: 16,
    color: wuzyColors.white,
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.body,
  },
  bioInputStyle: {
    minHeight: 120,
    backgroundColor: wuzyColors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: wuzyColors.white,
    textAlignVertical: 'top',
    fontFamily: wuzyFonts.body,
    fontSize: wuzyType.body,
  },
  bioWrapperStyle: {
    position: 'relative',
  },
  bioCountStyle: {
    position: 'absolute',
    bottom: 1,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wuzyLayout.itemGap,
  },
  bioCountTextStyle: {
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.small,
    color: wuzyColors.gray,
  },
  bioCountTextRedStyle: {
    color: '#FF0000',
  },
  interestContainer: {
    // Interest pills laid out in a wrap row on the frame background, no border
    backgroundColor: wuzyColors.bg,
    borderRadius: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: wuzyLayout.itemGap,
  },
  interestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: wuzyColors.yellow,
    backgroundColor: wuzyColors.yellowDim,
  },
  interestPillText: {
    color: wuzyColors.yellow,
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.small,
  },
  addChipButtonStyle: {
    height: wuzyLayout.control,
    backgroundColor: wuzyColors.bg,
    borderRadius: wuzyLayout.control / 2,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: wuzyColors.yellowDim,
  },
  addChipTextStyle: {
    color: wuzyColors.gray,
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.small,
    marginRight: 8,
  },
  addInterestInputStyle: {
    height: wuzyLayout.control,
    backgroundColor: wuzyColors.surface,
    borderRadius: wuzyLayout.control / 2,
    paddingHorizontal: 16,
    color: wuzyColors.white,
    marginTop: wuzyLayout.itemGap,
    flex: 1,
    fontFamily: wuzyFonts.body,
    fontSize: wuzyType.body,
  },
  // Button group - vertically stacked at bottom of frame
  buttonGroup: {
    // Natural in-flow layout at end of scrollable content
    // paddingBottom so not flush against screen edge
    paddingBottom: 30,
    // Vertically stack buttons with center alignment
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  // Glass Save changes pill
  saveButton: {
    width: 240,
    height: 50,
  },
  // Glass Cancel pill
  cancelButton: {
    width: 240,
    height: 50,
  },
  // Delete account - plain red text, no background, no padding
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 6,
    // Extra 20% on top of the 12px group gap, so Delete sits further from Cancel
    marginTop: 2,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.small,
    letterSpacing: 1.4,
  },
  buttonTextStyle: {
    color: wuzyColors.white,
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.body,
  },
  // Delete confirmation popup
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: 301,
    height: 187,
    backgroundColor: 'rgba(8, 21, 30, 0.95)',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalText: {
    fontFamily: wuzyFonts.medium,
    fontSize: wuzyType.small,
    lineHeight: 16,
    textAlign: 'center',
    color: wuzyColors.white,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalYesButton: {
    width: 100,
    height: 40,
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalYesText: {
    color: wuzyColors.white,
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.small,
  },
  modalNoButton: {
    width: 100,
    height: 40,
    backgroundColor: 'rgba(255, 231, 131, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNoText: {
    color: wuzyColors.white,
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.small,
  },
});