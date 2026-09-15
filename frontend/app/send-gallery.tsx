import { useRouter } from 'expo-router';

import { PhotoSendFrame } from '@/components/camera/PhotoSendFrame';
import { getPendingPhoto } from '@/lib/media';

/** Send frame in the chat gallery flow: the picked gallery photo with a
 * caption pill and Send button, sharing PhotoSendFrame with the camera path.
 * Pushed from the chat's gallery overlay right after it compresses both
 * popups, so a header back or the post-send pop lands on a clean thread. */
export default function SendGalleryScreen() {
  const router = useRouter();

  return <PhotoSendFrame label="GALLERY" imageUri={getPendingPhoto()} onSent={() => router.back()} />;
}