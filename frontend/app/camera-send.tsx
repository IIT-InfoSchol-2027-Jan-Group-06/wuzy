import { useRouter } from 'expo-router';

import { PhotoSendFrame } from '@/components/camera/PhotoSendFrame';
import { getPendingPhoto } from '@/lib/media';

/** Send frame in the chat camera flow, the third frame (capture, confirm,
 * send): the confirmed picture with a caption pill and Send button, shared via
 * PhotoSendFrame with the gallery send frame. Send pops the whole camera flow
 * (camera, confirm, send) back to the chat. */
export default function CameraSendScreen() {
  const router = useRouter();

  return <PhotoSendFrame label="CAMERA" imageUri={getPendingPhoto()} onSent={() => router.dismiss(3)} />;
}