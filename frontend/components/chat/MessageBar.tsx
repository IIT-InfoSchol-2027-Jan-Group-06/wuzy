import React from 'react';
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { File } from 'expo-file-system';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { GlassNavButton } from '@/components/GlassNavButton';
import { formatVoiceTime, Waveform, recordingLevels, staticLevels } from '@/components/chat/Waveform';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { uploadImage } from '@/lib/api';
import { releaseVoiceNote, playVoiceNote } from '@/lib/voice-player';
import type { ThreadKind } from '@/lib/chat-db';

type VoicePhase = 'idle' | 'recording' | 'preview';

const PREVIEW_KEY = 'preview';
const WAVE_MUTED = 'rgba(255, 231, 131, 0.4)';

export function MessageBar({
  onSend,
  onSendVoiceNote,
  threadId,
  threadKind,
  otherUserId,
  attachOpen,
  onAttachOpenChange,
  onOpenGallery,
}: {
  onSend?: (text: string) => void;
  /** Sends a finished voice note (audio URL + duration ms) into the thread. */
  onSendVoiceNote: (audioUrl: string, durationMs: number) => void;
  /** The thread this bar is attached to; the camera flow sends back into it. */
  threadId: number;
  threadKind: ThreadKind;
  /** DM recipient, needed so the camera flow can address the message. */
  otherUserId?: number;
  /** Controlled attach-sheet visibility: the chat route owns it so it can keep
   * the sheet open under the gallery overlay and close both together. */
  attachOpen: boolean;
  onAttachOpenChange: (open: boolean) => void;
  /** The Gallery attachment opens a full-screen photo overlay above the sheet. */
  onOpenGallery: () => void;
}) {
  const router = useRouter();
  const iconSize = 20;
  const gap = wuzyLayout.itemGap;
  const sendSize = 32;

  const [text, setText] = React.useState('');
  const hasText = text.length > 0;

  // Voice-note flow: idle -> recording -> preview. The whole bar swaps to a
  // recording row (trash | waveform+timer | Send) and then a preview row
  // (trash | playable waveform | Send) where the second Send tap uploads.
  const [phase, setPhase] = React.useState<VoicePhase>('idle');
  const [voiceUri, setVoiceUri] = React.useState<string | null>(null);
  const [voiceDurationMs, setVoiceDurationMs] = React.useState(0);
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [micDenied, setMicDenied] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: 'document',
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, 200);
  const previewPlayer = useAudioPlayer(voiceUri ?? null);
  const previewStatus = useAudioPlayerStatus(previewPlayer);

  // 0 = only attach and mic, 1 = send button revealed at their right
  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withTiming(hasText ? 1 : 0, {
      duration: 220,
      easing: Easing.inOut(Easing.ease),
    });
  }, [hasText, progress]);

  // 0 = sheet hidden, 1 = risen above the bar
  const sheet = useSharedValue(0);
  React.useEffect(() => {
    sheet.value = withTiming(attachOpen ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [attachOpen, sheet]);

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: sheet.value,
    transform: [{ translateY: (1 - sheet.value) * 64 }],
  }));

  // attach and mic collapse away as the send door slides in, so the
  // partially revealed send never overlaps them; negative margins cancel
  // the row gaps while either side is collapsed
  const attachMicWidth = iconSize * 2 + gap;
  const iconsStyle = useAnimatedStyle(() => ({
    width: (1 - progress.value) * attachMicWidth,
    opacity: 1 - progress.value,
    marginLeft: interpolate(progress.value, [0, 1], [0, -gap]),
  }));
  const sendStyle = useAnimatedStyle(() => ({
    width: progress.value * sendSize,
    marginLeft: interpolate(progress.value, [0, 1], [-gap, 0]),
  }));

  // Reset the playback position once a preview finishes so a later tap replays
  // from the top instead of resuming at 0:00.
  React.useEffect(() => {
    if (previewStatus.didJustFinish) {
      releaseVoiceNote(PREVIEW_KEY);
      previewPlayer.seekTo(0);
    }
  }, [previewStatus.didJustFinish, previewPlayer]);

  const resetVoice = () => {
    releaseVoiceNote(PREVIEW_KEY);
    setPhase('idle');
    setVoiceUri(null);
    setVoiceDurationMs(0);
    setSending(false);
    setText('');
  };

  const startRecording = async () => {
    onAttachOpenChange(false);
    Keyboard.dismiss();
    const status = await getRecordingPermissionsAsync();
    if (status.status !== 'granted') {
      const requested = await requestRecordingPermissionsAsync();
      if (!requested.granted) {
        setMicDenied(true);
        return;
      }
    }
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setText('');
      setVoiceUri(null);
      setVoiceDurationMs(0);
      setPhase('recording');
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  };

  // First Send tap while recording: stop and finalize the local file, then
  // switch the bar to preview. Nothing is sent or uploaded yet.
  const finishRecording = async () => {
    try {
      await recorder.stop();
    } catch (e) {
      console.error('Failed to stop recording:', e);
    }
    setVoiceUri(recorder.uri ?? null);
    setVoiceDurationMs(recorderState.durationMillis);
    setPhase('preview');
  };

  const togglePreview = () => {
    if (previewStatus.playing) {
      previewPlayer.pause();
      releaseVoiceNote(PREVIEW_KEY);
    } else {
      playVoiceNote(PREVIEW_KEY, previewPlayer);
      previewPlayer.play();
    }
  };

  // Trash tap. While recording the note is paused (not stopped or discarded)
  // so a "No" can resume it; in preview any playing audio is paused too.
  const confirmDelete = () => {
    if (phase === 'recording') {
      recorder.pause();
    } else {
      previewPlayer.pause();
      releaseVoiceNote(PREVIEW_KEY);
    }
    setDeleteDialog(true);
  };

  const discardVoiceNote = async () => {
    setDeleteDialog(false);
    releaseVoiceNote(PREVIEW_KEY);
    if (phase === 'recording' || voiceUri == null) {
      try {
        await recorder.stop();
      } catch (e) {
        console.error('Failed to stop recording:', e);
      }
    }
    const uri = voiceUri ?? recorder.uri;
    if (uri) {
      try {
        const file = new File(uri);
        if (file.exists) await file.delete();
      } catch (e) {
        console.error('Failed to delete recording:', e);
      }
    }
    resetVoice();
  };

  const keepRecording = () => {
    setDeleteDialog(false);
    if (phase === 'recording') {
      recorder.record();
    }
  };

  // Second Send tap from preview: upload the file, then hand the URL off so
  // the route can send the voice_note and append it optimistically.
  const sendVoiceNote = async () => {
    if (!voiceUri || sending) return;
    setSending(true);
    try {
      const { url } = await uploadImage('audio', voiceUri);
      onSendVoiceNote(url, Math.max(1, Math.round(voiceDurationMs)));
      resetVoice();
    } catch (e) {
      console.error('Failed to send voice note:', e);
      setSending(false);
    }
  };

  const openCamera = () => {
    onAttachOpenChange(false);
    router.push({
      pathname: '/camera',
      params: {
        id: String(threadId),
        kind: threadKind,
        otherUserId: otherUserId != null ? String(otherUserId) : '',
      },
    });
  };

  const voiceRow = (
    <View className="flex-row items-center" style={{ gap: 10 }}>
      <Pressable
        onPress={confirmDelete}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Delete voice note"
        style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="trash-outline" size={iconSize} color={wuzyColors.yellow} />
      </Pressable>

      {phase === 'recording' ? (
        <View className="flex-1 flex-row items-center" style={{ gap: 8 }}>
          <Waveform
            levels={recordingLevels(recorderState.durationMillis, recorderState.metering)}
            progress={1}
            color={wuzyColors.yellow}
            mutedColor={WAVE_MUTED}
          />
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
            {formatVoiceTime(recorderState.durationMillis)}
          </Text>
        </View>
      ) : (
        <Pressable
          className="flex-1 flex-row items-center active:opacity-80"
          style={{ gap: 8 }}
          onPress={togglePreview}
          accessibilityRole="button"
          accessibilityLabel={previewStatus.playing ? 'Pause voice note' : 'Play voice note'}>
          <Ionicons
            name={previewStatus.playing ? 'pause' : 'play'}
            size={16}
            color={previewStatus.playing ? wuzyColors.bg : wuzyColors.yellow}
            style={{ backgroundColor: previewStatus.playing ? wuzyColors.yellow : 'transparent', borderRadius: 9 }}
          />
          <Waveform
            levels={staticLevels(22, voiceDurationMs)}
            progress={previewStatus.duration > 0 ? previewStatus.currentTime / previewStatus.duration : 0}
            color={wuzyColors.yellow}
            mutedColor={WAVE_MUTED}
          />
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.white }}>
            {formatVoiceTime(voiceDurationMs)}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={phase === 'recording' ? finishRecording : sendVoiceNote}
        disabled={sending}
        accessibilityRole="button"
        accessibilityLabel="Send voice note"
        className="flex-row items-center justify-center rounded-full active:opacity-80"
        style={{
          height: 34,
          minWidth: 76,
          paddingHorizontal: 14,
          gap: 6,
          backgroundColor: wuzyColors.yellow,
        }}>
        {sending ? (
          <ActivityIndicator size="small" color={wuzyColors.bg} />
        ) : (
          <>
            <Text style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, color: wuzyColors.bg }}>
              Send
            </Text>
            <Ionicons name="arrow-forward" size={14} color={wuzyColors.bg} />
          </>
        )}
      </Pressable>
    </View>
  );

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View
        pointerEvents={attachOpen ? 'auto' : 'none'}
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: wuzyLayout.control + 10,
            alignItems: 'flex-end',
          },
          sheetStyle,
        ]}>
        <View
          style={{
            flexDirection: 'column',
            gap: wuzyLayout.itemGap,
            backgroundColor: wuzyColors.surface,
            borderColor: wuzyColors.surfaceBorder,
            borderWidth: 1,
            borderRadius: 24,
            padding: wuzyLayout.itemGap,
          }}>
          <GlassNavButton icon="camera-outline" tintColor={wuzyColors.yellowDim} onPress={openCamera} accessibilityLabel="Camera" />
          <GlassNavButton icon="images-outline" tintColor={wuzyColors.yellowDim} onPress={onOpenGallery} accessibilityLabel="Gallery" />
        </View>
      </Animated.View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap,
          height: wuzyLayout.control,
          paddingHorizontal: 16,
          backgroundColor: '#3B3A2D',
          borderRadius: 9999,
        }}>
        {phase === 'idle' ? (
          <>
            <Ionicons name="happy-outline" size={iconSize} color={wuzyColors.white} />
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message"
              placeholderTextColor={wuzyColors.gray}
              style={{
                flex: 1,
                minWidth: 0,
                alignSelf: 'stretch',
                textAlignVertical: 'center',
                fontSize: wuzyType.body,
                color: wuzyColors.white,
                fontFamily: wuzyFonts.body,
                letterSpacing: 0.15,
                paddingVertical: 0,
              }}
            />
            <Animated.View
              style={[{ flexDirection: 'row', alignItems: 'center', gap, overflow: 'hidden' }, iconsStyle]}>
              <Pressable
                onPress={startRecording}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Record voice note"
                style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="mic-outline" size={iconSize} color={wuzyColors.white} />
              </Pressable>
              <Pressable
                onPress={() => onAttachOpenChange(!attachOpen)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Attach"
                style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="attach-outline" size={iconSize} color={wuzyColors.white} />
              </Pressable>
            </Animated.View>
            <Animated.View style={[{ alignItems: 'flex-end', overflow: 'hidden' }, sendStyle]}>
              <Pressable
                onPress={() => {
                  const trimmed = text.trim();
                  if (trimmed) onSend?.(trimmed);
                  setText('');
                }}
                accessibilityRole="button"
                accessibilityLabel="Send"
                style={{
                  width: sendSize,
                  height: sendSize,
                  borderRadius: sendSize / 2,
                  backgroundColor: wuzyColors.yellowMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="send" size={Math.round(sendSize * 0.5)} color={wuzyColors.bg} />
              </Pressable>
            </Animated.View>
          </>
        ) : (
          voiceRow
        )}
      </View>

      <ConfirmDialog
        visible={deleteDialog}
        title="Do you want to delete voice note?"
        message="This cannot be undone."
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={discardVoiceNote}
        onCancel={keepRecording}
      />
      <ConfirmDialog
        visible={micDenied}
        title="Microphone access needed"
        message="Allow microphone access to record voice notes. If it stays blocked, turn it on in your device settings."
        confirmLabel="OK"
        cancelLabel="Cancel"
        onConfirm={() => setMicDenied(false)}
        onCancel={() => setMicDenied(false)}
      />
    </View>
  );
}