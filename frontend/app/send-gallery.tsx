import { useRouter } from 'expo-router';

import { PhotoSendFrame } from '@/components/camera/PhotoSendFrame';
import { getPendingPhoto } from '@/lib/media';

/** Send frame in the chat gallery flow: the picked gallery photo with a
 * caption pill and Send button, sharing PhotoSendFrame with the camera path.
 * Pushed straight from the chat's gallery overlay, so both the header back
 * button and the post-send pop return to it with the picker still open. */
export default function SendGalleryScreen() {
  const router = useRouter();

  return <PhotoSendFrame label="GALLERY" imageUri={getPendingPhoto()} onSent={() => router.back()} />;
}