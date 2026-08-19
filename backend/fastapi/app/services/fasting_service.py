from app.core.exceptions import ApiException
from app.core.security import AuthContext
from app.models.fasting import FastingSession
from app.repositories import auth_repository, fasting_repository
from app.schemas.fasting import FASTING_LABEL_TO_HOURS, FastingSessionPayload, FastingSessionUpsertRequest


def list_sessions(auth_context: AuthContext) -> list[FastingSessionPayload]:
    user = _get_user(auth_context)
    return [_to_payload(item) for item in fasting_repository.list_sessions(user.id)]


def get_session(session_id: str, auth_context: AuthContext) -> FastingSessionPayload:
    user = _get_user(auth_context)
    session = fasting_repository.get_session(session_id)
    if session is None or session.user_id != user.id:
        raise ApiException(status_code=404, code="fasting_not_found", message="Fasting session not found.")
    return _to_payload(session)


def upsert_session(
    payload: FastingSessionUpsertRequest,
    auth_context: AuthContext,
    session_id: str | None = None,
) -> FastingSessionPayload:
    user = _get_user(auth_context)
    hours = payload.selectedWindowHours or FASTING_LABEL_TO_HOURS[payload.selectedWindowLabel]
    session = FastingSession(
        id=session_id or "",
        user_id=user.id,
        selected_window_label=payload.selectedWindowLabel,
        selected_window_hours=hours,
        started_at=payload.startedAt,
        ended_at=payload.endedAt,
        status=payload.status,
        source=payload.source,
    )
    saved_session = fasting_repository.save_session(session)
    return _to_payload(saved_session)


def delete_session(session_id: str, auth_context: AuthContext) -> dict[str, str]:
    user = _get_user(auth_context)
    session = fasting_repository.get_session(session_id)
    if session is None or session.user_id != user.id:
        raise ApiException(status_code=404, code="fasting_not_found", message="Fasting session not found.")
    fasting_repository.delete_session(session_id)
    return {"message": "Fasting session deleted."}


def _get_user(auth_context: AuthContext):
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        raise ApiException(status_code=404, code="user_not_found", message="Authenticated user was not found.")
    return user


def _to_payload(session: FastingSession) -> FastingSessionPayload:
    return FastingSessionPayload(
        id=session.id,
        userId=session.user_id,
        selectedWindowLabel=session.selected_window_label,
        selectedWindowHours=session.selected_window_hours,
        startedAt=session.started_at,
        endedAt=session.ended_at,
        status=session.status,
        source=session.source,
        createdAt=session.created_at,
        updatedAt=session.updated_at,
    )
