import React from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBar } from '@/components/chat/MessageBar';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyLayout } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { apiGet, assetUrl, type ApiUser } from '@/lib/api';
import { getMessages, saveMessage } from '@/lib/chat-db';
import { connectChat, type ChatMessage, type ChatSocket } from '@/lib/ws';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

export default function ChatViewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Number(id);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatName, setChatName] = useState('Chat');
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<ChatSocket | null>(null);

  useEffect(() => {
    if (!user || !Number.isFinite(conversationId)) return;

    let active = true;
    (async () => {
      // Load the thread's locally-cached history first, then connect live.
      const history = (await getMessages(user.id, conversationId)).map((m) => ({
        ...m,
        type: 'message' as const,
      }));
      if (!active) return;
      setMessages(history);

      // Resolve who the other party is. Messages are ephemeral on the server;
      // the thread shows the local cache plus anything that arrives live.
      let other: ApiUser | null = null;
      try {
        other = await apiGet<ApiUser>(`/chat/conversations/${conversationId}/peer`);
      } catch {
        router.back();
        return;
      }
      if (!active) return;

      if (other) {
        setChatName(other.display_name ?? other.username);
        setAvatar(other.avatar_url ? { uri: assetUrl(other.avatar_url) } : defaultAvatar);
        setOtherUserId(other.id);
      }

      const socket = await connectChat(user.id, conversationId, (m) => {
        saveMessage(user.id, m);
        setMessages((prev) => [...prev, m]);
      });
      socketRef.current = socket;
      setLoading(false);
    })();

    return () => {
      active = false;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [user, conversationId, router]);

  const send = useCallback(
    (text: string) => {
      if (!user || !otherUserId) return;
      const optimistic: ChatMessage = {
        type: 'message',
        from: user.id,
        to: otherUserId,
        conversation_id: conversationId,
        text,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      saveMessage(user.id, optimistic);
      socketRef.current?.send(otherUserId, text);
    },
    [user, otherUserId, conversationId],
  );

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
      </Screen>
    );
  }

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
          keyExtractor={(item, index) => `${item.created_at}-${index}`}
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
          renderItem={({ item }) => (
            <ChatBubble text={item.text} outgoing={item.from === user?.id} />
          )}
        />

        <View style={{ paddingBottom: wuzyLayout.itemGap }}>
          <MessageBar onSend={send} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
