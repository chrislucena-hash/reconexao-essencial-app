from datetime import datetime
from uuid import uuid4

from app.models.fasting import FastingSession

_SESSIONS: dict[str, FastingSession] = {}


def list_sessions(user_id: str) -> list[FastingSession]:
    sessions = [item for item in _SESSIONS.values() if item.user_id == user_id]
    return sorted(sessions, key=lambda item: item.started_at.isoformat())


def get_session(session_id: str) -> FastingSession | None:
    return _SESSIONS.get(session_id)


def save_session(session: FastingSession) -> FastingSession:
    if not session.id:
        session.id = str(uuid4())
    session.updated_at = datetime.utcnow()
    _SESSIONS[session.id] = session
    return session


def delete_session(session_id: str) -> bool:
    return _SESSIONS.pop(session_id, None) is not None
