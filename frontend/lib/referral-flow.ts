// Session-scoped memory of which resolved referrals the sender has finished
// looking at (Done on the QR screen, or the declined flash). Backed up by the
// server's `consumed` flag, so a resolved referral never shows its old outcome
// again even across re-fetch, re-navigation, or a fresh session.

const consumedLocally = new Set<number>();

/** Forget a referral's resolved-state display. Permanent for this session. */
export function markReferralConsumedLocally(id: number): void {
  consumedLocally.add(id);
}

/** Whether the sender has already finished this referral's resolved-state UI. */
export function isReferralConsumedLocally(id: number): boolean {
  return consumedLocally.has(id);
}