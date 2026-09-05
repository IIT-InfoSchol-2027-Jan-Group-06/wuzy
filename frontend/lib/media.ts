// The camera temp path contains literal percent-encoding (%40, %2F), which
// router params corrupt. Pass it out-of-band instead of through the URL.
let pendingPhotoUri: string | null = null;

export function setPendingPhoto(uri: string | null) {
  pendingPhotoUri = uri;
}

export function getPendingPhoto(): string | null {
  return pendingPhotoUri;
}