"""Authentication.

JWTs via the Authorization bearer header. Every protected route decodes and
verifies the token's signature and expiry before trusting the user id, so a
stolen or forged value is rejected before it reaches any handler.
"""

from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: int) -> str:
    """Issue a signed, expiring token for a user id."""
    expires = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expires}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> int:
    """Extract and verify the authenticated user's id from the bearer token."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from None

    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token subject") from None

    if user_id <= 0:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    return user_id
