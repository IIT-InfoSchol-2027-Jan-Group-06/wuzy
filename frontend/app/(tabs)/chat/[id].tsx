import React from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { DateChip } from '@/components/chat/DateChip';
import { MessageBar } from '@/components/chat/MessageBar';
import { chatMessages, chatThreads } from '@/constants/chat-data';
import { wuzyColors } from '@/constants/wuzy-theme';

export default function ChatViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / 375;
  const [keyboardShown, setKeyboardShown] = React.useState(false);

  React.useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardShown(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const chat = chatMessages.find((msg) => msg.id === id);
  const thread = chatThreads[id ?? ''];

  if (!chat || !thread) {
    router.back();
    return null;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: wuzyColors.bg }}>
      {/* enabled gate forces the padding back to 0 on hide, which Android's
          KeyboardAvoidingView fails to do by itself under edge-to-edge */}
      <KeyboardAvoidingView behavior="padding" enabled={keyboardShown} style={{ flex: 1 }}>
        <View style={{ marginTop: Math.round(18 * scale) }}>
          <ChatHeader
            name={chat.name}
            avatar={chat.avatar}
            status="Online"
            onBack={() => router.back()}
            onCall={() => {}}
            onVideoCall={() => {}}
          />
        </View>

        <FlatList
          data={thread.messages}
          keyExtractor={(_, index) => String(index)}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: Math.round(6 * scale) }}>
              <DateChip label={thread.date} />
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: Math.round(20 * scale),
            paddingTop: Math.round(22 * scale),
            paddingBottom: Math.round(12 * scale),
            gap: Math.round(12 * scale),
          }}
          renderItem={({ item }) => <ChatBubble text={item.text} outgoing={item.out} />}
        />

        <View style={{ paddingBottom: Math.round(12 * scale) }}>
          <MessageBar />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
