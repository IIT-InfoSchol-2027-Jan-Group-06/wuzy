import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBar } from '@/components/chat/MessageBar';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyLayout } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { useChatUnread } from '@/context/chat-unread';
import { apiGet, assetUrl, type ApiUser } from '@/lib/api';
import { markThreadActive } from '@/lib/chat-activity';
import { getMessages, type ThreadKind } from '@/lib/chat-db';
import { acquireChat, sendDm, sendGroup, subscribeChat, type ChatMessage } from '@/lib/ws';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

export default function ChatViewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { markThreadRead } = useChatUnread();
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: string }>();
  const isGroup = kind === 'group';
  const threadId = Number(id);
  const threadKind: ThreadKind = isGroup ? 'group' : 'dm';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatName, setChatName] = useState('Chat');
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !Number.isFinite(threadId)) return;

    // Keep the shared socket alive while this thread is on screen and pipe
    // this thread's inbound frames into the list. Frames are persisted by
    // ws.ts already, so the listener only re-renders and clears the badge.
    const releaseSocket = acquireChat(user.id);
    const unsubscribe = subscribeChat((m) => {
      const isThisThread =
        m.group_id != null ? m.group_id === threadId : m.conversation_id === threadId;
      if (!isThisThread || m.from === user.id) return;
      setMessages((prev) => [...prev, m]);
      markThreadRead(threadKind, threadId);
    });

    let active = true;
    (async () => {
      // Load the thread's locally-cached history first.
      const history = (await getMessages(user.id, threadKind, threadId)).map((m) => ({
        type: 'message' as const,
        from: m.from,
        from_name: m.from_name,
        to: undefined,
        conversation_id: m.kind === 'dm' ? m.thread_id : undefined,
        group_id: m.kind === 'group' ? m.thread_id : undefined,
        text: m.text,
        created_at: m.created_at,
      }));
      if (!active) return;
      setMessages(history);
      markThreadRead(threadKind, threadId);

      // Resolve the header from the right source: a 1:1 peer or the group.
      if (isGroup) {
        try {
          const group = await apiGet<{ id: number; name: string; members: ApiUser[] }>(
            `/groups/${threadId}`,
          );
          if (!active) return;
          setChatName(group.name);
          setMemberCount(group.members.length);
          const firstAvatar = group.members.find((m) => m.id !== user.id)?.avatar_url;
          setAvatar(firstAvatar ? { uri: assetUrl(firstAvatar) } : defaultAvatar);
        } catch {
          router.back();
          return;
        }
      } else {
        try {
          const other = await apiGet<ApiUser>(`/chat/conversations/${threadId}/peer`);
          if (!active) return;
          setChatName(other.display_name ?? other.username);
          setAvatar(other.avatar_url ? { uri: assetUrl(other.avatar_url) } : defaultAvatar);
          setOtherUserId(other.id);
        } catch {
          router.back();
          return;
        }
      }

      if (active) setLoading(false);
    })();

    return () => {
      active = false;
      unsubscribe();
      releaseSocket();
    };
  }, [user, threadId, threadKind, isGroup, router, markThreadRead]);

  const send = useCallback(
    (text: string) => {
      if (!user) return;
      if (isGroup) {
        setMessages((prev) => [...prev, sendGroup(user.id, threadId, text)]);
      } else if (otherUserId) {
        setMessages((prev) => [...prev, sendDm(user.id, otherUserId, threadId, text)]);
      }
      markThreadActive({ kind: threadKind, id: threadId });
    },
    [user, isGroup, threadId, threadKind, otherUserId],
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
          status={isGroup ? `${memberCount} members` : 'Online'}
          onBack={() => router.back()}
          onUserPress={!isGroup && otherUserId ? () => router.push(`/profile/${otherUserId}`) : undefined}
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
            <ChatBubble
              text={item.text}
              outgoing={item.from === user?.id}
              name={isGroup && item.from !== user?.id ? item.from_name ?? undefined : undefined}
            />
          )}
        />

        <View style={{ paddingBottom: wuzyLayout.itemGap }}>
          <MessageBar onSend={send} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}