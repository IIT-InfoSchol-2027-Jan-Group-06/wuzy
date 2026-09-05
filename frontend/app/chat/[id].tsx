import React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { Chip } from '@/components/Chip';
import { MessageBar } from '@/components/chat/MessageBar';
import { chatMessages, chatThreads, type ThreadMessage } from '@/constants/chat-data';
import { wuzyColors } from '@/constants/wuzy-theme';

export default function ChatViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / 375;

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
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: wuzyColors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ marginTop: Math.round(18 * scale), paddingBottom: Math.round(8 * scale) }}>
          <ChatHeader name={chat.name} avatar={chat.avatar} status="Online" onBack={() => router.back()} />
        </View>

        <FlatList
          data={reversed}
          inverted
          keyExtractor={(_, index) => String(index)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <View style={{ marginBottom: Math.round(6 * scale) }}>
              <View style={{ alignSelf: 'center' }}>
                <Chip label={thread.date} />
              </View>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: Math.round(20 * scale),
            paddingVertical: Math.round(12 * scale),
            gap: Math.round(12 * scale),
          }}
          renderItem={({ item }) => <ChatBubble text={item.text} outgoing={item.out} />}
        />

        <View style={{ paddingBottom: Math.round(12 * scale) }}>
          <MessageBar onSend={send} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
