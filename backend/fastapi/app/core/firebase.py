from typing import Any

import firebase_admin
from firebase_admin import auth, credentials

from app.core.config import get_settings
from app.core.exceptions import ApiException


def initialize_firebase() -> None:
    settings = get_settings()
    if _firebase_is_initialized():
        return
    if not settings.firebase_credentials_path and not settings.firebase_project_id:
        return

    if settings.firebase_credentials_path:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        options = {"projectId": settings.firebase_project_id} if settings.firebase_project_id else None
        firebase_admin.initialize_app(cred, options)
        return

    firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})


def verify_bearer_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    if settings.allow_insecure_dev_auth and token == settings.dev_auth_token:
        return {
            "uid": "dev-user",
            "email": "dev@reconexao.dev",
            "name": "Dev User",
            "picture": None,
        }

    if not _firebase_is_initialized():
        raise ApiException(
            status_code=503,
            code="auth_unavailable",
            message="Firebase auth is not configured on the server.",
        )

    try:
        return auth.verify_id_token(token, check_revoked=True)
    except Exception as exc:
        raise ApiException(
            status_code=401,
            code="invalid_token",
            message="Invalid or expired bearer token.",
        ) from exc


def _firebase_is_initialized() -> bool:
    try:
        firebase_admin.get_app()
        return True
    except ValueError:
        return False
