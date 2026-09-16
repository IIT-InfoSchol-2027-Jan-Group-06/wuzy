import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, View, type LayoutChangeEvent } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { GalleryPopup } from '@/components/chat/GalleryPopup';
import { MessageBar } from '@/components/chat/MessageBar';
import { ReplyBubble, ReplyPreview } from '@/components/chat/ReplyPreview';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { wuzyColors, wuzyLayout } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { useChatUnread } from '@/context/chat-unread';
import { apiGet, assetUrl, type ApiUser } from '@/lib/api';
import { markThreadActive } from '@/lib/chat-activity';
import { getMessages, type ThreadKind } from '@/lib/chat-db';
import { getPendingReply, setPendingPhoto, setPendingReply } from '@/lib/media';
import { acquireChat, sendDm, sendGroup, subscribeChat, type ChatMessage, type ReplyContext } from '@/lib/ws';

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
  // compress both popups together once a gallery picture is picked (or on the
  // gallery's X button).
  const [attachOpen, setAttachOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  // The message currently being replied to. Drives the preview above the bar
  // and, once sent, the reply block attached to the outgoing message.
  const [reply, setReply] = useState<ReplyContext | null>(null);

  // Mirror the active reply into the out-of-band slot so a photo sent from the
  // pushed camera/gallery flow (which cannot reach this route's state) carries
  // the quote too. Cleared the same way the local reply is.
  useEffect(() => {
    setPendingReply(reply);
  }, [reply]);

  // TEMP DEBUG: console.log keyboard + KAV metrics for the avoidance fix. Remove after.
  const insets = useSafeAreaInsets();
  const kavFrame = useRef({ y: 0, height: 0 });

  useEffect(() => {
    const log = (label: string, kbH: number, kbY: number) => {
      const pad = Math.max(kavFrame.current.y + kavFrame.current.height - kbY, 0);
      const padWithOffset = Math.max(
        kavFrame.current.y + kavFrame.current.height - (kbY - insets.top),
        0,
      );
      console.log(
        '[kbd]',
        label,
        'insetsTop',
        insets.top,
        'kbH',
        kbH,
        'kbY',
        kbY,
        'kavY',
        kavFrame.current.y,
        'kavH',
        kavFrame.current.height,
        'pad',
        pad,
        'padWithOffset',
        padWithOffset,
      );
    };
    const show = Keyboard.addListener('keyboardDidShow', (e) =>
      log('show', e.endCoordinates.height, e.endCoordinates.screenY),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => log('hide', 0, 0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [insets.top]);

  const onKavLayoutDebug = useCallback((e: LayoutChangeEvent) => {
    kavFrame.current = { y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height };
    console.log(
      '[kbd] kavLayout y',
      e.nativeEvent.layout.y,
      'height',
      e.nativeEvent.layout.height,
    );
  }, []);

  // Reload the thread's locally-cached history from disk. Runs on first focus
  // and on every return, so a photo sent from the camera flow shows up in the
  // thread when the flow pops back here.
  const reloadHistory = useCallback(async () => {
    if (!user) return;
    const history: ChatMessage[] = (await getMessages(user.id, threadKind, threadId)).map((m) => ({
      type: m.audio_url ? 'voice_note' : 'message',
      from: m.from,
      from_name: m.from_name,
      to: undefined,
      conversation_id: m.kind === 'dm' ? m.thread_id : undefined,
      group_id: m.kind === 'group' ? m.thread_id : undefined,
      text: m.text,
      media_url: m.media_url,
      audio_url: m.audio_url,
      duration_ms: m.duration_ms,
      reply: m.reply ?? null,
      created_at: m.created_at,
    }));
    setMessages(history);
    markThreadRead(threadKind, threadId);
  }, [user, threadId, threadKind, markThreadRead]);

  useFocusEffect(
    useCallback(() => {
      reloadHistory();
      // Any return from a pushed flow (camera, gallery send) lands on the
      // thread with the attach sheet collapsed.
      setAttachOpen(false);
      // A photo send consumed the pending reply in the pushed flow, so drop the
      // stale preview above the bar. An abandoned flow leaves the slot set and
      // the reply survives.
      if (getPendingReply() === null) setReply(null);
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

  // Pin a message as the current reply context. Swiping your own message
  // replies to yourself; swiping an incoming one replies to the sender.
  // The server fills from_name for group frames, but DMs can arrive without
  // it, so fall back to the resolved peer (the thread's chatName) whenever the
  // replied-to message is not your own.
  const buildReply = useCallback(
    (m: ChatMessage): ReplyContext => ({
      type: m.audio_url ? 'voice_note' : 'message',
      from: m.from,
      from_name: m.from_name ?? (!isGroup && m.from !== user?.id ? chatName : null),
      text: m.text,
      media_url: m.media_url,
      audio_url: m.audio_url,
      duration_ms: m.duration_ms,
    }),
    [user?.id, isGroup, chatName],
  );

  // APR label for a reply block: the picture's caption when it has one,
  // otherwise "You" for your own message or the original sender's name.
  const replyLabel = useCallback(
    (r: ReplyContext): string => {
      if (r.media_url && r.text) return r.text;
      if (r.from === user?.id) return 'You';
      return r.from_name ?? chatName;
    },
    [user?.id, chatName],
  );

  const send = useCallback(
    (text: string) => {
      if (!user) return;
      if (isGroup) {
        setMessages((prev) => [
          ...prev,
          sendGroup(user.id, threadId, text, undefined, undefined, reply ?? undefined),
        ]);
      } else if (otherUserId) {
        setMessages((prev) => [
          ...prev,
          sendDm(user.id, otherUserId, threadId, text, undefined, undefined, reply ?? undefined),
        ]);
      }
      setReply(null);
      markThreadActive({ kind: threadKind, id: threadId });
    },
    [user, isGroup, threadId, threadKind, otherUserId, reply],
  );

  const openGallery = () => {
    // The attach sheet stays open beneath the overlay so the gallery's X can
    // dismiss both together, but the sheet pops back down on the X tap (kept
    // in sync by the overlay's onClose) or immediately on a pick.
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setAttachOpen(false);
  };

  const selectGalleryImage = (_galleryId: string, uri: string) => {
    // Picking a picture compresses both popups on the spot, then the send
    // frame pushes on top of the thread. The resolved file path goes
    // out-of-band like the camera's pending photo.
    setGalleryOpen(false);
    setAttachOpen(false);
    setPendingPhoto(uri);
    router.push({
      pathname: '/send-gallery',
      params: {
        id: String(threadId),
        kind: threadKind,
        otherUserId: otherUserId != null ? String(otherUserId) : '',
      },
    });
  };

  // Send a finished voice note: optimistic append into the thread, same shape
  // as the gallery's photo-send callback in send-gallery.tsx.
  const sendVoiceNote = useCallback(
    (audioUrl: string, durationMs: number) => {
      if (!user) return;
      if (isGroup) {
        setMessages((prev) => [
          ...prev,
          sendGroup(user.id, threadId, '', undefined, { audioUrl, durationMs }, reply ?? undefined),
        ]);
      } else if (otherUserId) {
        setMessages((prev) => [
          ...prev,
          sendDm(
            user.id,
            otherUserId,
            threadId,
            '',
            undefined,
            { audioUrl, durationMs },
            reply ?? undefined,
          ),
        ]);
      }
      setReply(null);
      markThreadActive({ kind: threadKind, id: threadId });
    },
    [user, isGroup, threadId, threadKind, otherUserId, reply],
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
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={insets.top} style={{ flex: 1 }} onLayout={onKavLayoutDebug}>
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
          renderItem={({ item }) => {
            const outgoing = item.from === user?.id;
            const side = outgoing ? 'flex-end' : 'flex-start';
            const bubble = (
              <ChatBubble
                text={item.text}
                outgoing={outgoing}
                name={isGroup && !outgoing ? item.from_name ?? undefined : undefined}
                mediaUrl={item.media_url}
                audioUrl={item.audio_url}
                durationMs={item.duration_ms}
                onReply={() => setReply(buildReply(item))}
                squareTop={!!item.reply}
                stretch={!!item.reply}
              />
            );
            return (
              <View style={{ alignItems: side }}>
                {item.reply ? (
                  <View style={{ alignItems: 'stretch', maxWidth: '75%' }}>
                    <ReplyBubble
                      reply={item.reply}
                      outgoing={outgoing}
                      label={replyLabel(item.reply)}
                      stacked
                    />
                    {bubble}
                  </View>
                ) : (
                  bubble
                )}
              </View>
            );
          }}
        />

        {reply && (
          <ReplyPreview
            reply={reply}
            outgoing
            label={replyLabel(reply)}
            onClose={() => setReply(null)}
          />
        )}

        <View style={{ paddingBottom: wuzyLayout.itemGap }}>
          <MessageBar
            onSend={send}
            onSendVoiceNote={sendVoiceNote}
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
        <GalleryPopup onSelect={selectGalleryImage} onClose={closeGallery} />
      )}
    </Screen>
  );
}