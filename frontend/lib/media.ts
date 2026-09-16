import type { ReplyContext } from '@/lib/ws';

// The camera temp path contains literal percent-encoding (%40, %2F), which
// router params corrupt. Pass it out-of-band instead of through the URL.
let pendingPhotoUri: string | null = null;

export function setPendingPhoto(uri: string | null) {
  pendingPhotoUri = uri;
}

export function getPendingPhoto(): string | null {
  return pendingPhotoUri;
}

// A chat reply being carried into the pushed camera/gallery flow, which cannot
// reach the chat route's state. Mirror of pendingPhotoUri: the chat route keeps
// it in sync, and PhotoSendFrame clears it once the photo is actually sent so a
// returned chat does not keep a stale reply pinned.
let pendingReply: ReplyContext | null = null;

export function setPendingReply(reply: ReplyContext | null) {
  pendingReply = reply;
}

export function getPendingReply(): ReplyContext | null {
  return pendingReply;
}