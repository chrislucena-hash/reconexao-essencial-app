from app.core.exceptions import ApiException
from app.core.security import AuthContext
from app.repositories import auth_repository, progress_repository
from app.schemas.progress import UserProgressPayload, UserProgressUpsertRequest


def list_progress(auth_context: AuthContext) -> list[UserProgressPayload]:
    user = _get_user(auth_context)
    return [_to_payload(item) for item in progress_repository.list_progress(user.id)]


def upsert_progress(module_slug: str, payload: UserProgressUpsertRequest, auth_context: AuthContext) -> UserProgressPayload:
    user = _get_user(auth_context)
    progress = progress_repository.upsert_progress(
        user_id=user.id,
        module_slug=module_slug,
        status=payload.status,
        progress_percent=payload.progressPercent,
        last_seen_at=payload.lastSeenAt,
    )
    return _to_payload(progress)


def delete_progress(module_slug: str, auth_context: AuthContext) -> dict[str, str]:
    user = _get_user(auth_context)
    deleted = progress_repository.delete_progress(user.id, module_slug)
    if not deleted:
        raise ApiException(status_code=404, code="progress_not_found", message="Progress item not found.")
    return {"message": "Progress item deleted."}


def _get_user(auth_context: AuthContext):
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        raise ApiException(status_code=404, code="user_not_found", message="Authenticated user was not found.")
    return user


def _to_payload(progress) -> UserProgressPayload:
    return UserProgressPayload(
        id=progress.id,
        userId=progress.user_id,
        moduleSlug=progress.module_slug,
        status=progress.status,
        progressPercent=progress.progress_percent,
        lastSeenAt=progress.last_seen_at,
        updatedAt=progress.updated_at,
    )
