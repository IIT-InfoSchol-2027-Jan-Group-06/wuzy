import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatVoiceTime, Waveform, staticLevels } from '@/components/chat/Waveform';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';
import { assetUrl } from '@/lib/api';
import { playVoiceNote, releaseVoiceNote } from '@/lib/voice-player';

/** One playable voice note inside a ChatBubble. Only one note app-wide plays
 * at a time (see lib/voice-player); the fill follows playback progress. */
export function VoiceNoteBubble({
  audioUrl,
  durationMs,
  outgoing,
}: {
  /** Server-relative audio URL. */
  audioUrl: string;
  durationMs: number;
  outgoing: boolean;
}) {
  const player = useAudioPlayer(assetUrl(audioUrl));
  const status = useAudioPlayerStatus(player);
  const id = `voice-${audioUrl}`;

  // Reset to the top once the note finishes, so a later tap replays it.
  useEffect(() => {
    if (status.didJustFinish) {
      releaseVoiceNote(id);
      player.seekTo(0);
    }
  }, [status.didJustFinish, player, id]);

  const accent = outgoing ? wuzyColors.bg : wuzyColors.yellow;
  const muted = outgoing ? 'rgba(10, 15, 23, 0.35)' : 'rgba(255, 255, 255, 0.35)';
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  const toggle = () => {
    if (status.playing) {
      player.pause();
      releaseVoiceNote(id);
    } else {
      playVoiceNote(id, player);
      player.play();
    }
  };

  return (
    <View className="flex-row items-center" style={{ gap: 10 }}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pause voice note' : 'Play voice note'}
        className="active:opacity-80"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: wuzyColors.yellow,
        }}>
        <Ionicons name={status.playing ? 'pause' : 'play'} size={18} color={wuzyColors.bg} />
      </Pressable>
      <Waveform levels={staticLevels(22, durationMs)} progress={progress} color={accent} mutedColor={muted} />
      <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: accent }}>
        {formatVoiceTime(durationMs)}
      </Text>
    </View>
  );
}