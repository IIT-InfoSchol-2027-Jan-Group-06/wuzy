import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { apiPost, uploadImage } from '@/lib/api';
import { getPendingPhoto } from '@/lib/media';

export default function PostPreviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ imageUri?: string | string[] }>();
  const paramImageUri = Array.isArray(params.imageUri) ? params.imageUri[0] : params.imageUri;
  const imageUri = getPendingPhoto() ?? paramImageUri;

  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [saveToGrid, setSaveToGrid] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handlePost = async () => {
    if (!imageUri || sharing || !user) return;
    try {
      setSharing(true);
      const { url } = await uploadImage('post', imageUri);
      await apiPost('/posts/', {
        media_url: url,
        caption: caption || null,
        location: location || null,
        save_to_profile: saveToGrid,
      });
      router.dismissAll();
    } catch (e) {
      console.error('Failed to share post:', e);
      setSharing(false);
    }
  };

  const sharePill = (
    <Pressable
      onPress={handlePost}
      disabled={sharing}
      accessibilityRole="button"
      className="items-center justify-center rounded-full px-[16px] active:opacity-80"
      style={{ height: 36, minWidth: 72, backgroundColor: wuzyColors.yellow }}>
      {sharing ? (
        <ActivityIndicator size="small" color={wuzyColors.bg} />
      ) : (
        <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.bg }}>Share</Text>
      )}
    </Pressable>
  );

  const rowText = { fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.white };
  const divider = { borderBottomWidth: 1, borderBottomColor: wuzyColors.glassBorder };

  return (
    <Screen>
      <ScreenHeader title="New post" right={sharePill} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingVertical: wuzyLayout.gap, gap: wuzyLayout.itemGap }}>
          {imageUri && (
            <View style={{ width: '100%', aspectRatio: 335 / 418, borderRadius: 24, overflow: 'hidden' }}>
              <Image source={imageUri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            </View>
          )}

          <View className="flex-row items-start" style={{ gap: wuzyLayout.itemGap, paddingVertical: wuzyLayout.itemGap, ...divider }}>
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: wuzyColors.yellowDim }}>
              <Ionicons name="person-outline" size={20} color={wuzyColors.white} />
            </View>
            <TextInput
              className="flex-1 min-h-[80px]"
              style={{ ...rowText, lineHeight: Math.round(wuzyType.body * 1.5), paddingTop: 8 }}
              placeholder="Write a caption"
              placeholderTextColor={wuzyColors.gray}
              multiline
              textAlignVertical="top"
              value={caption}
              onChangeText={setCaption}
            />
          </View>

          <View className="flex-row items-center" style={{ gap: wuzyLayout.itemGap, paddingVertical: wuzyLayout.itemGap, ...divider }}>
            <Ionicons name="location-outline" size={22} color={wuzyColors.yellow} />
            <TextInput
              className="flex-1"
              style={{ ...rowText, paddingVertical: 0 }}
              placeholder="Add location"
              placeholderTextColor={wuzyColors.gray}
              value={location}
              onChangeText={setLocation}
            />
            {location.length > 0 && (
              <Pressable onPress={() => setLocation('')} accessibilityLabel="Clear location">
                <Ionicons name="close-circle" size={20} color={wuzyColors.gray} />
              </Pressable>
            )}
          </View>

          <View className="flex-row items-center justify-between" style={{ gap: wuzyLayout.itemGap, paddingVertical: wuzyLayout.itemGap }}>
            <View className="flex-row items-center flex-1" style={{ gap: wuzyLayout.itemGap }}>
              <Ionicons name="grid-outline" size={22} color={wuzyColors.yellow} />
              <View className="flex-1">
                <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.white }}>Save to profile grid</Text>
                <Text style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>Keep this photo on your profile</Text>
              </View>
            </View>
            <Switch
              value={saveToGrid}
              onValueChange={setSaveToGrid}
              trackColor={{ false: wuzyColors.surface, true: wuzyColors.yellowDim }}
              thumbColor={saveToGrid ? wuzyColors.yellow : wuzyColors.gray}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
