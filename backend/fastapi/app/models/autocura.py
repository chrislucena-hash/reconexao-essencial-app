from dataclasses import dataclass, field
from datetime import datetime


@dataclass(slots=True)
class AutocuraContent:
    id: str
    slug: str
    title: str
    content_type: str
    body_text: str | None
    media_url: str | None
    duration_seconds: int | None
    sort_order: int


@dataclass(slots=True)
class AutocuraProgram:
    id: str
    slug: str
    title: str
    description: str
    is_active: bool
    contents: list[AutocuraContent] = field(default_factory=list)


@dataclass(slots=True)
class AutocuraSession:
    id: str
    user_id: str
    program_slug: str
    content_slug: str
    started_at: datetime
    completed: bool = False
    interruption_reason: str | None = None
    ended_at: datetime | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
