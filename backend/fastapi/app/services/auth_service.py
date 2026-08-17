from app.core.exceptions import ApiException
from app.core.security import AuthContext
from app.models.auth import AuthUser
from app.repositories import auth_repository
from app.schemas.auth import AuthUserPayload, LoginRequest, PasswordResetRequest, RegistrationRequest
from app.schemas.common import MessagePayload


def register_user(payload: RegistrationRequest) -> AuthUserPayload:
    user = auth_repository.create_or_update_user(
        firebase_uid=payload.firebaseUid,
        email=str(payload.email),
        display_name=payload.displayName,
        photo_url=payload.photoUrl,
        phone_number=payload.phoneNumber,
        email_verified=payload.emailVerified,
    )
    return _to_payload(user)


def sync_user(payload: RegistrationRequest, auth_context: AuthContext) -> AuthUserPayload:
    if payload.firebaseUid != auth_context.user_id:
        raise ApiException(
            status_code=403,
            code="forbidden_user_sync",
            message="firebaseUid does not match the authenticated user.",
            field="firebaseUid",
        )
    return register_user(payload)


def get_current_user(auth_context: AuthContext) -> AuthUserPayload:
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        user = auth_repository.create_or_update_user(
            firebase_uid=auth_context.user_id,
            email=auth_context.email or f"{auth_context.user_id}@unknown.local",
            display_name=auth_context.display_name,
            photo_url=auth_context.photo_url,
            phone_number=None,
            email_verified=bool(auth_context.email),
        )
    return _to_payload(user)


def update_current_user(payload: RegistrationRequest, auth_context: AuthContext) -> AuthUserPayload:
    return sync_user(payload, auth_context)


def delete_current_user(auth_context: AuthContext) -> MessagePayload:
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        raise ApiException(status_code=404, code="user_not_found", message="Authenticated user was not found.")
    auth_repository.soft_delete_user(user.id)
    return MessagePayload(message="User marked as deleted.")


def login(_: LoginRequest) -> MessagePayload:
    raise ApiException(
        status_code=501,
        code="firebase_managed_login",
        message="The current frontend uses Firebase Auth directly. Backend password login is disabled.",
    )


def request_password_reset(_: PasswordResetRequest) -> MessagePayload:
    return MessagePayload(
        message="Password reset should be handled by Firebase Auth in the current frontend flow.",
    )


def _to_payload(user: AuthUser) -> AuthUserPayload:
    return AuthUserPayload(
        id=user.id,
        firebaseUid=user.firebase_uid,
        email=user.email,
        displayName=user.display_name,
        photoUrl=user.photo_url,
        phoneNumber=user.phone_number,
        emailVerified=user.email_verified,
        createdAt=user.created_at,
        updatedAt=user.updated_at,
        lastLoginAt=user.last_login_at,
    )
