from datetime import datetime
from uuid import uuid4

from app.models.autocura import AutocuraContent, AutocuraProgram, AutocuraSession

_PROGRAMS: dict[str, AutocuraProgram] = {}
_SESSIONS: dict[str, AutocuraSession] = {}


def load_seed_programs() -> None:
    if _PROGRAMS:
        return

    program = AutocuraProgram(
        id=str(uuid4()),
        slug="purificacao-do-templo-sagrado",
        title="Purificacao do Templo Sagrado",
        description="Programa derivado das telas Portal da Autocura e Guia pela Voz da Alma.",
        is_active=True,
        contents=[
            AutocuraContent(
                id=str(uuid4()),
                slug="guia-pela-voz-da-alma",
                title="Guia pela Voz da Alma",
                content_type="audio",
                body_text=(
                    "Feche os olhos, relaxe os ombros e sinta o ar fluindo naturalmente. "
                    "Visualize uma luz dourada e pura descendo sobre o topo da sua cabeça, "
                    "percorrendo seu corpo até o sistema digestivo."
                ),
                media_url=None,
                duration_seconds=180,
                sort_order=1,
            ),
        ],
    )
    _PROGRAMS[program.slug] = program


def list_programs() -> list[AutocuraProgram]:
    load_seed_programs()
    return list(_PROGRAMS.values())


def get_program(slug: str) -> AutocuraProgram | None:
    load_seed_programs()
    return _PROGRAMS.get(slug)


def list_sessions(user_id: str) -> list[AutocuraSession]:
    sessions = [item for item in _SESSIONS.values() if item.user_id == user_id]
    return sorted(sessions, key=lambda item: item.started_at.isoformat())


def get_session(session_id: str) -> AutocuraSession | None:
    return _SESSIONS.get(session_id)


def save_session(session: AutocuraSession) -> AutocuraSession:
    if not session.id:
        session.id = str(uuid4())
    session.updated_at = datetime.utcnow()
    _SESSIONS[session.id] = session
    return session


def delete_session(session_id: str) -> bool:
    return _SESSIONS.pop(session_id, None) is not None
