from dataclasses import dataclass

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import ApiException
from app.core.firebase import verify_bearer_token

_bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(slots=True)
class AuthContext:
    user_id: str
    email: str | None
    display_name: str | None
    photo_url: str | None


def get_auth_context(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> AuthContext:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise ApiException(
            status_code=401,
            code="missing_token",
            message="Authorization bearer token is required.",
        )

    decoded_token = verify_bearer_token(credentials.credentials)
    return AuthContext(
        user_id=str(decoded_token.get("uid", "")),
        email=decoded_token.get("email"),
        display_name=decoded_token.get("name"),
        photo_url=decoded_token.get("picture"),
    )
