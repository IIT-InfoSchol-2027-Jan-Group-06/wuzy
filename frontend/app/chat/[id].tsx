import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { GalleryPopup } from '@/components/chat/GalleryPopup';
import { MessageBar } from '@/components/chat/MessageBar';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyLayout } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { useChatUnread } from '@/context/chat-unread';
import { apiGet, assetUrl, type ApiUser } from '@/lib/api';
import { markThreadActive } from '@/lib/chat-activity';
import { getMessages, type ThreadKind } from '@/lib/chat-db';
import { setPendingPhoto } from '@/lib/media';
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

  // Attach sheet and photo-gallery overlay, owned here so the chat route can
  // keep both up while the gallery send frame is stacked on top and close them
  // together on the X button.
  const [attachOpen, setAttachOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  // Set only when the gallery pushes its send frame, so a focus return there
  // is told apart from the camera flow (which collapses the sheet).
  const galleryReturnRef = useRef(false);

  // Reload the thread's locally-cached history from disk. Runs on first focus
  // and on every return, so a photo sent from the camera flow shows up in the
  // thread when the flow pops back here.
  const reloadHistory = useCallback(async () => {
    if (!user) return;
    const history = (await getMessages(user.id, threadKind, threadId)).map((m) => ({
      type: 'message' as const,
      from: m.from,
      from_name: m.from_name,
      to: undefined,
      conversation_id: m.kind === 'dm' ? m.thread_id : undefined,
      group_id: m.kind === 'group' ? m.thread_id : undefined,
      text: m.text,
      media_url: m.media_url,
      created_at: m.created_at,
    }));
    setMessages(history);
    markThreadRead(threadKind, threadId);
  }, [user, threadId, threadKind, markThreadRead]);

  useFocusEffect(
    useCallback(() => {
      reloadHistory();
      // Returning from the gallery send frame keeps the attach sheet and the
      // gallery overlay up (only the pick is cleared); any other return, e.g.
      // the camera flow, lands on the thread with the sheet closed.
      if (galleryReturnRef.current) {
        galleryReturnRef.current = false;
        setSelectedGalleryId(null);
      } else {
        setAttachOpen(false);
      }
    }, [reloadHistory]),
  );

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

  const openGallery = () => {
    setSelectedGalleryId(null);
    // The attach sheet stays open beneath the overlay so closing the gallery
    // can dismiss both together.
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setAttachOpen(false);
  };

  const selectGalleryImage = (galleryId: string, uri: string) => {
    // The resolved file path goes out-of-band like the camera's pending photo.
    setPendingPhoto(uri);
    galleryReturnRef.current = true;
    setSelectedGalleryId(galleryId);
    router.push({
      pathname: '/send-gallery',
      params: {
        id: String(threadId),
        kind: threadKind,
        otherUserId: otherUserId != null ? String(otherUserId) : '',
      },
    });
  };

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
          keyExtractor={(item) => `${item.from}-${item.created_at}-${item.text}`}
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
              mediaUrl={item.media_url}
            />
          )}
        />

        <View style={{ paddingBottom: wuzyLayout.itemGap }}>
          <MessageBar
            onSend={send}
            threadId={threadId}
            threadKind={threadKind}
            otherUserId={otherUserId ?? undefined}
            attachOpen={attachOpen}
            onAttachOpenChange={setAttachOpen}
            onOpenGallery={openGallery}
          />
        </View>
      </KeyboardAvoidingView>

      {galleryOpen && (
        <GalleryPopup
          selectedId={selectedGalleryId}
          onSelect={selectGalleryImage}
          onClose={closeGallery}
        />
      )}
    </Screen>
  );
}