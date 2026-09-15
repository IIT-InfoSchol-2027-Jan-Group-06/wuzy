import { Image } from 'expo-image';
import { AssetField, MediaType, Query, usePermissions, type Asset } from 'expo-media-library';
import { type ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Chip } from '@/components/Chip';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';

/** Full-screen gallery picker for the chat attach flow: an opaque overlay that
 * covers the whole thread, a fixed X header above a scrollable three-column
 * grid of the device's photos (newest first). Tapping a photo resolves its
 * file URI and hands it to the caller, which compresses both popups on the spot
 * and pushes the send-gallery frame. */
export function GalleryPopup({
  onSelect,
  onClose,
}: {
  /** Fires with the asset id and its resolved file URI for the send frame. */
  onSelect: (assetId: string, uri: string) => void;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const [permission, requestPermission] = usePermissions({ granularPermissions: ['photo'] });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const gap = wuzyLayout.itemGap;
  const cell = Math.floor((width - wuzyLayout.side * 2 - gap * 2) / 3);

  useEffect(() => {
    if (permission == null) return;
    console.log(`[GalleryPopup] photo permission: ${permission.status}, granted=${permission.granted}`);
  }, [permission]);

  const requestAccess = async () => {
    const result = await requestPermission();
    console.log(`[GalleryPopup] permission request resolved: ${result.status}, granted=${result.granted}`);
  };

  useEffect(() => {
    if (permission?.granted !== true) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const photos = await new Query()
          .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
          .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
          .limit(200)
          .exe();
        console.log(`[GalleryPopup] loaded ${photos.length} photos`);
        if (!cancelled) setAssets(photos);
      } catch (e) {
        console.error('[GalleryPopup] failed to load photos:', e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [permission?.granted, reloadKey]);

  const retry = () => {
    setError(false);
    setReloadKey((k) => k + 1);
  };

  const pick = async (asset: Asset) => {
    try {
      // The grid renders the cheap contentUri; the send frame needs a real
      // file path to upload, resolved lazily on tap.
      onSelect(asset.id, await asset.getUri());
    } catch {
      // Ignore photos that cannot be resolved; the grid stays pickable.
    }
  };

  const centered = (children: ReactNode) => (
    <View className="flex-1 items-center justify-center" style={{ gap: wuzyLayout.itemGap, paddingHorizontal: wuzyLayout.gap }}>
      {children}
    </View>
  );

  const body = () => {
    // Still resolving permission: keep the spinner up briefly.
    if (permission == null) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={wuzyColors.yellow} />
        </View>
      );
    }
    // Denied or undetermined: never stick on loading, always offer a way out.
    if (permission.granted !== true) {
      return centered(
        <>
          <Text className="text-center text-wuzy-yellow" style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title }}>
            Photos access needed
          </Text>
          <Text className="text-center text-wuzy-gray" style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body }}>
            Allow photo access to pick pictures to send in chat.
          </Text>
          <View className="flex-row" style={{ gap: wuzyLayout.itemGap, marginTop: wuzyLayout.itemGap }}>
            <Chip label="Allow access" selected onPress={requestAccess} />
            <Chip label="Open settings" onPress={() => Linking.openSettings()} />
          </View>
        </>,
      );
    }
    if (error) {
      return centered(
        <>
          <Text className="text-center text-wuzy-yellow" style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title }}>
            Could not load photos
          </Text>
          <Text className="text-center text-wuzy-gray" style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body }}>
            Something went wrong reading your photo library.
          </Text>
          <View style={{ marginTop: wuzyLayout.itemGap }}>
            <Chip label="Try again" selected onPress={retry} />
          </View>
        </>,
      );
    }
    if (loading && assets.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={wuzyColors.yellow} />
        </View>
      );
    }
    if (assets.length === 0) {
      return (
        <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: wuzyLayout.gap }}>
          <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray }}>
            No photos on this device yet
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={assets}
        numColumns={3}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap }}
        contentContainerStyle={{ paddingHorizontal: wuzyLayout.side, paddingTop: wuzyLayout.top, paddingBottom: wuzyLayout.gap, gap }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => pick(item)}
            accessibilityRole="button"
            accessibilityLabel="Pick photo"
            className="active:opacity-80"
            style={{ width: cell, height: cell, borderRadius: 6, overflow: 'hidden' }}>
            <Image source={{ uri: item.id }} style={StyleSheet.absoluteFill} contentFit="cover" />
          </Pressable>
        )}
      />
    );
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: wuzyColors.bg }]}>
      {/* Fixed header, never part of the scrolling grid below it. */}
      <View style={{ paddingTop: wuzyLayout.top, paddingHorizontal: wuzyLayout.side }}>
        <View className="flex-row items-center justify-between" style={{ height: wuzyLayout.glass }}>
          <GlassNavButton icon="close" onPress={onClose} accessibilityLabel="Close gallery" />
          <View pointerEvents="none" className="absolute inset-x-0 items-center justify-center" style={{ height: wuzyLayout.glass }}>
            <Text
              style={{
                fontFamily: wuzyFonts.semibold,
                fontSize: wuzyType.section,
                color: wuzyColors.yellow,
                includeFontPadding: false,
              }}>
              GALLERY
            </Text>
          </View>
          <View style={{ width: wuzyLayout.glass, height: wuzyLayout.glass }} />
        </View>
      </View>
      <View style={{ flex: 1 }}>{body()}</View>
    </View>
  );
}