from app.core.exceptions import ApiException
from app.core.security import AuthContext
from app.models.autocura import AutocuraSession
from app.repositories import auth_repository, autocura_repository
from app.schemas.autocura import (
    AutocuraProgramPayload,
    AutocuraSessionPayload,
    AutocuraSessionUpsertRequest,
)


def list_programs() -> list[AutocuraProgramPayload]:
    return [_program_to_payload(item) for item in autocura_repository.list_programs()]


def get_program(program_slug: str) -> AutocuraProgramPayload:
    program = autocura_repository.get_program(program_slug)
    if program is None:
        raise ApiException(status_code=404, code="autocura_program_not_found", message="Autocura program not found.")
    return _program_to_payload(program)


def list_contents(program_slug: str) -> list[dict]:
    program = autocura_repository.get_program(program_slug)
    if program is None:
        raise ApiException(status_code=404, code="autocura_program_not_found", message="Autocura program not found.")
    return [
        {
            "id": item.id,
            "slug": item.slug,
            "title": item.title,
            "contentType": item.content_type,
            "bodyText": item.body_text,
            "mediaUrl": item.media_url,
            "durationSeconds": item.duration_seconds,
            "sortOrder": item.sort_order,
        }
        for item in program.contents
    ]


def list_sessions(auth_context: AuthContext) -> list[AutocuraSessionPayload]:
    user = _get_user(auth_context)
    return [_session_to_payload(item) for item in autocura_repository.list_sessions(user.id)]


def get_session(session_id: str, auth_context: AuthContext) -> AutocuraSessionPayload:
    user = _get_user(auth_context)
    session = autocura_repository.get_session(session_id)
    if session is None or session.user_id != user.id:
        raise ApiException(status_code=404, code="autocura_session_not_found", message="Autocura session not found.")
    return _session_to_payload(session)


def upsert_session(
    payload: AutocuraSessionUpsertRequest,
    auth_context: AuthContext,
    session_id: str | None = None,
) -> AutocuraSessionPayload:
    user = _get_user(auth_context)
    program = autocura_repository.get_program(payload.programSlug)
    if program is None:
        raise ApiException(status_code=404, code="autocura_program_not_found", message="Autocura program not found.")
    content_slugs = {item.slug for item in program.contents}
    if payload.contentSlug not in content_slugs:
        raise ApiException(
            status_code=422,
            code="autocura_content_mismatch",
            message="The informed contentSlug does not belong to the selected programSlug.",
            field="contentSlug",
        )

    session = AutocuraSession(
        id=session_id or "",
        user_id=user.id,
        program_slug=payload.programSlug,
        content_slug=payload.contentSlug,
        started_at=payload.startedAt,
        ended_at=payload.endedAt,
        completed=payload.completed,
        interruption_reason=payload.interruptionReason,
    )
    saved_session = autocura_repository.save_session(session)
    return _session_to_payload(saved_session)


def delete_session(session_id: str, auth_context: AuthContext) -> dict[str, str]:
    user = _get_user(auth_context)
    session = autocura_repository.get_session(session_id)
    if session is None or session.user_id != user.id:
        raise ApiException(status_code=404, code="autocura_session_not_found", message="Autocura session not found.")
    autocura_repository.delete_session(session_id)
    return {"message": "Autocura session deleted."}


def _get_user(auth_context: AuthContext):
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        raise ApiException(status_code=404, code="user_not_found", message="Authenticated user was not found.")
    return user


def _program_to_payload(program) -> AutocuraProgramPayload:
    return AutocuraProgramPayload(
        id=program.id,
        slug=program.slug,
        title=program.title,
        description=program.description,
        isActive=program.is_active,
        contents=[
            {
                "id": item.id,
                "slug": item.slug,
                "title": item.title,
                "contentType": item.content_type,
                "bodyText": item.body_text,
                "mediaUrl": item.media_url,
                "durationSeconds": item.duration_seconds,
                "sortOrder": item.sort_order,
            }
            for item in program.contents
        ],
    )


def _session_to_payload(session: AutocuraSession) -> AutocuraSessionPayload:
    return AutocuraSessionPayload(
        id=session.id,
        userId=session.user_id,
        programSlug=session.program_slug,
        contentSlug=session.content_slug,
        startedAt=session.started_at,
        endedAt=session.ended_at,
        completed=session.completed,
        interruptionReason=session.interruption_reason,
        createdAt=session.created_at,
        updatedAt=session.updated_at,
    )
