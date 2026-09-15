import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';
import { View } from 'react-native';

import { wuzyColors } from '@/constants/wuzy-theme';

/** Full-screen gallery picker for the chat attach flow: launches the system
 * photo picker on mount, rendering an opaque backdrop behind the native UI.
 * On pick, resolves the asset's file URI and hands it to the caller. On
 * cancel, calls onClose. Both callbacks collapse the overlay and attach
 * sheet together (via closeGallery in the chat route). */
export function GalleryPopup({
  onSelect,
  onClose,
}: {
  /** Fires with the asset id and its resolved file URI for the send frame. */
  onSelect: (assetId: string, uri: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 1,
        });
        if (cancelled) return;
        if (result.canceled) {
          onClose();
        } else {
          const asset = result.assets[0];
          onSelect(asset.assetId ?? '', asset.uri);
        }
      } catch {
        onClose();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <View style={{ flex: 1, backgroundColor: wuzyColors.bg }} />;
}
