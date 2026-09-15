import type { AudioPlayer } from 'expo-audio';

/**
 * Keeps voice notes single-playing: pausing whatever note was active when a
 * new one starts. Players are owned by the components that mount them
 * (useAudioPlayer auto-releases on unmount); this module only borrows them to
 * pause, and drops the reference when a note is released or unmounted.
 */
let activeId: string | null = null;
let activePlayer: AudioPlayer | null = null;

export function playVoiceNote(id: string, player: AudioPlayer): void {
  if (activeId !== null && activeId !== id && activePlayer) {
    activePlayer.pause();
  }
  activeId = id;
  activePlayer = player;
}

export function releaseVoiceNote(id: string): void {
  if (activeId === id) {
    activeId = null;
    activePlayer = null;
  }
}