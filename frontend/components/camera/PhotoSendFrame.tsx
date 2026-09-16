import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { CameraHeader } from '@/components/camera/CameraHeader';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { uploadImage } from '@/lib/api';
import { markThreadActive } from '@/lib/chat-activity';
import { getPendingReply, setPendingReply } from '@/lib/media';
import { sendDm, sendGroup } from '@/lib/ws';

// The Send button grew 40% in every dimension, then shrank 20%: 1.4 x 0.8 = 1.12x the original.
const SEND_SCALE = 1.12;

/** Send frame in the chat photo flow, shared by the camera and gallery paths:
 * the picture, a caption pill below it, and a Send button centered under the
 * pill. Sends the photo (plus caption in the same bubble) into the thread the
 * attach sheet opened from, then lets the route pop its own way back (the
 * camera flow dismisses the whole stack; the gallery flow just backs to the
 * picker). The picture is handed over out-of-band (lib/media.ts), the thread
 * target rides the route params, and the label is the header's caption. */
export function PhotoSendFrame({
  label,
  imageUri,
  onSent,
}: {
  label: string;
  imageUri: string | null;
  /** Called after the photo is uploaded and queued, so a route can pop back. */
  onSent: () => void;
}) {
  const { user } = useAuth();
  const { id, kind, otherUserId } = useLocalSearchParams<{ id?: string; kind?: string; otherUserId?: string }>();

  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);

  const viewport = { width: '100%' as const, maxWidth: 400, aspectRatio: 335 / 418, borderRadius: 24, overflow: 'hidden' as const };

  const handleSend = async () => {
    if (!imageUri || sending || !user) return;
    const threadId = Number(id);
    if (!Number.isFinite(threadId)) return;
    try {
      setSending(true);
      const { url } = await uploadImage('post', imageUri);
      const text = caption.trim();
      const pendingReply = getPendingReply();
      if (kind === 'group') {
        sendGroup(user.id, threadId, text, url, undefined, pendingReply ?? undefined);
      } else if (otherUserId) {
        sendDm(user.id, Number(otherUserId), threadId, text, url, undefined, pendingReply ?? undefined);
      } else {
        setSending(false);
        return;
      }
      setPendingReply(null);
      markThreadActive({ kind: kind === 'group' ? 'group' : 'dm', id: threadId });
      onSent();
    } catch (e) {
      console.error('Failed to send photo:', e);
      setSending(false);
    }
  };

  const sendButton = (
    <Pressable
      onPress={handleSend}
      disabled={sending}
      accessibilityRole="button"
      className="flex-row items-center justify-center rounded-full active:opacity-80"
      style={{
        height: Math.round(36 * SEND_SCALE),
        minWidth: Math.round(84 * SEND_SCALE),
        paddingHorizontal: Math.round(16 * SEND_SCALE),
        gap: Math.round(8 * SEND_SCALE),
        backgroundColor: wuzyColors.yellow,
      }}>
      {sending ? (
        <ActivityIndicator size="small" color={wuzyColors.bg} />
      ) : (
        <>
          <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: Math.round(wuzyType.small * SEND_SCALE), color: wuzyColors.bg }}>
            Send
          </Text>
          <Ionicons name="arrow-forward" size={Math.round(wuzyType.small * SEND_SCALE)} color={wuzyColors.bg} />
        </>
      )}
    </Pressable>
  );

  const rowText = { fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.white };

  return (
    <Screen>
      <CameraHeader title={label} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: wuzyLayout.gap + 10, paddingBottom: wuzyLayout.gap }}>
          {imageUri && (
            <View style={viewport}>
              <Image source={imageUri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            </View>
          )}

          <TextInput
            className="rounded-full"
            style={{
              ...rowText,
              height: wuzyLayout.control,
              marginTop: wuzyLayout.itemGap,
              paddingVertical: 0,
              paddingHorizontal: 16,
              backgroundColor: wuzyColors.yellowDim,
              textAlignVertical: 'center',
              textAlign: 'left',
            }}
            placeholder="Write a caption"
            placeholderTextColor={wuzyColors.gray}
            value={caption}
            onChangeText={setCaption}
          />

          <View className="w-full items-center" style={{ marginTop: 20 }}>
            {sendButton}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}