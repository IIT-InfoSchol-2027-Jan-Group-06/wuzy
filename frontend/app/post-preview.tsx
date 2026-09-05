import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { Ionicons } from '@expo/vector-icons';
import { apiPost, uploadImage } from '@/lib/api';
import { getPendingPhoto } from '@/lib/media';
import { CURRENT_USER_ID } from '@/hooks/useFeed';

export default function PostPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string | string[] }>();
  const paramImageUri = Array.isArray(params.imageUri) ? params.imageUri[0] : params.imageUri;
  const imageUri = getPendingPhoto() ?? paramImageUri;
  const { width: screenWidth } = useWindowDimensions();

  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [saveToGrid, setSaveToGrid] = useState(false);
  const [sharing, setSharing] = useState(false);

  const cardWidth = screenWidth - 40;
  const cardHeight = Math.round(cardWidth * (418 / 335));

  const handlePost = async () => {
    if (!imageUri || sharing) return;
    try {
      setSharing(true);
      const { url } = await uploadImage('post', imageUri, CURRENT_USER_ID);
      await apiPost(
        '/posts/',
        {
          media_url: url,
          caption: caption || null,
          location: location || null,
          save_to_profile: saveToGrid,
        },
        CURRENT_USER_ID,
      );
      router.dismissAll();
    } catch (e) {
      console.error('Failed to share post:', e);
      setSharing(false);
    }
  };

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <GlassNavButton icon="arrow-back" onPress={() => router.back()} />
          <Text
            className="text-wuzy-yellow"
            style={{
              fontFamily: wuzyFonts.display,
              fontSize: screenWidth * 0.061,
            }}>
            NEW POST
          </Text>
          <Pressable onPress={handlePost} className="px-5 py-2 rounded-full bg-wuzy-yellow" disabled={sharing}>
            {sharing ? (
              <ActivityIndicator size="small" color="#0A0F17" />
            ) : (
              <Text
                className="text-wuzy-bg"
                style={{ fontFamily: wuzyFonts.semibold, fontSize: 14 }}>
                Share
              </Text>
            )}
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Image Preview - PostCard size */}
          {imageUri && (
            <View className="px-5 mt-2">
              <View
                className="rounded-3xl overflow-hidden"
                style={{ width: cardWidth, height: cardHeight }}>
                <Image
                  source={imageUri}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </View>
            </View>
          )}

          {/* Caption Area */}
          <View className="px-4 mt-4">
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center flex-shrink-0 mt-1">
                <Ionicons name="person-outline" size={20} color="#FFFFFF" />
              </View>
              <TextInput
                className="flex-1 text-white min-h-[80px]"
                style={{ fontFamily: wuzyFonts.body, fontSize: 16, lineHeight: 24 }}
                placeholder="Write a caption..."
                placeholderTextColor="#8A96A6"
                multiline
                textAlignVertical="top"
                value={caption}
                onChangeText={setCaption}
              />
            </View>
          </View>

          {/* Divider */}
          <View className="mx-4 mt-4 border-b border-white/10" />

          {/* Location */}
          <Pressable className="flex-row items-center px-4 py-4 gap-3">
            <Ionicons name="location-outline" size={22} color="#FFE783" />
            <TextInput
              className="flex-1 text-white"
              style={{ fontFamily: wuzyFonts.body, fontSize: 15 }}
              placeholder="Add location"
              placeholderTextColor="#8A96A6"
              value={location}
              onChangeText={setLocation}
            />
            {location.length > 0 && (
              <Pressable onPress={() => setLocation('')}>
                <Ionicons name="close-circle" size={20} color="#8A96A6" />
              </Pressable>
            )}
          </Pressable>

          {/* Divider */}
          <View className="mx-4 border-b border-white/10" />

          {/* Save to Profile Grid Toggle */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-3 flex-1">
              <Ionicons name="grid-outline" size={22} color="#FFE783" />
              <View className="flex-1">
                <Text
                  className="text-white"
                  style={{ fontFamily: wuzyFonts.medium, fontSize: 15 }}>
                  Save to Profile Grid
                </Text>
                <Text
                  className="text-wuzy-gray mt-0.5"
                  style={{ fontFamily: wuzyFonts.body, fontSize: 12 }}>
                  Keep this photo on your profile
                </Text>
              </View>
            </View>
            <Switch
              value={saveToGrid}
              onValueChange={setSaveToGrid}
              trackColor={{ false: '#2A2A2A', true: 'rgba(255, 231, 131, 0.4)' }}
              thumbColor={saveToGrid ? '#FFE783' : '#8A96A6'}
            />
          </View>

          <View className="h-10" />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
