import React from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBar } from '@/components/chat/MessageBar';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyLayout } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { apiGet, apiPost, assetUrl, type ApiMessage } from '@/lib/api';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

export default function ChatViewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [messages, setMessages] = React.useState<ApiMessage[]>([]);
  const [chatName, setChatName] = React.useState('Chat');
  const [avatar, setAvatar] = React.useState(defaultAvatar);
  const [otherUserId, setOtherUserId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = useCallback(async () => {
    if (!user || !id) return;
    try {
      const data = await apiGet<ApiMessage[]>(`/chat/conversations/${id}/messages`);
      setMessages(data);
      const other = data.find((m) => m.sender_id !== user.id)?.sender;
      if (other) {
        setChatName(other.display_name ?? other.username);
        setAvatar(other.avatar_url ? { uri: assetUrl(other.avatar_url) } : defaultAvatar);
        setOtherUserId(other.id);
      }
    } catch {
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const send = useCallback(
    async (text: string) => {
      if (!user) return;
      try {
        const sent = await apiPost<ApiMessage>(`/chat/conversations/${id}/messages`, { text });
        setMessages((prev) => [...prev, sent]);
      } catch {
        // Keep the text where it is by not touching state; user can retry.
      }
    },
    [user, id],
  );

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
      </Screen>
    );
  }

  // Inverted list keeps the newest message pinned to the bottom, so a shrinking
  // viewport (keyboard) never hides it. Data is reversed to match.
  const reversed = [...messages].reverse();
  const date = messages[0]?.created_at ?? null;
  const dateLabel = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : '';

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ChatHeader
          name={chatName}
          avatar={avatar}
          status="Online"
          onBack={() => router.back()}
          onUserPress={otherUserId ? () => router.push(`/profile/${otherUserId}`) : undefined}
        />

        <FlatList
          data={reversed}
          inverted
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            dateLabel ? (
              <View className="self-center" style={{ marginBottom: wuzyLayout.itemGap }}>
                <Chip label={dateLabel} />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingVertical: wuzyLayout.gap, gap: wuzyLayout.itemGap }}
          renderItem={({ item }) => <ChatBubble text={item.text} outgoing={item.sender_id === user?.id} />}
        />

        <View style={{ paddingBottom: wuzyLayout.itemGap }}>
          <MessageBar onSend={send} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}