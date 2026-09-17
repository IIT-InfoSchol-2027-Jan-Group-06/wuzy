import { Button, StyleSheet, Text, View } from 'react-native';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.popup}>
        <Text style={styles.popupTitle}>Delete Profile?</Text>
        <Text style={styles.popupMessage}>
          Are you sure you want to delete your profile? This action cannot be undone.
        </Text>
        <View style={styles.buttons}>
          <Button title="No" onPress={onClose} />
          <Button title="Yes" onPress={onDelete} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: 300,
    backgroundColor: wuzyColors.surface,
    borderRadius: wuzyLayout.glass,
    padding: wuzyLayout.gap,
    alignItems: 'center',
  },
  popupTitle: {
    fontFamily: wuzyFonts.semibold,
    fontSize: wuzyType.title,
    color: wuzyColors.white,
    marginBottom: wuzyLayout.itemGap,
  },
  popupMessage: {
    fontFamily: wuzyFonts.body,
    fontSize: wuzyType.body,
    color: wuzyColors.gray,
    textAlign: 'center',
    marginBottom: wuzyLayout.gap * 2,
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
});