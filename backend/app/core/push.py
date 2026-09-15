"""Expo push notifications for chat messages sent while a user is away.

One endpoint call hands a notification to Expo's push service, which delivers
it to the device's OS notification tray. We use stdlib urllib so adding push
support costs no new dependency. Sending is best-effort: a dead token or a
failed network call is dropped silently rather than blocking message routing.
"""

import json
import urllib.request

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_push(
    token: str,
    title: str,
    body: str,
    data: dict,
    channel: str | None = None,
    category: str | None = None,
) -> None:
    """Fire one Expo push notification. Never raises.

    channel picks the Android channel the client registered; category adds the
    action buttons (e.g. referral accept/decline) the client defined for it.
    """
    request = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "data": data,
    }
    if channel:
        request["channelId"] = channel
    if category:
        request["categoryId"] = category
    encoded = json.dumps(request).encode()
    req = urllib.request.Request(
        EXPO_PUSH_URL,
        data=encoded,
        headers={"Content-Type": "application/json"},
    )
    try:
        urllib.request.urlopen(req, timeout=10)
    except OSError:
        pass
