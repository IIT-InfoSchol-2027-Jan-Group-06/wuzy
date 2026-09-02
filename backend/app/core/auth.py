"""Authentication dependency.

Currently uses a simple X-User-Id header for identification.
Replace with JWT validation once the auth service is implemented.
"""

from fastapi import Header, HTTPException


def get_current_user_id(x_user_id: int = Header(...)) -> int:
    """Extract the authenticated user's ID from the request header.

    The frontend must send `X-User-Id: <user_id>` on every request.
    Returns the integer user ID.
    """
    if x_user_id <= 0:
        raise HTTPException(status_code=401, detail="Invalid user ID")
    return x_user_id
