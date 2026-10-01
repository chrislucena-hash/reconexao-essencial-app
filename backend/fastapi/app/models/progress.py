from dataclasses import dataclass, field
from datetime import date, datetime


@dataclass(slots=True)
class UserProgress:
    id: str
    user_id: str
    module_slug: str
    status: str
    progress_percent: float
    last_seen_at: datetime | None = None
    updated_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class EvolutionSnapshot:
    id: str
    user_id: str
    snapshot_date: date
    energia: float | None
    presenca: float | None
    vibracao_media: float | None
    source_entry_id: str | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
