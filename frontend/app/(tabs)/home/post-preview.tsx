import { Pressable, Text, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts } from '@/constants/wuzy-theme';
import { Ionicons } from '@expo/vector-icons';

export default function PostPreviewScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        <View className="flex-row items-center justify-between px-6 pt-6">
          <GlassNavButton
            icon="arrow-back"
            onPress={() => router.back()}
            className="absolute top-6 left-6 z-50"
          />
          <Text
            className="text-[28px] leading-[28px] text-wuzy-yellow"
            style={{ fontFamily: wuzyFonts.display }}>
            NEW POST
          </Text>
          <Pressable
            onPress={() => {
              console.log('Post uploaded:', imageUri);
              router.replace('/(tabs)/home');
            }}
            className="absolute top-6 right-6 px-4 py-2 rounded-full bg-wuzy-yellow">
            <Text
              className="text-wuzy-bg"
              style={{ fontFamily: wuzyFonts.semibold, fontSize: 14 }}>
              Post
            </Text>
          </Pressable>
        </View>

        <View className="flex-1 px-6">
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              className="w-full aspect-[4/3] rounded-[24px]"
              resizeMode="cover"
              style={{ marginTop: 16 }}
            />
          )}

          <View className="mt-6 flex-row items-start gap-4">
            <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center flex-shrink-0">
              <Ionicons name="person-outline" size={24} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <View
                className="bg-white/5 rounded-[16px] p-4 min-h-[120px]"
                style={{ borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }}>
                <Text
                  className="text-white"
                  style={{ fontFamily: wuzyFonts.regular, fontSize: 16, lineHeight: 24 }}
                  placeholder="What's happening?"
                  placeholderTextColor="#8A96A6"
                />
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <TouchableOpacity className="p-2">
                <Ionicons name="location-outline" size={24} color="#FFE783" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Ionicons name="people-outline" size={24} color="#FFE783" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Ionicons name="hashtag-outline" size={24} color="#FFE783" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}