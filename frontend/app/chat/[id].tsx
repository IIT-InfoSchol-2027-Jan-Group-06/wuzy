import React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBar } from '@/components/chat/MessageBar';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { chatMessages, chatThreads, type ThreadMessage } from '@/constants/chat-data';
import { wuzyLayout } from '@/constants/wuzy-theme';

export default function ChatViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const chat = chatMessages.find((msg) => msg.id === id);
  const thread = chatThreads[id ?? ''];
  const [messages, setMessages] = React.useState<ThreadMessage[]>(thread?.messages ?? []);

  if (!chat || !thread) {
    return <Redirect href="/chat" />;
  }

  const send = (text: string) => setMessages((prev) => [...prev, { text, out: true }]);

  // Inverted list keeps the newest message pinned to the bottom, so a shrinking
  // viewport (keyboard) never hides it. Data is reversed to match.
  const reversed = [...messages].reverse();

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ChatHeader name={chat.name} avatar={chat.avatar} status="Online" onBack={() => router.back()} />

        <FlatList
          data={reversed}
          inverted
          keyExtractor={(_, index) => String(index)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <View className="self-center" style={{ marginBottom: wuzyLayout.itemGap }}>
              <Chip label={thread.date} />
            </View>
          }
          contentContainerStyle={{ paddingVertical: wuzyLayout.gap, gap: wuzyLayout.itemGap }}
          renderItem={({ item }) => <ChatBubble text={item.text} outgoing={item.out} />}
        />

        <View style={{ paddingBottom: wuzyLayout.itemGap }}>
          <MessageBar onSend={send} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
