import { Modal, Text, View } from 'react-native';

import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View
          style={{
            width: 300,
            borderRadius: 20,
            padding: 20,
            gap: 14,
            backgroundColor: 'rgba(24, 24, 24, 0.92)',
            borderWidth: 1,
            borderColor: 'rgba(255, 231, 131, 0.12)',
          }}>
          <Text
            style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.yellow, textAlign: 'center' }}>
            {title}
          </Text>
          <Text
            style={{
              fontFamily: wuzyFonts.regular,
              fontSize: wuzyType.small,
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
            }}>
            {message}
          </Text>
          <View className="flex-row" style={{ gap: 10 }}>
            <GlassNavButton onPress={onCancel} style={{ flex: 1, height: wuzyLayout.control }}>
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                {cancelLabel}
              </Text>
            </GlassNavButton>
            <GlassNavButton onPress={onConfirm} style={{ flex: 1, height: wuzyLayout.control }}>
              <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
                {confirmLabel}
              </Text>
            </GlassNavButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}