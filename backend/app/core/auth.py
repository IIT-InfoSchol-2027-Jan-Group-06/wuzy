"""Authentication.

JWTs via the Authorization bearer header. Every protected route decodes and
verifies the token's signature and expiry before trusting the user id, so a
stolen or forged value is rejected before it reaches any handler.

get_current_user_id is a FastAPI dependency: routes that include it as a
Depends get an int user_id and are guaranteed the token was valid.
"""

from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

# auto_error=False so we can return our own 401 message instead of
# FastAPI's default empty response when no Authorization header is present.
bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: int) -> str:
    """Issue a signed, expiring token for a user id.

    The user id is stored in the 'sub' (subject) claim and the expiry in 'exp'.
    Signing with the secret key means the token cannot be forged or modified
    without knowing the key.
    """
    expires = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expires}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> int:
    """Extract and verify the authenticated user's id from the bearer token.

    Returns 401 if the token is missing, malformed, expired, or has an
    invalid subject. This dependency is what turns on auth for any route
    that declares it.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    # Verify signature and expiry first; jwt raises on either failure.
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from None

    # The subject must be a plausible user id. Guard against malformed
    # or arbitrary values in the token payload.
    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token subject") from None

    if user_id <= 0:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    return user_id
